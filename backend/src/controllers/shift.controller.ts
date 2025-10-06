import { Response } from 'express';
import { Shift, ShiftStatus } from '../models/Shift';
import { Employer } from '../models/Employer';
import { Application } from '../models/Application';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export const createShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employer = await Employer.findOne({ where: { userId: req.userId } });
    if (!employer) {
      throw new AppError('Employer profile not found', 404);
    }

    const shift = await Shift.create({
      employerId: employer.id,
      ...req.body,
    });

    res.status(201).json({ shift });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create shift' });
    }
  }
};

export const getShifts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, industry, city, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (industry) where.industry = industry;
    if (city) where.city = city;
    if (dateFrom || dateTo) {
      where.shiftDate = {};
      if (dateFrom) where.shiftDate[Op.gte] = dateFrom;
      if (dateTo) where.shiftDate[Op.lte] = dateTo;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: shifts } = await Shift.findAndCountAll({
      where,
      include: [{ model: Employer, as: 'employer' }],
      limit: Number(limit),
      offset,
      order: [['shiftDate', 'ASC']],
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

export const getShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByPk(id, {
      include: [
        { model: Employer, as: 'employer' },
        { model: Application, as: 'applications' },
      ],
    });

    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    res.json({ shift });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch shift' });
    }
  }
};

export const updateShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employer = await Employer.findOne({ where: { userId: req.userId } });

    const shift = await Shift.findOne({
      where: { id, employerId: employer?.id },
    });

    if (!shift) {
      throw new AppError('Shift not found or unauthorized', 404);
    }

    await shift.update(req.body);

    res.json({ shift });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update shift' });
    }
  }
};

export const deleteShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employer = await Employer.findOne({ where: { userId: req.userId } });

    const shift = await Shift.findOne({
      where: { id, employerId: employer?.id },
    });

    if (!shift) {
      throw new AppError('Shift not found or unauthorized', 404);
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

export const publishShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employer = await Employer.findOne({ where: { userId: req.userId } });

    const shift = await Shift.findOne({
      where: { id, employerId: employer?.id },
    });

    if (!shift) {
      throw new AppError('Shift not found or unauthorized', 404);
    }

    await shift.update({ status: ShiftStatus.OPEN });

    res.json({ shift, message: 'Shift published successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to publish shift' });
    }
  }
};
