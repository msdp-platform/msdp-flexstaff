import { Router } from 'express';
import {
  createShift,
  getShifts,
  getShift,
  updateShift,
  deleteShift,
  publishShift,
} from '../controllers/shift.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/', authenticate, authorize(UserRole.EMPLOYER), createShift);
router.get('/', authenticate, getShifts);
router.get('/:id', authenticate, getShift);
router.put('/:id', authenticate, authorize(UserRole.EMPLOYER), updateShift);
router.delete('/:id', authenticate, authorize(UserRole.EMPLOYER), deleteShift);
router.post('/:id/publish', authenticate, authorize(UserRole.EMPLOYER), publishShift);

export default router;
