import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = ({ label = 'Loading...', fullscreen = false }) => (
  <Box
    sx={{
      minHeight: fullscreen ? '100vh' : 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <CircularProgress color="primary" />
    <Typography color="text.secondary">{label}</Typography>
  </Box>
);

export default LoadingScreen;
