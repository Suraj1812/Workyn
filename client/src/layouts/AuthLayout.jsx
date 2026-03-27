import { Box, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      py: 5,
    }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              height: '100%',
              p: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background:
                'linear-gradient(180deg, rgba(10,19,36,0.92) 0%, rgba(17,35,61,0.88) 100%)',
              color: '#f6f8fb',
            }}
          >
            <div>
              <Chip label="Workyn SaaS" color="secondary" sx={{ mb: 3, fontWeight: 700 }} />
              <Typography variant="h3" sx={{ mb: 2, maxWidth: 360 }}>
                The operating system for modern teams and practices.
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.72)', maxWidth: 430 }}>
                Bring conversations, leads, resumes, and patient workflows into one focused
                workspace with real-time collaboration at the center.
              </Typography>
            </div>

            <Stack spacing={2} sx={{ mt: 4 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Real-time chat for teams
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                CRM pipeline and activity tracking
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Resume builder with PDF export
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Clinic and appointment management
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 3, md: 4 }, minHeight: '100%' }}>
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default AuthLayout;
