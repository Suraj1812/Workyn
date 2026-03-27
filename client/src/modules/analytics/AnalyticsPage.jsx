import { Alert, Box, Grid, Typography } from '@mui/material';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useEffect, useState } from 'react';

import PageHeader from '../../components/PageHeader.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import Seo from '../../components/Seo.jsx';
import MotionSection from '../../components/feedback/MotionSection.jsx';
import PageSkeleton from '../../components/feedback/PageSkeleton.jsx';
import dashboardService from '../../services/dashboardService.js';
import { getApiError } from '../../utils/formatters.js';

const pieColors = ['#0b7d77', '#fa8c16', '#5c7cfa'];

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await dashboardService.getAnalytics();
        setAnalytics(response);
      } catch (fetchError) {
        setError(getApiError(fetchError, 'Unable to load analytics.'));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <>
        <Seo
          title="Analytics"
          description="Review growth trends, lead mix, and message volume with Workyn workspace analytics."
          path="/analytics"
          robots="noindex, nofollow, noarchive"
        />
        <PageSkeleton cards={3} />
      </>
    );
  }

  return (
    <Box>
      <Seo
        title="Analytics"
        description="Review growth trends, lead mix, and message volume with Workyn workspace analytics."
        path="/analytics"
        robots="noindex, nofollow, noarchive"
      />
      <PageHeader
        eyebrow="Analytics"
        title="Track growth and usage"
        subtitle="Monitor daily activity, messaging trends, and lead distribution across your workspace."
      />

      {error ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <MotionSection>
            <SectionCard title="Workspace activity trend" subtitle="Daily actions and chat volume">
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.trends?.activity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Activity" stroke="#0b7d77" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </SectionCard>
          </MotionSection>
        </Grid>
        <Grid item xs={12} lg={4}>
          <MotionSection delay={0.05}>
            <SectionCard title="Lead mix" subtitle="Current CRM stage distribution">
              <Box sx={{ height: 320 }}>
                {analytics?.leadStatus?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.leadStatus}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={100}
                      >
                        {analytics.leadStatus.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary">
                    Lead distribution will appear once your workspace has CRM data.
                  </Typography>
                )}
              </Box>
            </SectionCard>
          </MotionSection>
        </Grid>
        <Grid item xs={12}>
          <MotionSection delay={0.1}>
            <SectionCard title="Messaging trend" subtitle="Realtime communication volume">
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.trends?.chats || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" name="Messages" stroke="#fa8c16" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </SectionCard>
          </MotionSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
