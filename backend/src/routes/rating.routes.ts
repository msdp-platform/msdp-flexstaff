import { Router } from 'express';
import {
  createRating,
  getUserRatings,
  getWorkerRatings,
  getEmployerRatings,
} from '../controllers/rating.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createRating);
router.get('/user/:userId', getUserRatings);
router.get('/worker/:workerId', getWorkerRatings);
router.get('/employer/:employerId', getEmployerRatings);

export default router;
