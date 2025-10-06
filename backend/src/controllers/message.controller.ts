import { Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { Shift } from '../models/Shift';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import NotificationService from '../services/notification.service';

// Helper function to check if chat is allowed for a shift
export const checkChatAllowed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shiftId } = req.params;

    const shift = await Shift.findByPk(shiftId);
    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    const now = new Date();
    const shiftDateTime = new Date(`${shift.shiftDate}T${shift.startTime}`);
    const timeDiffHours = Math.abs((now.getTime() - shiftDateTime.getTime()) / (1000 * 60 * 60));

    const allowed = timeDiffHours <= 1;
    const minutesUntilAllowed = allowed ? 0 : Math.round((timeDiffHours - 1) * 60);
    const minutesRemaining = allowed ? Math.round((1 - timeDiffHours) * 60) : 0;

    res.json({
      allowed,
      shift: {
        id: shift.id,
        title: shift.title,
        date: shift.shiftDate,
        startTime: shift.startTime,
      },
      minutesUntilAllowed,
      minutesRemaining,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to check chat availability' });
    }
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, messageText, shiftId } = req.body;

    if (!messageText || messageText.trim().length === 0) {
      throw new AppError('Message text is required', 400);
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      throw new AppError('Receiver not found', 404);
    }

    // If shift-related message, validate time window (+/- 1 hour)
    if (shiftId) {
      const shift = await Shift.findByPk(shiftId);
      if (!shift) {
        throw new AppError('Shift not found', 404);
      }

      const now = new Date();
      const shiftDateTime = new Date(`${shift.shiftDate}T${shift.startTime}`);
      const timeDiffHours = Math.abs((now.getTime() - shiftDateTime.getTime()) / (1000 * 60 * 60));

      if (timeDiffHours > 1) {
        throw new AppError('Chat is only available within 1 hour before or after the shift time', 403);
      }
    }

    const message = await Message.create({
      senderId: req.userId!,
      receiverId,
      messageText: messageText.trim(),
      shiftId,
    });

    // Send notification to receiver
    const sender = await User.findByPk(req.userId!);
    if (sender) {
      await NotificationService.notifyNewMessage(
        receiverId,
        sender.email,
        message.id
      );
    }

    // TODO: Send real-time notification via Socket.io

    res.status(201).json({ message });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all unique users that current user has messaged with
    const sentMessages = await Message.findAll({
      where: { senderId: req.userId! },
      attributes: ['receiverId'],
      group: ['receiverId'],
    });

    const receivedMessages = await Message.findAll({
      where: { receiverId: req.userId! },
      attributes: ['senderId'],
      group: ['senderId'],
    });

    const userIds = [
      ...new Set([
        ...sentMessages.map((m) => m.receiverId),
        ...receivedMessages.map((m) => m.senderId),
      ]),
    ];

    // Get last message with each user
    const conversations = await Promise.all(
      userIds.map(async (userId) => {
        const lastMessage = await Message.findOne({
          where: {
            [Op.or]: [
              { senderId: req.userId!, receiverId: userId },
              { senderId: userId, receiverId: req.userId! },
            ],
          },
          include: [
            { model: User, as: 'sender' },
            { model: User, as: 'receiver' },
          ],
          order: [['createdAt', 'DESC']],
        });

        const unreadCount = await Message.count({
          where: {
            senderId: userId,
            receiverId: req.userId!,
            readAt: null,
          },
        });

        return {
          user: await User.findByPk(userId),
          lastMessage,
          unreadCount,
        };
      })
    );

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: messages } = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          { senderId: req.userId!, receiverId: userId },
          { senderId: userId, receiverId: req.userId! },
        ],
      },
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'receiver' },
        { model: Shift, as: 'shift' },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'ASC']],
    });

    // Mark messages from other user as read
    await Message.update(
      { readAt: new Date() },
      {
        where: {
          senderId: userId,
          receiverId: req.userId!,
          readAt: null,
        },
      }
    );

    res.json({
      messages,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const message = await Message.findOne({
      where: { id, receiverId: req.userId! },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    await message.update({ readAt: new Date() });

    res.json({ message, success: 'Message marked as read' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await Message.count({
      where: {
        receiverId: req.userId!,
        readAt: null,
      },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};
