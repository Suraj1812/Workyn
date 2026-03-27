import { CheckRounded, RocketLaunchRounded } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import PageHeader from '../../components/PageHeader.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import Seo from '../../components/Seo.jsx';
import MotionSection from '../../components/feedback/MotionSection.jsx';
import PageSkeleton from '../../components/feedback/PageSkeleton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import billingService from '../../services/billingService.js';
import { formatDate, getApiError } from '../../utils/formatters.js';

const BillingPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const response = await billingService.getOverview();
        setBilling(response);
      } catch (fetchError) {
        setError(getApiError(fetchError, 'Unable to load billing overview.'));
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, []);

  const handleUpgrade = async () => {
    setSubmitting(true);
    setError('');

    try {
      const response = await billingService.createCheckout('pro');
      if (response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }

      showToast({
        severity: 'info',
        message: 'Checkout session created.',
      });
    } catch (checkoutError) {
      setError(getApiError(checkoutError, 'Unable to start checkout.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Seo
          title="Billing"
          description="Manage subscriptions, plans, and monetization settings for your Workyn workspace."
          path="/billing"
          robots="noindex, nofollow, noarchive"
        />
        <PageSkeleton cards={2} />
      </>
    );
  }

  return (
    <Box>
      <Seo
        title="Billing"
        description="Manage subscriptions, plans, and monetization settings for your Workyn workspace."
        path="/billing"
        robots="noindex, nofollow, noarchive"
      />
      <PageHeader
        eyebrow="Billing"
        title="Monetize and manage your subscription"
        subtitle="Upgrade to Pro for analytics, team collaboration, uploads, and global search."
      />

      {error ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <MotionSection>
            <SectionCard title="Current subscription" subtitle="Workspace billing status">
              <Stack spacing={1.5}>
                <Chip
                  label={(
                    billing?.workspace?.plan ||
                    user?.currentWorkspace?.plan ||
                    'free'
                  ).toUpperCase()}
                  color={billing?.workspace?.plan === 'pro' ? 'secondary' : 'default'}
                  sx={{ alignSelf: 'flex-start' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Status: {billing?.workspace?.subscriptionStatus || 'inactive'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Billing cycle ends:{' '}
                  {billing?.workspace?.currentPeriodEnd
                    ? formatDate(billing.workspace.currentPeriodEnd)
                    : 'Not scheduled'}
                </Typography>
              </Stack>
            </SectionCard>
          </MotionSection>
        </Grid>
        {(billing?.plans || []).map((plan, index) => (
          <Grid item xs={12} md={6} lg={4} key={plan.id}>
            <MotionSection delay={index * 0.05}>
              <SectionCard
                title={plan.label}
                subtitle={`$${plan.priceMonthly}/month`}
                action={
                  plan.id === 'pro' ? (
                    <Button
                      variant="contained"
                      startIcon={<RocketLaunchRounded />}
                      onClick={handleUpgrade}
                      disabled={submitting || user?.workspaceRole !== 'admin'}
                    >
                      {submitting ? 'Redirecting...' : 'Upgrade'}
                    </Button>
                  ) : null
                }
              >
                <Stack spacing={1.5}>
                  {plan.features.map((feature) => (
                    <Stack key={feature} direction="row" spacing={1} alignItems="center">
                      <CheckRounded fontSize="small" color="secondary" />
                      <Typography variant="body2">{feature}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </SectionCard>
            </MotionSection>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BillingPage;
