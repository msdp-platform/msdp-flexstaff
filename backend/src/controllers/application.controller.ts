import { Response } from 'express';
import { Application, ApplicationStatus } from '../models/Application';
import { Worker } from '../models/Worker';
import { Shift } from '../models/Shift';
import { ShiftAssignment } from '../models/ShiftAssignment';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const applyForShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shiftId, coverMessage } = req.body;
    const worker = await Worker.findOne({ where: { userId: req.userId } });

    if (!worker) {
      throw new AppError('Worker profile not found', 404);
    }

    const shift = await Shift.findByPk(shiftId);
    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    if (shift.isFullyBooked) {
      throw new AppError('Shift is fully booked', 400);
    }

    const existingApplication = await Application.findOne({
      where: { shiftId, workerId: worker.id },
    });

    if (existingApplication) {
      throw new AppError('Already applied to this shift', 400);
    }

    const application = await Application.create({
      shiftId,
      workerId: worker.id,
      coverMessage,
    });

    res.status(201).json({ application });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to apply for shift' });
    }
  }
};

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shiftId } = req.query;
    const where: any = {};

    if (shiftId) where.shiftId = shiftId;

    const applications = await Application.findAll({
      where,
      include: [
        { model: Worker, as: 'worker' },
        { model: Shift, as: 'shift' },
      ],
    });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const acceptApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id, {
      include: [{ model: Shift, as: 'shift' }],
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.shift?.isFullyBooked) {
      throw new AppError('Shift is fully booked', 400);
    }

    await application.update({
      status: ApplicationStatus.ACCEPTED,
      respondedAt: new Date(),
    });

    await ShiftAssignment.create({
      shiftId: application.shiftId,
      workerId: application.workerId,
      applicationId: application.id,
    });

    await application.shift?.increment('filledPositions');

    res.json({ application, message: 'Application accepted' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to accept application' });
    }
  }
};

export const rejectApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    await application.update({
      status: ApplicationStatus.REJECTED,
      respondedAt: new Date(),
    });

    res.json({ application, message: 'Application rejected' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to reject application' });
    }
  }
};
