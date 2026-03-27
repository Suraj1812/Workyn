import { AutoAwesomeRounded, CloseRounded } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';

import { useAI } from '../../context/AIContext.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import LoadingScreen from '../LoadingScreen.jsx';
import AISuggestionList from './AISuggestionList.jsx';

const AIPanelDrawer = ({ open, onClose }) => {
  const {
    suggestions,
    automations,
    summary,
    loading,
    error,
    respondToSuggestion,
    toggleAutomation,
  } = useAI();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 420 },
          p: 3,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <AutoAwesomeRounded color="primary" />
          <Box>
            <Typography variant="h6">Workyn AI</Typography>
            <Typography variant="body2" color="text.secondary">
              In-house suggestions and automations
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <Chip label={`${summary.pendingSuggestions} pending`} color="primary" />
        <Chip label={`${summary.activeAutomations} active automations`} variant="outlined" />
        <Chip label={`${summary.reviewedSuggestions} reviewed`} variant="outlined" />
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingScreen label="Loading AI workspace..." />
      ) : (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              Pending suggestions
            </Typography>
            <AISuggestionList
              suggestions={suggestions}
              onAccept={(suggestionId) => respondToSuggestion(suggestionId, true)}
              onReject={(suggestionId) => respondToSuggestion(suggestionId, false)}
              emptyText="The AI engine is quiet for now. Keep using Workyn and it will surface new patterns."
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              Active automations
            </Typography>
            <Stack spacing={1.5}>
              {automations.length ? (
                automations.map((automation) => (
                  <Box
                    key={automation._id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          {automation.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                          {automation.description || 'No description provided.'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Trigger:{' '}
                          {Array.isArray(automation.trigger?.events)
                            ? automation.trigger.events.join(', ')
                            : automation.trigger?.event || 'custom'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Last update: {formatDateTime(automation.updatedAt)}
                        </Typography>
                      </Box>
                      <Switch
                        checked={automation.active}
                        onChange={(event) => toggleAutomation(automation._id, event.target.checked)}
                      />
                    </Stack>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  Accept AI suggestions to turn your repeated behaviors into automations.
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      )}
    </Drawer>
  );
};

export default AIPanelDrawer;
