import { alpha } from '@mui/material/styles';
import { Card, CardContent, Stack, Typography } from '@mui/material';

const StatCard = ({ icon, label, value, accent = 'primary.main' }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 3,
      bgcolor: 'background.paper',
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
            width: 44,
            height: 44,
            borderRadius: 2,
            color: accent,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          {icon}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default StatCard;
