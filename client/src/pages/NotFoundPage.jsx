import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
    <Box textAlign="center">
      <Typography variant="h2" sx={{ mb: 2 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 1 }}>
        This page drifted out of the workspace.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Head back to Workyn and continue from your dashboard.
      </Typography>
      <Button component={Link} to="/dashboard" variant="contained">
        Go to dashboard
      </Button>
    </Box>
  </Container>
);

export default NotFoundPage;
