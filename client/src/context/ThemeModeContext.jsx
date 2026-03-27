import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { buildTheme } from '../theme/index.js';

const ThemeModeContext = createContext(null);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('workyn-theme') || 'dark');

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

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider.');
  }

  return context;
};
