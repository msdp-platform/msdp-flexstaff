import { Router } from 'express';
import {
  applyForShift,
  getApplications,
  acceptApplication,
  rejectApplication,
} from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/', authenticate, authorize(UserRole.WORKER), applyForShift);
router.get('/', authenticate, getApplications);
router.post('/:id/accept', authenticate, authorize(UserRole.EMPLOYER), acceptApplication);
router.post('/:id/reject', authenticate, authorize(UserRole.EMPLOYER), rejectApplication);

export default router;
