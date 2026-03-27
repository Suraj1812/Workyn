import { useCallback, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { buildTheme } from '../theme/index.js';
import ThemeModeContext from './theme-mode-context.js';

const getInitialMode = () => {
  const savedMode = localStorage.getItem('workyn-theme');

  if (savedMode) {
    return savedMode;
  }

  return 'light';
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  const toggleColorMode = useCallback(() => {
    setMode((previousMode) => {
      const nextMode = previousMode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('workyn-theme', nextMode);
      return nextMode;
    });
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
