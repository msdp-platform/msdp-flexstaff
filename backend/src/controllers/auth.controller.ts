import { Request, Response } from 'express';
import { User, UserRole, UserStatus } from '../models/User';
import { Employer } from '../models/Employer';
import { Worker } from '../models/Worker';
import { Individual } from '../models/Individual';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, ...profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Create user
    const user = await User.create({
      email,
      passwordHash: password,
      role,
      status: UserStatus.PENDING_VERIFICATION,
    });

    // Create role-specific profile
    if (role === UserRole.EMPLOYER) {
      await Employer.create({
        userId: user.id,
        companyName: profileData.companyName,
        industry: profileData.industry,
        ...profileData,
      });
    } else if (role === UserRole.WORKER) {
      await Worker.create({
        userId: user.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        ...profileData,
      });
    } else if (role === UserRole.INDIVIDUAL) {
      await Individual.create({
        userId: user.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        ...profileData,
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError('Account suspended', 403);
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Login failed' });
    }
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logout successful' });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const user = await User.findByPk(userId, {
      include: [
        { model: Employer, as: 'employer' },
        { model: Worker, as: 'worker' },
        { model: Individual, as: 'individual' },
      ],
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
};
