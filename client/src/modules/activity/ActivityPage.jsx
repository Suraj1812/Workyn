import { Alert, Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import PageHeader from '../../components/PageHeader.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import Seo from '../../components/Seo.jsx';
import MotionSection from '../../components/feedback/MotionSection.jsx';
import PageSkeleton from '../../components/feedback/PageSkeleton.jsx';
import activityService from '../../services/activityService.js';
import { formatDateTime, getApiError } from '../../utils/formatters.js';

const modules = ['', 'auth', 'chat', 'crm', 'clinic', 'resume', 'team', 'billing'];

const ActivityPage = () => {
  const [activity, setActivity] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await activityService.getActivity({
          module: moduleFilter || undefined,
          limit: 40,
        });
        setActivity(response.activity || []);
      } catch (fetchError) {
        setError(getApiError(fetchError, 'Unable to load activity.'));
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [moduleFilter]);

  if (loading) {
    return (
      <>
        <Seo
          title="Activity Log"
          description="Audit authentication, CRM, clinic, billing, chat, and collaboration events across your Workyn workspace."
          path="/activity"
          robots="noindex, nofollow, noarchive"
        />
        <PageSkeleton cards={2} />
      </>
    );
  }

  return (
    <Box>
      <Seo
        title="Activity Log"
        description="Audit authentication, CRM, clinic, billing, chat, and collaboration events across your Workyn workspace."
        path="/activity"
        robots="noindex, nofollow, noarchive"
      />
      <PageHeader
        eyebrow="Activity"
        title="See what happened across the workspace"
        subtitle="Track authentication, CRM, clinic, chat, billing, and collaboration events."
        action={
          <TextField
            select
            size="small"
            label="Module"
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            {modules.map((moduleName) => (
              <MenuItem key={moduleName || 'all'} value={moduleName}>
                {moduleName ? moduleName.toUpperCase() : 'All modules'}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      <MotionSection>
        <SectionCard title="Timeline" subtitle="Recent high-signal events from the platform">
          <Stack spacing={2}>
            {activity.map((item) => (
              <Box
                key={item.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1">{item.description}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.module.toUpperCase()} • {item.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(item.createdAt)}
                </Typography>
              </Box>
            ))}
            {!activity.length ? (
              <Typography color="text.secondary">
                Activity events will appear here as your team uses Workyn.
              </Typography>
            ) : null}
          </Stack>
        </SectionCard>
      </MotionSection>
    </Box>
  );
};

export default ActivityPage;
