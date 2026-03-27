import {
  AutoAwesomeRounded,
  ChatRounded,
  FavoriteRounded,
  InsightsRounded,
  LocalHospitalRounded,
  ManageAccountsRounded,
  PictureAsPdfRounded,
  WorkspacesRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  DEFAULT_DESCRIPTION,
  buildFaqSchema,
  buildOrganizationSchema,
  buildSoftwareApplicationSchema,
  buildWebsiteSchema,
} from '../utils/seo.js';

const features = [
  {
    icon: <ChatRounded color="primary" />,
    title: 'Realtime Team Chat',
    description:
      'Keep conversations, quick replies, attachments, and notifications in one shared workspace.',
  },
  {
    icon: <ManageAccountsRounded color="primary" />,
    title: 'CRM and Pipeline Control',
    description:
      'Capture leads, track follow-ups, manage statuses, and see pipeline momentum without hopping tools.',
  },
  {
    icon: <PictureAsPdfRounded color="primary" />,
    title: 'Resume Builder',
    description:
      'Draft polished resumes, preview them live, and export clean PDFs from the same platform.',
  },
  {
    icon: <LocalHospitalRounded color="primary" />,
    title: 'Clinic Operations',
    description:
      'Organize patients, appointments, histories, and follow-up actions with production-ready workflows.',
  },
  {
    icon: <AutoAwesomeRounded color="primary" />,
    title: 'In-House AI Automation',
    description:
      'Use behavior tracking, suggestions, and rule-based automation without sending data to external AI APIs.',
  },
  {
    icon: <InsightsRounded color="primary" />,
    title: 'Analytics and Billing',
    description:
      'Measure workspace usage, unlock Pro features, and manage growth from one monetizable SaaS foundation.',
  },
];

const faqs = [
  {
    question: 'What is Workyn used for?',
    answer:
      'Workyn helps businesses and teams run chat, CRM, resume building, clinic workflows, analytics, and collaboration from one platform.',
  },
  {
    question: 'Does Workyn include AI features?',
    answer:
      'Yes. Workyn includes an in-house rule-based AI engine for suggestions, behavior tracking, automation prompts, and productivity insights without external AI APIs.',
  },
  {
    question: 'Can teams collaborate inside Workyn?',
    answer:
      'Yes. Pro workspaces support invitations, roles, shared notifications, uploads, and multi-user collaboration across modules.',
  },
  {
    question: 'Is Workyn suitable for clinics and operational teams?',
    answer:
      'Yes. Workyn includes patient management, appointment tracking, CRM workflows, and a shared operations dashboard designed for real-world teams.',
  },
];

