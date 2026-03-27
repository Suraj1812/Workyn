import {
  AssignmentIndRounded,
  AutoAwesomeRounded,
  ChatRounded,
  MonitorHeartRounded,
  NotificationsRounded,
  PaidRounded,
  PeopleAltRounded,
} from '@mui/icons-material';
import { Alert, Box, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import Seo from '../components/Seo.jsx';
import StatCard from '../components/StatCard.jsx';
import AISuggestionList from '../components/ai/AISuggestionList.jsx';
import MotionSection from '../components/feedback/MotionSection.jsx';
import PageSkeleton from '../components/feedback/PageSkeleton.jsx';
import { useAI } from '../context/AIContext.jsx';
import dashboardService from '../services/dashboardService.js';
import { formatDateTime, getApiError } from '../utils/formatters.js';

const DashboardPage = () => {
  const [summary, setSummary] = useState({ stats: null, activity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { suggestions, summary: aiSummary, respondToSuggestion } = useAI();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await dashboardService.getSummary();
        setSummary(response);
      } catch (fetchError) {
        setError(getApiError(fetchError, 'Unable to load dashboard data.'));
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <>
        <Seo
          title="Dashboard"
          description="Monitor the health of your Workyn workspace across chat, CRM, resumes, clinic activity, and notifications."
          path="/dashboard"
          robots="noindex, nofollow, noarchive"
        />
        <PageSkeleton cards={6} />
      </>
    );
  }

  const stats = summary.stats || {
    users: 0,
    chats: 0,
    leads: 0,
    patients: 0,
    unreadNotifications: 0,
  };

  return (
    <Box>
      <Seo
        title="Dashboard"
        description="Monitor the health of your Workyn workspace across chat, CRM, resumes, clinic activity, and notifications."
        path="/dashboard"
        robots="noindex, nofollow, noarchive"
      />
      <PageHeader
        eyebrow="Command Center"
        title="Everything moving in one place"
        subtitle="Track the health of your workspace across communication, pipeline, talent, and patient care."
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      <MotionSection>
        <SectionCard
          title="Workspace momentum"
          subtitle="Today’s snapshot across the platform"
          sx={{
            mb: 3,
            background:
              'linear-gradient(135deg, rgba(11,125,119,0.18) 0%, rgba(250,140,22,0.16) 100%)',
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h5">See the pulse of your operation at a glance.</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
              Workyn keeps the key layers of your business together so team conversations, customer
              progress, resume drafts, and patient updates stay visible and connected.
            </Typography>
            <Typography color="text.secondary">
              Active workspace: {summary.workspace?.name || 'Current workspace'} • Plan:{' '}
              {(summary.workspace?.plan || 'free').toUpperCase()}
            </Typography>
          </Stack>
        </SectionCard>
      </MotionSection>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon={<PeopleAltRounded />} label="Users" value={stats.users} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon={<ChatRounded />} label="Chats" value={stats.chats} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon={<AssignmentIndRounded />} label="Leads" value={stats.leads} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon={<MonitorHeartRounded />} label="Patients" value={stats.patients} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<NotificationsRounded />}
            label="Unread notifications"
            value={stats.unreadNotifications}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={<PaidRounded />}
            label="Workspace plan"
            value={(summary.workspace?.plan || 'free').toUpperCase()}
          />
        </Grid>
      </Grid>

      <MotionSection delay={0.05}>
        <SectionCard
          title="AI command layer"
          subtitle="Behavior tracking, live suggestions, and accepted automations"
          action={<AutoAwesomeRounded color="primary" />}
          sx={{ mb: 3 }}
        >
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h5">{aiSummary.pendingSuggestions}</Typography>
              <Typography color="text.secondary">Pending AI suggestions</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h5">{aiSummary.activeAutomations}</Typography>
              <Typography color="text.secondary">Active automations</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h5">{aiSummary.reviewedSuggestions}</Typography>
              <Typography color="text.secondary">Reviewed suggestions</Typography>
            </Grid>
          </Grid>

          <AISuggestionList
            suggestions={suggestions.slice(0, 3)}
            compact
            emptyText="AI insights will appear here as your team activity grows."
            onAccept={(suggestionId) => respondToSuggestion(suggestionId, true)}
            onReject={(suggestionId) => respondToSuggestion(suggestionId, false)}
          />
        </SectionCard>
      </MotionSection>

      <MotionSection delay={0.1}>
        <SectionCard
          title="Recent activity"
          subtitle="A combined feed from chat, CRM, and clinic workflows"
        >
          {summary.activity.length ? (
            <List disablePadding>
              {summary.activity.map((item) => (
                <ListItem key={`${item.type}-${item.id}`} divider disableGutters sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {formatDateTime(item.date)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              Activity will appear here as you start using chat, CRM, and clinic features.
            </Typography>
          )}
        </SectionCard>
      </MotionSection>
    </Box>
  );
};

export default DashboardPage;
