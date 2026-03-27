import {
  PLAN_DEFINITIONS,
  applyStripeEventToWorkspace,
  constructStripeEvent,
  createBillingCheckoutSession,
} from '../services/billingService.js';
import { recordActivity } from '../services/activityService.js';

export const getBillingOverview = async (req, res) => {
  res.json({
    success: true,
    workspace: req.workspace,
    plans: Object.values(PLAN_DEFINITIONS),
  });
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const session = await createBillingCheckoutSession({
      workspace: req.workspace,
      user: req.user,
      plan: req.body.plan,
    });

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'billing',
      action: 'billing.checkout_started',
      entityType: 'workspace',
      entityId: req.workspace.id,
      description: `${req.user.name} started a ${req.body.plan} checkout.`,
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
};

export const handleBillingWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = constructStripeEvent(req.body, signature);
    await applyStripeEventToWorkspace(event);

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
