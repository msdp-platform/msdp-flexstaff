import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '../controllers/favorite.controller';

const router = express.Router();

router.get('/', authenticate, getFavorites);
router.post('/', authenticate, addFavorite);
router.delete('/:favoritedUserId', authenticate, removeFavorite);
router.get('/check/:favoritedUserId', authenticate, checkFavorite);

export default router;
