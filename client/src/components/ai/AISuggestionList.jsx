import { AutoFixHighRounded, BoltRounded, SmartToyRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';

const moduleColors = {
  chat: 'info',
  crm: 'warning',
  resume: 'secondary',
  clinic: 'success',
  dashboard: 'primary',
};

const typeIcons = {
  automation: <BoltRounded fontSize="small" />,
  template: <AutoFixHighRounded fontSize="small" />,
  default: <SmartToyRounded fontSize="small" />,
};

const AISuggestionList = ({
  suggestions,
  onAccept,
  onReject,
  emptyText = 'No AI suggestions right now.',
  compact = false,
}) => {
  const [busySuggestionId, setBusySuggestionId] = useState('');

  if (!suggestions.length) {
    return (
      <Typography color="text.secondary" variant={compact ? 'body2' : 'body1'}>
        {emptyText}
      </Typography>
    );
  }

  const handleAction = async (suggestionId, accepted) => {
    setBusySuggestionId(suggestionId);

    try {
      if (accepted) {
        await onAccept?.(suggestionId);
      } else {
        await onReject?.(suggestionId);
      }
    } finally {
      setBusySuggestionId('');
    }
  };

  return (
    <Stack spacing={compact ? 1.5 : 2}>
      {suggestions.map((suggestion) => (
        <Card key={suggestion._id} sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: compact ? 2 : 2.5, '&:last-child': { pb: compact ? 2 : 2.5 } }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  size="small"
                  icon={typeIcons[suggestion.type] || typeIcons.default}
                  label={suggestion.type.replace(/_/g, ' ')}
                />
                <Chip
                  size="small"
                  color={moduleColors[suggestion.module] || 'default'}
                  label={suggestion.module}
                  variant="outlined"
                />
                {suggestion.automationPayload ? (
                  <Chip size="small" color="primary" label="Can automate" />
                ) : null}
              </Stack>

              <Box>
                <Typography variant={compact ? 'subtitle2' : 'subtitle1'} sx={{ mb: 0.5 }}>
                  {suggestion.title}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {suggestion.message}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAction(suggestion._id, true)}
                  disabled={busySuggestionId === suggestion._id}
                >
                  {busySuggestionId === suggestion._id ? 'Working...' : 'Accept'}
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  onClick={() => handleAction(suggestion._id, false)}
                  disabled={busySuggestionId === suggestion._id}
                >
                  Reject
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default AISuggestionList;
