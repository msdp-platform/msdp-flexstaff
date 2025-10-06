import { Response } from 'express';
import { Team } from '../models/Team';
import { Employer } from '../models/Employer';
import { Worker } from '../models/Worker';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const addWorkerToTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workerId, autoAccept } = req.body;

    const employer = await Employer.findOne({ where: { userId: req.userId } });
    if (!employer) {
      throw new AppError('Employer profile not found', 404);
    }

    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    // Check if already in team
    const existingTeamMember = await Team.findOne({
      where: { employerId: employer.id, workerId },
    });

    if (existingTeamMember) {
      throw new AppError('Worker is already in your team', 400);
    }

    const teamMember = await Team.create({
      employerId: employer.id,
      workerId,
      autoAccept: autoAccept || false,
    });

    // TODO: Send notification to worker about team invitation

    res.status(201).json({
      teamMember,
      message: 'Worker added to team successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to add worker to team' });
    }
  }
};

export const removeWorkerFromTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const employer = await Employer.findOne({ where: { userId: req.userId } });
    if (!employer) {
      throw new AppError('Employer profile not found', 404);
    }

    const teamMember = await Team.findOne({
      where: { id, employerId: employer.id },
    });

    if (!teamMember) {
      throw new AppError('Team member not found', 404);
    }

    await teamMember.destroy();

    res.json({ message: 'Worker removed from team successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to remove worker from team' });
    }
  }
};

export const updateTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { autoAccept } = req.body;

    const employer = await Employer.findOne({ where: { userId: req.userId } });
    if (!employer) {
      throw new AppError('Employer profile not found', 404);
    }

    const teamMember = await Team.findOne({
      where: { id, employerId: employer.id },
    });

    if (!teamMember) {
      throw new AppError('Team member not found', 404);
    }

    await teamMember.update({ autoAccept });

    res.json({
      teamMember,
      message: 'Team member updated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update team member' });
    }
  }
};

export const getMyTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employer = await Employer.findOne({ where: { userId: req.userId } });
    if (!employer) {
      throw new AppError('Employer profile not found', 404);
    }

    const team = await Team.findAll({
      where: { employerId: employer.id },
      include: [
        {
          model: Worker,
          as: 'worker',
          include: [{ model: User, as: 'user' }],
        },
      ],
      order: [['addedAt', 'DESC']],
    });

    res.json({ team });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch team' });
    }
  }
};

export const getWorkerTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const worker = await Worker.findOne({ where: { userId: req.userId } });
    if (!worker) {
      throw new AppError('Worker profile not found', 404);
    }

    const teams = await Team.findAll({
      where: { workerId: worker.id },
      include: [
        {
          model: Employer,
          as: 'employer',
          include: [{ model: User, as: 'user' }],
        },
      ],
      order: [['addedAt', 'DESC']],
    });

    res.json({ teams });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  }
};

export const checkTeamMembership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employerId, workerId } = req.query;

    const teamMember = await Team.findOne({
      where: { employerId, workerId },
    });

    res.json({
      isMember: !!teamMember,
      autoAccept: teamMember?.autoAccept || false,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check team membership' });
  }
};
