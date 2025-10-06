import { Router } from 'express';
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  verifyCertification,
} from '../controllers/certification.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Get certifications for a worker
router.get('/', authenticate, getCertifications);
router.get('/:workerId', authenticate, getCertifications);

// Create certification
router.post('/', authenticate, createCertification);

// Update certification
router.put('/:id', authenticate, updateCertification);

// Delete certification
router.delete('/:id', authenticate, deleteCertification);

// Verify certification (admin only)
router.post('/:id/verify', authenticate, authorize(UserRole.ADMIN), verifyCertification);

export default router;
