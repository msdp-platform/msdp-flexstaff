import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Favorite } from '../models/Favorite';
import { User } from '../models/User';

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'favoritedUser',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'phoneNumber'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { favoritedUserId } = req.body;

    if (!favoritedUserId) {
      return res.status(400).json({ message: 'Favorited user ID is required' });
    }

    if (userId === favoritedUserId) {
      return res.status(400).json({ message: 'Cannot add yourself as favorite' });
    }

    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({
      where: { userId, favoritedUserId },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'User already in favorites' });
    }

    // Check if favorited user exists
    const favoritedUser = await User.findByPk(favoritedUserId);
    if (!favoritedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favorite = await Favorite.create({
      userId,
      favoritedUserId,
    });

    const newFavorite = await Favorite.findByPk(favorite.id, {
      include: [
        {
          model: User,
          as: 'favoritedUser',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'phoneNumber'],
        },
      ],
    });

    res.status(201).json(newFavorite);
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Failed to add favorite' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { favoritedUserId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, favoritedUserId },
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await favorite.destroy();

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { favoritedUserId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, favoritedUserId },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ message: 'Failed to check favorite status' });
  }
};
