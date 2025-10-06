import { Request, Response } from 'express';
import { Payment, PaymentStatus } from '../models/Payment';
import { Timesheet, TimesheetStatus } from '../models/Timesheet';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import StripeService from '../services/stripe.service';

export const createStripeAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await req.user!;
    const { accountType } = req.body;

    const account = await StripeService.createConnectAccount(
      user.email,
      accountType || 'express',
      'GB'
    );

    // Update user's Stripe account ID
    const employer = await Employer.findOne({ where: { userId: user.id } });
    const worker = await Worker.findOne({ where: { userId: user.id } });

    if (employer) {
      await employer.update({ stripeAccountId: account.id });
    } else if (worker) {
      await worker.update({ stripeAccountId: account.id });
    }

    const accountLink = await StripeService.createAccountLink(
      account.id,
      `${process.env.FRONTEND_URL}/settings/payment/refresh`,
      `${process.env.FRONTEND_URL}/settings/payment/complete`
    );

    res.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create Stripe account' });
    }
  }
};

export const getStripeAccountStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await req.user!;

    const employer = await Employer.findOne({ where: { userId: user.id } });
    const worker = await Worker.findOne({ where: { userId: user.id } });

    const stripeAccountId = employer?.stripeAccountId || worker?.stripeAccountId;

    if (!stripeAccountId) {
      throw new AppError('No Stripe account found', 404);
    }

    const status = await StripeService.verifyAccountStatus(stripeAccountId);
    const account = await StripeService.getAccount(stripeAccountId);

    res.json({
      accountId: stripeAccountId,
      status,
      account: {
        email: account.email,
        country: account.country,
        type: account.type,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to get account status' });
    }
  }
};

export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timesheetId } = req.body;

    const timesheet = await Timesheet.findByPk(timesheetId, {
      include: [
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' },
      ],
    });

    if (!timesheet) {
      throw new AppError('Timesheet not found', 404);
    }

    if (timesheet.status !== TimesheetStatus.APPROVED) {
      throw new AppError('Timesheet must be approved before payment', 400);
    }

    const employer = timesheet.employer;
    const worker = timesheet.worker;

    if (!employer?.stripeAccountId) {
      throw new AppError('Employer has not set up payment account', 400);
    }

    if (!worker?.stripeAccountId) {
      throw new AppError('Worker has not set up payment account', 400);
    }

    // Convert amount to pence
    const amountInPence = Math.round((timesheet.totalAmount || 0) * 100);

    // Process payment through Stripe
    const { paymentIntent, transfer, platformFee, workerAmount } =
      await StripeService.processShiftPayment(
        amountInPence,
        employer.stripeAccountId,
        worker.stripeAccountId,
        10 // 10% platform fee
      );

    // Create payment record
    const payment = await Payment.create({
      timesheetId: timesheet.id,
      workerId: worker.id,
      employerId: employer.id,
      amount: timesheet.totalAmount,
      platformFee: platformFee / 100, // Convert back to pounds
      netAmount: workerAmount / 100, // Convert back to pounds
      stripePaymentIntentId: paymentIntent.id,
      stripeTransferId: transfer.id,
      status: PaymentStatus.PROCESSING,
      paymentMethod: 'stripe',
    });

    res.json({
      payment,
      message: 'Payment initiated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }
};

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const event = StripeService.constructWebhookEvent(
      req.body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        await Payment.update(
          {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          },
          {
            where: { stripePaymentIntentId: paymentIntent.id },
          }
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        await Payment.update(
          { status: PaymentStatus.FAILED },
          {
            where: { stripePaymentIntentId: paymentIntent.id },
          }
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: 'Webhook error' });
  }
};

export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where: any = {};

    if (status) where.status = status;

    // Check if user is employer or worker
    const employer = await Employer.findOne({ where: { userId: req.userId } });
    const worker = await Worker.findOne({ where: { userId: req.userId } });

    if (employer) {
      where.employerId = employer.id;
    } else if (worker) {
      where.workerId = worker.id;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' },
        { model: Timesheet, as: 'timesheet' },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      payments,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const getPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        { model: Worker, as: 'worker' },
        { model: Employer, as: 'employer' },
        { model: Timesheet, as: 'timesheet' },
      ],
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    res.json({ payment });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  }
};
