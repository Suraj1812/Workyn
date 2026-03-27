import { Box, Button, Typography } from '@mui/material';

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <Box
    sx={{
      py: 6,
      px: 3,
      textAlign: 'center',
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 3,
    }}
  >
    <Typography variant="h6" sx={{ mb: 1 }}>
      {title}
    </Typography>
    <Typography color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: onAction ? 3 : 0 }}>
      {description}
    </Typography>
    {onAction ? (
      <Button variant="contained" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </Box>
);

export default EmptyState;
