import { Router } from 'express';
import {
  createStripeAccount,
  getStripeAccountStatus,
  processPayment,
  handleStripeWebhook,
  getPayments,
  getPayment,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/stripe/account', authenticate, createStripeAccount);
router.get('/stripe/account/status', authenticate, getStripeAccountStatus);
router.post('/process', authenticate, processPayment);
router.post('/webhook/stripe', handleStripeWebhook);
router.get('/', authenticate, getPayments);
router.get('/:id', authenticate, getPayment);

export default router;
