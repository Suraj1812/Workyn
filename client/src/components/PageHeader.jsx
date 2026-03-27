import { Box, Chip, Stack, Typography } from '@mui/material';

const PageHeader = ({ eyebrow, title, subtitle, action }) => (
  <Stack
    direction={{ xs: 'column', md: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'flex-start', md: 'center' }}
    spacing={2}
    sx={{ mb: 3 }}
  >
    <Box>
      {eyebrow ? (
        <Chip label={eyebrow} size="small" color="secondary" sx={{ mb: 1, fontWeight: 700 }} />
      ) : null}
      <Typography variant="h4" sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
    </Box>
    {action}
  </Stack>
);

export default PageHeader;
