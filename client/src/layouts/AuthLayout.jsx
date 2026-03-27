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
              background: 'transparent',
              color: 'text.primary',
            }}
          >
            <div>
              <Chip label="Workyn SaaS" color="secondary" sx={{ mb: 3, fontWeight: 700 }} />
              <Typography variant="h3" sx={{ mb: 2, maxWidth: 360 }}>
                The operating system for modern teams and practices.
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 430 }}>
                Bring conversations, leads, resumes, and patient workflows into one focused
                workspace with real-time collaboration at the center.
              </Typography>
            </div>

            <Stack spacing={2} sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Real-time chat for teams
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CRM pipeline and activity tracking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resume builder with PDF export
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clinic and appointment management
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 3, md: 4 }, minHeight: '100%', borderRadius: 5 }}>
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default AuthLayout;