const HomePage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const heroShellSx = {
    p: { xs: 3, md: 5 },
    borderRadius: { xs: 5, md: 6 },
    background: isDark
      ? 'linear-gradient(135deg, rgba(7,24,38,0.96) 0%, rgba(11,34,49,0.94) 45%, rgba(54,37,18,0.88) 100%)'
      : 'linear-gradient(135deg, rgba(235,249,248,0.98) 0%, rgba(243,248,255,0.96) 50%, rgba(255,244,230,0.96) 100%)',
    overflow: 'hidden',
    mb: 4,
    boxShadow: isDark ? '0 30px 80px rgba(0, 0, 0, 0.28)' : '0 30px 80px rgba(15, 23, 42, 0.08)',
  };

  const heroPanelSx = {
    p: { xs: 2.5, md: 3 },
    borderRadius: 5,
    border: `1px solid ${alpha(theme.palette.common.white, isDark ? 0.12 : 0.08)}`,
    bgcolor: isDark ? 'rgba(9, 18, 31, 0.76)' : 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(18px)',
    color: isDark ? '#f6fbff' : 'text.primary',
  };

  const heroMiniCardSx = {
    p: 2.2,
    height: '100%',
    borderRadius: 4,
    border: `1px solid ${alpha(theme.palette.common.white, isDark ? 0.1 : 0.08)}`,
    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(8,17,32,0.04)',
  };

  return (
    <Box sx={{ py: { xs: 3, md: 5 } }}>
      <Seo
        title="Workyn | AI-Powered SaaS for Chat, CRM, Hiring, and Clinic Operations"
        description={DEFAULT_DESCRIPTION}
        path="/"
        keywords={[
          'AI-powered SaaS',
          'business management platform',
          'chat and CRM software',
          'resume builder software',
          'clinic management SaaS',
          'workspace automation',
        ]}
        structuredData={[
          buildOrganizationSchema(),
          buildWebsiteSchema(),
          buildSoftwareApplicationSchema(),
          buildFaqSchema(faqs),
        ]}
      />

      <Container maxWidth="xl">
        <Paper elevation={0} sx={heroShellSx}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            sx={{ mb: 5 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                component="img"
                src="/icon.svg"
                alt="Workyn logo"
                sx={{ width: 44, height: 44 }}
              />
              <Typography variant="h4">Workyn</Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={RouterLink}
                to="/login"
                variant={isDark ? 'outlined' : 'text'}
                color="inherit"
                sx={{
                  color: isDark ? '#f6fbff' : 'text.primary',
                  borderColor: isDark ? 'rgba(255,255,255,0.16)' : undefined,
                }}
              >
                Sign in
              </Button>
              <Button
                component={RouterLink}
                to={user ? '/dashboard' : '/register'}
                variant="contained"
                color="primary"
              >
                {user ? 'Open dashboard' : 'Start free'}
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} lg={7}>
              <Chip
                label="AI-powered operating system for modern teams"
                color="secondary"
                sx={{ mb: 2, fontWeight: 700, alignSelf: 'flex-start' }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 40, md: 64 },
                  lineHeight: 1.04,
                  maxWidth: 720,
                  textWrap: 'balance',
                }}
              >
                Run chat, CRM, hiring, and clinic operations from one focused workspace.
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 2.5,
                  maxWidth: 760,
                  lineHeight: 1.65,
                  color: isDark ? 'rgba(246,251,255,0.74)' : 'text.secondary',
                }}
              >
                Workyn brings together realtime communication, lead management, resume creation,
                patient workflows, analytics, billing, team collaboration, and in-house AI
                suggestions so growing companies can operate faster with less tool sprawl.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to={user ? '/dashboard' : '/register'}
                  size="large"
                  variant="contained"
                  sx={{ minWidth: 220 }}
                >
                  {user ? 'Go to workspace' : 'Create your workspace'}
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  size="large"
                  variant="outlined"
                  sx={{ minWidth: 220 }}
                >
                  Existing customer login
                </Button>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mt: 4, flexWrap: 'wrap' }}
              >
                <Chip
                  icon={<WorkspacesRounded />}
                  label="Multi-module SaaS platform"
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(8,17,32,0.05)',
                    color: isDark ? '#f6fbff' : 'text.primary',
                  }}
                />
                <Chip
                  icon={<AutoAwesomeRounded />}
                  label="No external AI APIs required"
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(8,17,32,0.05)',
                    color: isDark ? '#f6fbff' : 'text.primary',
                  }}
                />
                <Chip
                  icon={<FavoriteRounded />}
                  label="Built for teams and clinics"
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(8,17,32,0.05)',
                    color: isDark ? '#f6fbff' : 'text.primary',
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Paper elevation={0} sx={heroPanelSx}>
                <Stack spacing={1} sx={{ mb: 2.5 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: 1.4,
                      color: isDark ? 'rgba(246,251,255,0.62)' : 'text.secondary',
                    }}
                  >
                    Platform overview
                  </Typography>
                  <Typography variant="h4" sx={{ maxWidth: 420 }}>
                    Designed to replace scattered tools with one operational core.
                  </Typography>
                  <Typography
                    sx={{
                      color: isDark ? 'rgba(246,251,255,0.72)' : 'text.secondary',
                      lineHeight: 1.7,
                    }}
                  >
                    Every module stays connected, so your team can move from conversations to
                    follow-ups, resumes, appointments, and analytics without losing context.
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  {[
                    ['Modules', 'Chat, CRM, Resume, Clinic'],
                    ['AI Layer', 'Suggestions, automations, quick replies'],
                    ['Collaboration', 'Workspaces, invites, roles, notifications'],
                    ['Monetization', 'Free and Pro subscription support'],
                  ].map(([label, value]) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Paper elevation={0} sx={heroMiniCardSx}>
                        <Typography
                          variant="overline"
                          sx={{
                            display: 'block',
                            lineHeight: 1.2,
                            letterSpacing: 1.2,
                            color: isDark ? 'rgba(246,251,255,0.62)' : 'text.secondary',
                          }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            mt: 1,
                            color: isDark ? '#f7fbff' : 'text.primary',
                            lineHeight: 1.35,
                          }}
                        >
                          {value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {features.map((feature) => (
            <Grid item xs={12} md={6} lg={4} key={feature.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 5,
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Stack spacing={1.5}>
                  {feature.icon}
                  <Typography variant="h5">{feature.title}</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: '1px solid',
            borderColor: 'divider',
            mb: 4,
          }}
        >
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            Why teams choose Workyn
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 820, mb: 3 }}>
            Workyn is designed for operators who want fewer disconnected tools and better visibility
            across the work that actually drives revenue, coordination, and service delivery.
          </Typography>

          <Grid container spacing={3}>
            {[
              'Keep chat, pipeline, resumes, and patient records in the same operational system.',
              'Use built-in AI suggestions and automation prompts without relying on external model providers.',
              'Upgrade cleanly from MVP workflows to production billing, uploads, analytics, and team collaboration.',
            ].map((point) => (
              <Grid item xs={12} md={4} key={point}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 4,
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ lineHeight: 1.7 }}>{point}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: '1px solid',
            borderColor: 'divider',
            mb: 4,
          }}
        >
          <Typography variant="h3" sx={{ mb: 3 }}>
            Frequently asked questions
          </Typography>
          <Stack divider={<Divider flexItem />} spacing={2}>
            {faqs.map((item) => (
              <Box key={item.question}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {item.question}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {item.answer}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(8,17,32,0.94) 0%, rgba(17,31,54,0.9) 100%)',
            color: '#f5fbff',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={3}
          >
            <Box>
              <Typography variant="h3" sx={{ mb: 1.5 }}>
                Launch Workyn and centralize your operations.
              </Typography>
              <Typography sx={{ color: 'rgba(245,251,255,0.76)', maxWidth: 780 }}>
                Start with the free plan, then unlock Pro for uploads, analytics, team
                collaboration, and stronger workspace controls as your company grows.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={RouterLink}
                to={user ? '/dashboard' : '/register'}
                variant="contained"
                color="secondary"
              >
                {user ? 'Open Workyn' : 'Start free'}
              </Button>
              <Button component={RouterLink} to="/login" variant="outlined" color="inherit">
                Sign in
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
