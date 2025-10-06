import { Router } from 'express';
import {
  createTimesheet,
  clockIn,
  clockOut,
  submitTimesheet,
  approveTimesheet,
  rejectTimesheet,
  getTimesheets,
  getTimesheet,
} from '../controllers/timesheet.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/', authenticate, createTimesheet);
router.get('/', authenticate, getTimesheets);
router.get('/:id', authenticate, getTimesheet);
router.post('/:id/clock-in', authenticate, authorize(UserRole.WORKER), clockIn);
router.post('/:id/clock-out', authenticate, authorize(UserRole.WORKER), clockOut);
router.post('/:id/submit', authenticate, authorize(UserRole.WORKER), submitTimesheet);
router.post('/:id/approve', authenticate, authorize(UserRole.EMPLOYER), approveTimesheet);
router.post('/:id/reject', authenticate, authorize(UserRole.EMPLOYER), rejectTimesheet);

export default router;
