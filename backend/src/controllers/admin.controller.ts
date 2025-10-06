import { Response } from 'express';
import { User, UserRole, UserStatus } from '../models/User';
import { Employer } from '../models/Employer';
import { Worker } from '../models/Worker';
import { Shift } from '../models/Shift';
import { Application } from '../models/Application';
import { Payment } from '../models/Payment';
import { Timesheet } from '../models/Timesheet';
import { Rating } from '../models/Rating';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import sequelize from '../config/database';

// Dashboard Analytics
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalEmployers,
      totalWorkers,
      totalShifts,
      activeShifts,
      totalApplications,
      totalPayments,
      totalRevenue,
    ] = await Promise.all([
      User.count(),
      Employer.count(),
      Worker.count(),
      Shift.count(),
      Shift.count({ where: { status: 'open' } }),
      Application.count(),
      Payment.count({ where: { status: 'completed' } }),
      Payment.sum('platformFee', { where: { status: 'completed' } }),
    ]);

    // Get stats for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [
      newUsersThisMonth,
      newShiftsThisMonth,
      revenueThisMonth,
    ] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: currentMonth } } }),
      Shift.count({ where: { createdAt: { [Op.gte]: currentMonth } } }),
      Payment.sum('platformFee', {
        where: {
          status: 'completed',
          createdAt: { [Op.gte]: currentMonth },
        },
      }),
    ]);

    // Get average rating
    const avgRating = await Rating.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
    });

    res.json({
      overview: {
        totalUsers,
        totalEmployers,
        totalWorkers,
        totalShifts,
        activeShifts,
        totalApplications,
        totalPayments,
        totalRevenue: totalRevenue || 0,
        averageRating: avgRating?.get('avgRating') || 0,
      },
      thisMonth: {
        newUsers: newUsersThisMonth,
        newShifts: newShiftsThisMonth,
        revenue: revenueThisMonth || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Revenue Analytics
export const getRevenueAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30days' } = req.query;

    let dateFrom = new Date();
    if (period === '7days') {
      dateFrom.setDate(dateFrom.getDate() - 7);
    } else if (period === '30days') {
      dateFrom.setDate(dateFrom.getDate() - 30);
    } else if (period === '90days') {
      dateFrom.setDate(dateFrom.getDate() - 90);
    } else if (period === '12months') {
      dateFrom.setFullYear(dateFrom.getFullYear() - 1);
    }

    const payments = await Payment.findAll({
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: dateFrom },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('SUM', sequelize.col('platform_fee')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true,
    });

    res.json({ data: payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

// User Management
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.email = { [Op.iLike]: `%${search}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [
        { model: Employer, as: 'employer' },
        { model: Worker, as: 'worker' },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        { model: Employer, as: 'employer' },
        { model: Worker, as: 'worker' },
      ],
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.update({ status });

    res.json({ user, message: 'User status updated successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};

// Shift Management
export const getAllShiftsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, industry } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (industry) where.industry = industry;

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: shifts } = await Shift.findAndCountAll({
      where,
      include: [{ model: Employer, as: 'employer', include: [{ model: User, as: 'user' }] }],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      shifts,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
};

export const deleteShiftAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByPk(id);
    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    await shift.destroy();

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete shift' });
    }
  }
};

// Payment Management
export const getAllPaymentsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where: any = {};

    if (status) where.status = status;

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [
        { model: Worker, as: 'worker', include: [{ model: User, as: 'user' }] },
        { model: Employer, as: 'employer', include: [{ model: User, as: 'user' }] },
        { model: Timesheet, as: 'timesheet' },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      payments,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Dispute Management
export const getDisputes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: disputes } = await Timesheet.findAndCountAll({
      where: { status: 'disputed' },
      include: [
        { model: Worker, as: 'worker', include: [{ model: User, as: 'user' }] },
        { model: Employer, as: 'employer', include: [{ model: User, as: 'user' }] },
      ],
      limit: Number(limit),
      offset,
      order: [['updatedAt', 'DESC']],
    });

    res.json({
      disputes,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
};

// System Settings
export const getSystemSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement system settings storage (could use a settings table)
    const settings = {
      platformFeePercentage: 10,
      minimumHourlyRate: 10.42, // UK National Living Wage
      maxShiftHours: 12,
      autoApproveTimesheets: false,
      maintenanceMode: false,
    };

    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSystemSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = req.body;

    // TODO: Save to database
    res.json({ settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
