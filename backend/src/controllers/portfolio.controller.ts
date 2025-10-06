import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PortfolioItem } from '../models/PortfolioItem';
import { Worker } from '../models/Worker';

export const getPortfolioItems = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;

    const portfolioItems = await PortfolioItem.findAll({
      where: { workerId },
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.json(portfolioItems);
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio items' });
  }
};

export const getMyPortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Find worker record for this user
    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const portfolioItems = await PortfolioItem.findAll({
      where: { workerId: worker.id },
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.json(portfolioItems);
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio items' });
  }
};

export const createPortfolioItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, mediaType, mediaUrl, thumbnailUrl, displayOrder } = req.body;

    if (!title || !mediaType || !mediaUrl) {
      return res.status(400).json({ message: 'Title, media type, and media URL are required' });
    }

    // Find worker record for this user
    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const portfolioItem = await PortfolioItem.create({
      workerId: worker.id,
      title,
      description,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      displayOrder: displayOrder || 0,
    });

    res.status(201).json(portfolioItem);
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).json({ message: 'Failed to create portfolio item' });
  }
};

export const updatePortfolioItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, mediaType, mediaUrl, thumbnailUrl, displayOrder } = req.body;

    // Find worker record for this user
    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const portfolioItem = await PortfolioItem.findOne({
      where: { id, workerId: worker.id },
    });

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    await portfolioItem.update({
      title: title || portfolioItem.title,
      description: description !== undefined ? description : portfolioItem.description,
      mediaType: mediaType || portfolioItem.mediaType,
      mediaUrl: mediaUrl || portfolioItem.mediaUrl,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : portfolioItem.thumbnailUrl,
      displayOrder: displayOrder !== undefined ? displayOrder : portfolioItem.displayOrder,
    });

    res.json(portfolioItem);
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({ message: 'Failed to update portfolio item' });
  }
};

export const deletePortfolioItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // Find worker record for this user
    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const portfolioItem = await PortfolioItem.findOne({
      where: { id, workerId: worker.id },
    });

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    await portfolioItem.destroy();

    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ message: 'Failed to delete portfolio item' });
  }
};
