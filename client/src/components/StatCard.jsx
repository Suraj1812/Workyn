import { alpha } from '@mui/material/styles';
import { Card, CardContent, Stack, Typography } from '@mui/material';

const StatCard = ({ icon, label, value, accent = 'primary.main' }) => (
  <Card
    sx={{
      height: '100%',
      background: (theme) =>
        `linear-gradient(160deg, ${alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.04 : 0.75)}, ${alpha(
          theme.palette.primary.main,
          theme.palette.mode === 'dark' ? 0.14 : 0.1,
        )})`,
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <div>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </div>
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            color: accent,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          }}
        >
          {icon}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default StatCard;
