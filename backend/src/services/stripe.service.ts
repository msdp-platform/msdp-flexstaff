import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  // Create Stripe Connect account for employer or worker
  static async createConnectAccount(
    email: string,
    accountType: 'express' | 'standard' = 'express',
    country: string = 'GB'
  ): Promise<Stripe.Account> {
    const account = await stripe.accounts.create({
      type: accountType,
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  }

  // Create account link for onboarding
  static async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<Stripe.AccountLink> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  }

  // Get account details
  static async getAccount(accountId: string): Promise<Stripe.Account> {
    return await stripe.accounts.retrieve(accountId);
  }

  // Create payment intent (employer pays platform)
  static async createPaymentIntent(
    amount: number, // in pence
    currency: string = 'gbp',
    employerStripeAccountId?: string
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      ...(employerStripeAccountId && {
        on_behalf_of: employerStripeAccountId,
      }),
    });

    return paymentIntent;
  }

  // Create transfer to worker (payout)
  static async createTransfer(
    amount: number, // in pence (after platform fee deduction)
    workerStripeAccountId: string,
    paymentIntentId: string
  ): Promise<Stripe.Transfer> {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'gbp',
      destination: workerStripeAccountId,
      source_transaction: paymentIntentId,
    });

    return transfer;
  }

  // Calculate platform fee (default 10%)
  static calculatePlatformFee(amount: number, feePercentage: number = 10): number {
    return Math.round(amount * (feePercentage / 100));
  }

  // Process full payment flow
  static async processShiftPayment(
    totalAmount: number, // total shift cost in pence
    employerStripeAccountId: string,
    workerStripeAccountId: string,
    platformFeePercentage: number = 10
  ): Promise<{
    paymentIntent: Stripe.PaymentIntent;
    transfer: Stripe.Transfer;
    platformFee: number;
    workerAmount: number;
  }> {
    // Create payment intent from employer
    const paymentIntent = await this.createPaymentIntent(
      totalAmount,
      'gbp',
      employerStripeAccountId
    );

    // Calculate platform fee
    const platformFee = this.calculatePlatformFee(totalAmount, platformFeePercentage);
    const workerAmount = totalAmount - platformFee;

    // Create transfer to worker (will be executed after payment succeeds)
    const transfer = await this.createTransfer(
      workerAmount,
      workerStripeAccountId,
      paymentIntent.id
    );

    return {
      paymentIntent,
      transfer,
      platformFee,
      workerAmount,
    };
  }

  // Create payout to bank account
  static async createPayout(
    accountId: string,
    amount: number,
    currency: string = 'gbp'
  ): Promise<Stripe.Payout> {
    const payout = await stripe.payouts.create(
      {
        amount,
        currency,
      },
      {
        stripeAccount: accountId,
      }
    );

    return payout;
  }

  // Verify account status
  static async verifyAccountStatus(accountId: string): Promise<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  }> {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      detailsSubmitted: account.details_submitted || false,
    };
  }

  // Handle webhook events
  static constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  // Refund payment
  static async createRefund(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount }),
    });

    return refund;
  }

  // Get balance
  static async getBalance(accountId?: string): Promise<Stripe.Balance> {
    if (accountId) {
      return await stripe.balance.retrieve({
        stripeAccount: accountId,
      });
    }
    return await stripe.balance.retrieve();
  }
}

export default StripeService;
