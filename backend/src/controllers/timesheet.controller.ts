import { Response } from 'express';
import { Timesheet, TimesheetStatus } from '../models/Timesheet';
import { ShiftAssignment } from '../models/ShiftAssignment';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { Shift } from '../models/Shift';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const createTimesheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.body;

    const assignment = await ShiftAssignment.findByPk(assignmentId, {
      include: [
        { model: Shift, as: 'shift', include: [{ model: Employer, as: 'employer' }] },
        { model: Worker, as: 'worker' },
      ],
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    const timesheet = await Timesheet.create({
      assignmentId: assignment.id,
      workerId: assignment.workerId,
      employerId: assignment.shift?.employer?.id,
      status: TimesheetStatus.PENDING,
    });

    res.status(201).json({ timesheet });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create timesheet' });
    }
  }
};

export const clockIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const worker = await Worker.findOne({ where: { userId: req.userId } });

    const timesheet = await Timesheet.findOne({
      where: { id, workerId: worker?.id },
    });

    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    if (timesheet.clockInTime) {
      throw new AppError('Already clocked in', 400);
    }

    await timesheet.update({
      clockInTime: new Date(),
    });

    res.json({ timesheet, message: 'Clocked in successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to clock in' });
    }
  }
};

export const clockOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { breakDuration } = req.body;
    const worker = await Worker.findOne({ where: { userId: req.userId } });

    const timesheet = await Timesheet.findOne({
      where: { id, workerId: worker?.id },
      include: [{ model: ShiftAssignment, as: 'assignment', include: [{ model: Shift, as: 'shift' }] }],
    });

    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    if (!timesheet.clockInTime) {
      throw new AppError('Must clock in first', 400);
    }

    if (timesheet.clockOutTime) {
      throw new AppError('Already clocked out', 400);
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(timesheet.clockInTime);

    // Calculate total hours (excluding break)
    const totalMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60);
    const totalHours = ((totalMinutes - (breakDuration || 0)) / 60).toFixed(2);

    const hourlyRate = timesheet.assignment?.shift?.hourlyRate || 0;
    const totalAmount = (parseFloat(totalHours) * hourlyRate).toFixed(2);

    await timesheet.update({
      clockOutTime,
      breakDuration: breakDuration || 0,
      totalHours: parseFloat(totalHours),
      hourlyRate,
      totalAmount: parseFloat(totalAmount),
    });

    res.json({ timesheet, message: 'Clocked out successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to clock out' });
    }
  }
};

export const submitTimesheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const worker = await Worker.findOne({ where: { userId: req.userId } });

    const timesheet = await Timesheet.findOne({
      where: { id, workerId: worker?.id },
    });

    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    if (!timesheet.clockOutTime) {
      throw new AppError('Must clock out before submitting', 400);
    }

    if (timesheet.status !== TimesheetStatus.PENDING) {
      throw new AppError('Timesheet already submitted', 400);
    }

    await timesheet.update({
      status: TimesheetStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    // TODO: Send notification to employer

    res.json({ timesheet, message: 'Timesheet submitted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to submit timesheet' });
    }
  }
};

export const approveTimesheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employer = await Employer.findOne({ where: { userId: req.userId } });

    const timesheet = await Timesheet.findOne({
      where: { id, employerId: employer?.id },
      include: [
        { model: Worker, as: 'worker' },
        { model: ShiftAssignment, as: 'assignment' },
      ],
    });

    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new AppError('Timesheet must be submitted before approval', 400);
    }

    await timesheet.update({
      status: TimesheetStatus.APPROVED,
      approvedAt: new Date(),
    });

    // TODO: Trigger payment processing
    // TODO: Send notification to worker

    res.json({ timesheet, message: 'Timesheet approved successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to approve timesheet' });
    }
  }
};

export const rejectTimesheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const employer = await Employer.findOne({ where: { userId: req.userId } });

    const timesheet = await Timesheet.findOne({
      where: { id, employerId: employer?.id },
    });

    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    await timesheet.update({
      status: TimesheetStatus.REJECTED,
      notes,
    });

    // TODO: Send notification to worker

    res.json({ timesheet, message: 'Timesheet rejected' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to reject timesheet' });
    }
  }
};

export const getTimesheets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where: any = {};

    if (status) where.status = status;

    // Check if user is employer or worker
    const employer = await Employer.findOne({ where: { userId: req.userId } });
    const worker = await Worker.findOne({ where: { userId: req.userId } });

    if (employer) {
      where.employerId = employer.id;
    } else if (worker) {
      where.workerId = worker.id;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: timesheets } = await Timesheet.findAndCountAll({
      where,
      include: [
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' },
        { model: ShiftAssignment, as: 'assignment', include: [{ model: Shift, as: 'shift' }] },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      timesheets,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
};

export const getTimesheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.findByPk(id, {
      include: [
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' },
        { model: ShiftAssignment, as: 'assignment', include: [{ model: Shift, as: 'shift' }] },
      ],
    });

    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    res.json({ timesheet });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch timesheet' });
    }
  }
};
