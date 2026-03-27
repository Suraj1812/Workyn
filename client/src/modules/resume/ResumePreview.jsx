import { Box, Chip, Divider, Stack, Typography } from '@mui/material';

const ResumePreview = ({ resume }) => (
  <Box
    sx={{
      p: { xs: 3, md: 4 },
      minHeight: 640,
      bgcolor: '#ffffff',
      color: '#0f172a',
      borderRadius: 3,
    }}
  >
    <Typography variant="h4" sx={{ color: '#0b7d77', mb: 0.75 }}>
      {resume.personal.fullName || 'Your Name'}
    </Typography>
    <Typography variant="h6" sx={{ mb: 1.5 }}>
      {resume.personal.title || 'Professional title'}
    </Typography>
    <Typography variant="body2">{resume.personal.email || 'you@example.com'}</Typography>
    <Typography variant="body2" sx={{ mb: 2.5 }}>
      {resume.personal.phone || '+91 00000 00000'}
    </Typography>

    <Divider sx={{ mb: 2.5 }} />

    <Typography variant="h6" sx={{ mb: 1 }}>
      Profile
    </Typography>
    <Typography variant="body1" sx={{ mb: 3 }}>
      {resume.personal.summary || 'Add a short summary to present your strengths and goals.'}
    </Typography>

    <Typography variant="h6" sx={{ mb: 1 }}>
      Skills
    </Typography>
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
      {(resume.skills.length ? resume.skills : ['Communication', 'Strategy', 'Execution']).map(
        (skill) => (
          <Chip
            key={skill}
            label={skill}
            sx={{ bgcolor: 'rgba(11,125,119,0.12)', color: '#0b7d77' }}
          />
        ),
      )}
    </Stack>

    <Typography variant="h6" sx={{ mb: 1.5 }}>
      Experience
    </Typography>
    <Stack spacing={2.5}>
      {(resume.experience.length ? resume.experience : [{}]).map((item, index) => (
        <Box key={`${item.company || 'experience'}-${index}`}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 0.75 }}
          >
            <Typography variant="subtitle1">
              {item.role || 'Role'} {item.company ? `at ${item.company}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {[item.startDate, item.endDate].filter(Boolean).join(' - ') || 'Start - End'}
            </Typography>
          </Stack>
          <Typography variant="body2">
            {item.summary || 'Describe your impact, responsibilities, and standout work here.'}
          </Typography>
        </Box>
      ))}
    </Stack>
  </Box>
);

export default ResumePreview;
