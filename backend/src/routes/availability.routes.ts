import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMyAvailability,
  getAvailableWorkers,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  bookAvailability,
  getMyBookings,
} from '../controllers/availability.controller';

const router = express.Router();

// Worker routes
router.get('/my-availability', authenticate, getMyAvailability);
router.post('/', authenticate, createAvailability);
router.put('/:id', authenticate, updateAvailability);
router.delete('/:id', authenticate, deleteAvailability);

// Public routes - no authentication required
router.get('/available-workers', getAvailableWorkers);

// Employer routes - authentication required
router.post('/:id/book', authenticate, bookAvailability);
router.get('/my-bookings', authenticate, getMyBookings);

export default router;
