import { Grid, Skeleton, Stack } from '@mui/material';

const PageSkeleton = ({ cards = 4 }) => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={96} />
    <Grid container spacing={3}>
      {Array.from({ length: cards }).map((_, index) => (
        <Grid item xs={12} sm={6} lg={3} key={`skeleton-card-${index}`}>
          <Skeleton variant="rounded" height={160} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rounded" height={320} />
  </Stack>
);

export default PageSkeleton;
