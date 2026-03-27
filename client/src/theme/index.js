import { alpha, createTheme } from '@mui/material/styles';

const paletteByMode = {
  light: {
    primary: '#0b7d77',
    secondary: '#fa8c16',
    surface: '#ffffff',
    background: '#f7f8fb',
    paper: '#ffffff',
    text: '#102033',
    secondaryText: '#516173',
    divider: 'rgba(16,32,51,0.08)',
    hover: 'rgba(11,125,119,0.06)',
  },
  dark: {
    primary: '#36d1c4',
    secondary: '#ffb155',
    surface: '#111827',
    background: '#0b1020',
    paper: '#111827',
    text: '#f3f6fb',
    secondaryText: '#98a7bd',
    divider: 'rgba(243,246,251,0.12)',
    hover: 'rgba(255,255,255,0.06)',
  },
};

export const buildTheme = (mode) => {
  const colors = paletteByMode[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.text,
        secondary: colors.secondaryText,
      },
      divider: colors.divider,
      action: {
        hover: colors.hover,
      },
    },
    typography: {
      fontFamily: '"Manrope", sans-serif',
      h1: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
      },
      h4: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
      },
      h5: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
      },
      h6: {
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 700,
      },
      button: {
        textTransform: 'none',
        fontWeight: 700,
      },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            color: colors.text,
            background: colors.background,
            transition: 'background 240ms ease',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: alpha(colors.surface, mode === 'dark' ? 0.94 : 0.92),
            color: colors.text,
            backdropFilter: 'blur(12px)',
            boxShadow: 'none',
            borderBottom: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: colors.surface,
            borderRight: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.paper,
            backdropFilter: 'none',
            border: 'none',
            boxShadow: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: colors.paper,
            border: 'none',
            boxShadow:
              mode === 'dark'
                ? '0 4px 16px rgba(0, 0, 0, 0.08)'
                : '0 4px 16px rgba(15, 23, 42, 0.03)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            paddingInline: 18,
            boxShadow: 'none',
          },
          outlined: {
            borderColor: alpha(colors.primary, mode === 'dark' ? 0.42 : 0.28),
            '&:hover': {
              borderColor: colors.primary,
              backgroundColor: 'transparent',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: 'none',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
            borderRadius: 8,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(colors.text, mode === 'dark' ? 0.12 : 0.1),
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(colors.text, mode === 'dark' ? 0.2 : 0.16),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
              borderWidth: 1.5,
            },
          },
          input: {
            color: colors.text,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: colors.secondaryText,
          },
        },
      },
    },
  });
};
