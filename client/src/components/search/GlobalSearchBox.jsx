import { SearchRounded } from '@mui/icons-material';
import {
  CircularProgress,
  ClickAwayListener,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';
import searchService from '../../services/searchService.js';

const GlobalSearchBox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queryValue, setQueryValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(queryValue, 350);
  const isPro = user?.currentWorkspace?.plan === 'pro';

  useEffect(() => {
    if (!debouncedQuery.trim() || !isPro) {
      setResults([]);
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      try {
        const response = await searchService.search(debouncedQuery);
        setResults(response.results || []);
      } catch (_error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [debouncedQuery, isPro]);

  return (
    <ClickAwayListener onClickAway={() => setResults([])}>
      <Stack sx={{ position: 'relative', width: { xs: '100%', md: 320 } }}>
        <TextField
          size="small"
          placeholder={isPro ? 'Search across Workyn' : 'Search available on Pro'}
          value={queryValue}
          onChange={(event) => setQueryValue(event.target.value)}
          disabled={!isPro}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : null,
          }}
        />

        {results.length ? (
          <Paper
            sx={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 15,
              p: 1,
            }}
          >
            <List disablePadding>
              {results.map((result) => (
                <ListItemButton
                  key={`${result.type}-${result.id}`}
                  onClick={() => {
                    navigate(result.link);
                    setQueryValue('');
                    setResults([]);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemText
                    primary={result.title}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {result.type.toUpperCase()} • {result.subtitle}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        ) : null}
      </Stack>
    </ClickAwayListener>
  );
};

export default GlobalSearchBox;
