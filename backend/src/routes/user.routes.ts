import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'User profile endpoint' });
});

export default router;
