import Stripe from 'stripe';

import { query } from '../db/client.js';
import { updateWorkspaceById } from '../repositories/workspacesRepository.js';

export const PLAN_DEFINITIONS = {
  free: {
    id: 'free',
    label: 'Free',
    priceMonthly: 0,
    features: [
      'Chat, CRM, resume builder, and clinic core tools',
      'Single workspace',
      'Basic AI suggestions',
    ],
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    priceMonthly: Number(process.env.STRIPE_PRO_PRICE_MONTHLY || 29),
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Multi-user workspace collaboration',
      'Realtime notifications and file uploads',
      'Analytics dashboard and billing tools',
    ],
  },
};

let stripeClient;

export const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
};

export const createBillingCheckoutSession = async ({ workspace, user, plan }) => {
  const stripe = getStripeClient();
  const selectedPlan = PLAN_DEFINITIONS[plan];

  if (!stripe) {
    throw new Error('Stripe is not configured.');
  }

  if (!selectedPlan?.priceId) {
    throw new Error('The selected plan is not configured for checkout.');
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url: `${clientUrl}/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/billing?status=cancelled`,
    client_reference_id: workspace.id,
    customer_email: workspace.billingEmail || user.email,
    line_items: [
      {
        price: selectedPlan.priceId,
        quantity: 1,
      },
    ],
    metadata: {
      workspaceId: workspace.id,
      plan,
      userId: user.id || user._id,
    },
    subscription_data: {
      metadata: {
        workspaceId: workspace.id,
        plan,
      },
    },
  });

  return session;
};

export const constructStripeEvent = (payload, signature) => {
  const stripe = getStripeClient();

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook is not configured.');
  }

  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

const resolveWorkspaceIdFromEvent = async (event) => {
  const object = event.data.object;

  if (object.metadata?.workspaceId) {
    return object.metadata.workspaceId;
  }

  if (object.client_reference_id) {
    return object.client_reference_id;
  }

  if (object.customer) {
    const { rows } = await query(
      `
        SELECT id
        FROM workspaces
        WHERE stripe_customer_id = $1
        LIMIT 1
      `,
      [object.customer],
    );

    return rows[0]?.id || null;
  }

  return null;
};

export const applyStripeEventToWorkspace = async (event) => {
  const workspaceId = await resolveWorkspaceIdFromEvent(event);

  if (!workspaceId) {
    return null;
  }

  const object = event.data.object;
  const nextPlan =
    object.metadata?.plan || (event.type === 'customer.subscription.deleted' ? 'free' : 'pro');
  const nextStatus =
    event.type === 'customer.subscription.deleted' ? 'canceled' : object.status || 'active';
  const stripeCustomerId = typeof object.customer === 'string' ? object.customer : null;
  const stripeSubscriptionId =
    typeof object.subscription === 'string'
      ? object.subscription
      : event.type.startsWith('customer.subscription')
        ? object.id
        : null;

  return updateWorkspaceById(workspaceId, {
    plan: nextPlan,
    subscriptionStatus: nextStatus,
    stripeCustomerId: stripeCustomerId || undefined,
    stripeSubscriptionId: stripeSubscriptionId || undefined,
    currentPeriodEnd: object.current_period_end
      ? new Date(object.current_period_end * 1000)
      : undefined,
  });
};
