import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WorkerAvailability, AvailabilityStatus } from '../models/WorkerAvailability';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { Op } from 'sequelize';

// Get worker's availability slots
export const getMyAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const whereClause: any = { workerId: worker.id };

    if (startDate && endDate) {
      whereClause.availabilityDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const availability = await WorkerAvailability.findAll({
      where: whereClause,
      include: [
        {
          model: Employer,
          as: 'bookedByEmployer',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email', 'firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['availabilityDate', 'ASC'], ['startTime', 'ASC']],
    });

    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
};

// Get available workers for employers
export const getAvailableWorkers = async (req: Request, res: Response) => {
  try {
    const { date, startTime, endTime } = req.query;

    const whereClause: any = {
      status: AvailabilityStatus.AVAILABLE,
    };

    if (date) {
      whereClause.availabilityDate = date;
    }
    if (startTime && endTime) {
      whereClause.startTime = { [Op.lte]: startTime };
      whereClause.endTime = { [Op.gte]: endTime };
    }

    const availability = await WorkerAvailability.findAll({
      where: whereClause,
      include: [
        {
          model: Worker,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber'],
            },
          ],
        },
      ],
      order: [['availabilityDate', 'ASC'], ['startTime', 'ASC']],
    });

    res.json(availability);
  } catch (error) {
    console.error('Error fetching available workers:', error);
    res.status(500).json({ message: 'Failed to fetch available workers' });
  }
};

// Create availability slot
export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { availabilityDate, startTime, endTime, hourlyRate, notes } = req.body;

    if (!availabilityDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'Date, start time, and end time are required' });
    }

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    // Check for overlapping slots
    const overlapping = await WorkerAvailability.findOne({
      where: {
        workerId: worker.id,
        availabilityDate,
        status: { [Op.ne]: AvailabilityStatus.CANCELLED },
        [Op.or]: [
          {
            startTime: { [Op.lte]: startTime },
            endTime: { [Op.gt]: startTime },
          },
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gte]: endTime },
          },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({ message: 'This time slot overlaps with existing availability' });
    }

    const availability = await WorkerAvailability.create({
      workerId: worker.id,
      availabilityDate,
      startTime,
      endTime,
      hourlyRate: hourlyRate || worker.hourlyRateMin,
      notes,
      status: AvailabilityStatus.AVAILABLE,
    });

    res.status(201).json(availability);
  } catch (error) {
    console.error('Error creating availability:', error);
    res.status(500).json({ message: 'Failed to create availability' });
  }
};

// Update availability slot
export const updateAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { availabilityDate, startTime, endTime, hourlyRate, notes, status } = req.body;

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const availability = await WorkerAvailability.findOne({
      where: { id, workerId: worker.id },
    });

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    // Don't allow updating booked slots
    if (availability.status === AvailabilityStatus.BOOKED && status !== AvailabilityStatus.CANCELLED) {
      return res.status(400).json({ message: 'Cannot update booked availability slot' });
    }

    await availability.update({
      availabilityDate: availabilityDate || availability.availabilityDate,
      startTime: startTime || availability.startTime,
      endTime: endTime || availability.endTime,
      hourlyRate: hourlyRate !== undefined ? hourlyRate : availability.hourlyRate,
      notes: notes !== undefined ? notes : availability.notes,
      status: status || availability.status,
    });

    res.json(availability);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Failed to update availability' });
  }
};

// Delete availability slot
export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const availability = await WorkerAvailability.findOne({
      where: { id, workerId: worker.id },
    });

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    if (availability.status === AvailabilityStatus.BOOKED) {
      return res.status(400).json({ message: 'Cannot delete booked availability slot. Cancel it instead.' });
    }

    await availability.destroy();

    res.json({ message: 'Availability slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ message: 'Failed to delete availability' });
  }
};

// Book a worker's availability slot (Employer)
export const bookAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const employer = await Employer.findOne({ where: { userId } });
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const availability = await WorkerAvailability.findByPk(id, {
      include: [{ model: Worker }],
    });

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    if (availability.status !== AvailabilityStatus.AVAILABLE) {
      return res.status(400).json({ message: 'This slot is not available for booking' });
    }

    await availability.update({
      status: AvailabilityStatus.BOOKED,
      bookedByEmployerId: employer.id,
      bookedAt: new Date(),
    });

    const updatedAvailability = await WorkerAvailability.findByPk(id, {
      include: [
        { model: Worker, include: [{ model: User, as: 'user' }] },
        { model: Employer, as: 'bookedByEmployer', include: [{ model: User, as: 'user' }] },
      ],
    });

    // Send invitation notification to worker
    if (updatedAvailability?.worker?.user?.id) {
      await Notification.create({
        userId: updatedAvailability.worker.user.id,
        title: 'New Booking Invitation',
        message: `You have been booked by ${employer.companyName} for ${new Date(
          updatedAvailability.availabilityDate
        ).toLocaleDateString()} from ${updatedAvailability.startTime} to ${
          updatedAvailability.endTime
        }. Please confirm your availability.`,
        type: 'booking',
        isRead: false,
      });
    }

    // Send confirmation notification to employer
    await Notification.create({
      userId: userId!,
      title: 'Booking Confirmed',
      message: `You have successfully booked ${updatedAvailability?.worker?.firstName} ${
        updatedAvailability?.worker?.lastName
      } for ${new Date(updatedAvailability?.availabilityDate!).toLocaleDateString()} from ${
        updatedAvailability?.startTime
      } to ${updatedAvailability?.endTime}.`,
      type: 'booking',
      isRead: false,
    });

    res.json(updatedAvailability);
  } catch (error) {
    console.error('Error booking availability:', error);
    res.status(500).json({ message: 'Failed to book availability' });
  }
};

// Get employer's bookings
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const employer = await Employer.findOne({ where: { userId } });
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const bookings = await WorkerAvailability.findAll({
      where: {
        bookedByEmployerId: employer.id,
        status: AvailabilityStatus.BOOKED,
      },
      include: [
        {
          model: Worker,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber'],
            },
          ],
        },
      ],
      order: [['availabilityDate', 'ASC'], ['startTime', 'ASC']],
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};
