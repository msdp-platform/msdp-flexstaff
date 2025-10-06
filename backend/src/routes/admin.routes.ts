import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllShiftsAdmin,
  deleteShiftAdmin,
  getAllPaymentsAdmin,
  getDisputes,
  getSystemSettings,
  updateSystemSettings,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize(UserRole.ADMIN));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue', getRevenueAnalytics);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Shift Management
router.get('/shifts', getAllShiftsAdmin);
router.delete('/shifts/:id', deleteShiftAdmin);

// Payment Management
router.get('/payments', getAllPaymentsAdmin);

// Dispute Management
router.get('/disputes', getDisputes);

// System Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
