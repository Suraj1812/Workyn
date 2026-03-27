import { Card, CardContent, Stack, Typography } from '@mui/material';

const SectionCard = ({ title, subtitle, children, action, sx = {} }) => (
  <Card sx={{ height: '100%', ...sx }}>
    <CardContent sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <div>
          <Typography variant="h6">{title}</Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </div>
        {action}
      </Stack>
      {children}
    </CardContent>
  </Card>
);

export default SectionCard;
