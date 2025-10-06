import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPortfolioItems,
  getMyPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '../controllers/portfolio.controller';

const router = express.Router();

router.get('/my-portfolio', authenticate, getMyPortfolio);
router.get('/worker/:workerId', getPortfolioItems);
router.post('/', authenticate, createPortfolioItem);
router.put('/:id', authenticate, updatePortfolioItem);
router.delete('/:id', authenticate, deletePortfolioItem);

export default router;
