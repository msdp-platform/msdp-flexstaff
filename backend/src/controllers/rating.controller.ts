import { Response } from 'express';
import { Rating } from '../models/Rating';
import { ShiftAssignment } from '../models/ShiftAssignment';
import { User, UserRole } from '../models/User';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { Shift } from '../models/Shift';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const createRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId, rating, reviewText } = req.body;

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const assignment = await ShiftAssignment.findByPk(assignmentId, {
      include: [
        { model: Shift, as: 'shift', include: [{ model: Employer, as: 'employer' }] },
        { model: Worker, as: 'worker' },
      ],
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Determine if this is an employer or worker rating
    let isEmployerRating = false;
    let ratedUserId: string;

    if (user.role === UserRole.EMPLOYER) {
      isEmployerRating = true;
      ratedUserId = assignment.worker?.userId!;
    } else if (user.role === UserRole.WORKER) {
      isEmployerRating = false;
      ratedUserId = assignment.shift?.employer?.userId!;
    } else {
      throw new AppError('Invalid user role for rating', 400);
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: { assignmentId, raterId: user.id },
    });

    if (existingRating) {
      throw new AppError('You have already rated this assignment', 400);
    }

    const newRating = await Rating.create({
      assignmentId,
      raterId: user.id,
      ratedId: ratedUserId,
      rating,
      reviewText,
      isEmployerRating,
    });

    res.status(201).json({ rating: newRating, message: 'Rating submitted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create rating' });
    }
  }
};

export const getUserRatings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: { ratedId: userId },
      include: [
        { model: User, as: 'rater' },
        { model: ShiftAssignment, as: 'assignment', include: [{ model: Shift, as: 'shift' }] },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Calculate average rating
    const allRatings = await Rating.findAll({
      where: { ratedId: userId },
      attributes: ['rating'],
    });

    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

    res.json({
      ratings,
      averageRating: averageRating.toFixed(2),
      totalRatings: count,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
};

export const getWorkerRatings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    const ratings = await Rating.findAll({
      where: { ratedId: worker.userId, isEmployerRating: true },
      include: [
        { model: User, as: 'rater' },
        { model: ShiftAssignment, as: 'assignment', include: [{ model: Shift, as: 'shift' }] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    // Calculate rating distribution
    const distribution = {
      5: ratings.filter((r) => r.rating === 5).length,
      4: ratings.filter((r) => r.rating === 4).length,
      3: ratings.filter((r) => r.rating === 3).length,
      2: ratings.filter((r) => r.rating === 2).length,
      1: ratings.filter((r) => r.rating === 1).length,
    };

    res.json({
      ratings,
      averageRating: averageRating.toFixed(2),
      totalRatings: ratings.length,
      distribution,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch worker ratings' });
    }
  }
};

export const getEmployerRatings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employerId } = req.params;

    const employer = await Employer.findByPk(employerId);
    if (!employer) {
      throw new AppError('Employer not found', 404);
    }

    const ratings = await Rating.findAll({
      where: { ratedId: employer.userId, isEmployerRating: false },
      include: [
        { model: User, as: 'rater' },
        { model: ShiftAssignment, as: 'assignment', include: [{ model: Shift, as: 'shift' }] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    const distribution = {
      5: ratings.filter((r) => r.rating === 5).length,
      4: ratings.filter((r) => r.rating === 4).length,
      3: ratings.filter((r) => r.rating === 3).length,
      2: ratings.filter((r) => r.rating === 2).length,
      1: ratings.filter((r) => r.rating === 1).length,
    };

    res.json({
      ratings,
      averageRating: averageRating.toFixed(2),
      totalRatings: ratings.length,
      distribution,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch employer ratings' });
    }
  }
};
