import { alpha, createTheme } from '@mui/material/styles';

const paletteByMode = {
  light: {
    primary: '#0b7d77',
    secondary: '#fa8c16',
    surface: '#ffffff',
    background: '#f4f7fb',
    paper: 'rgba(255,255,255,0.92)',
    text: '#102033',
    secondaryText: '#516173',
    divider: 'rgba(16,32,51,0.09)',
    hover: 'rgba(11,125,119,0.06)',
  },
  dark: {
    primary: '#36d1c4',
    secondary: '#ffb155',
    surface: '#10192c',
    background: '#081120',
    paper: 'rgba(16,25,44,0.92)',
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
      borderRadius: 18,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            color: colors.text,
            background:
              mode === 'dark'
                ? 'radial-gradient(circle at top left, rgba(73, 194, 255, 0.14), transparent 34%), radial-gradient(circle at top right, rgba(250, 177, 60, 0.14), transparent 32%), linear-gradient(180deg, #07111f 0%, #0d1726 100%)'
                : 'radial-gradient(circle at top left, rgba(11, 125, 119, 0.12), transparent 34%), radial-gradient(circle at top right, rgba(250, 140, 22, 0.14), transparent 30%), linear-gradient(180deg, #f6fbff 0%, #eef4fa 100%)',
            transition: 'background 240ms ease',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage:
              mode === 'dark'
                ? 'linear-gradient(135deg, rgba(10,21,38,0.95), rgba(17,31,54,0.88))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,246,255,0.92))',
            color: colors.text,
            backdropFilter: 'blur(18px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${alpha(colors.text, 0.08)}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background:
              mode === 'dark'
                ? 'linear-gradient(180deg, rgba(9,17,30,0.98), rgba(13,24,42,0.96))'
                : 'linear-gradient(180deg, rgba(247,251,255,0.98), rgba(237,245,252,0.95))',
            borderRight: `1px solid ${alpha(colors.text, 0.08)}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.paper,
            backdropFilter: 'blur(18px)',
            border: `1px solid ${colors.divider}`,
            boxShadow:
              mode === 'dark'
                ? '0 20px 45px rgba(0, 0, 0, 0.22)'
                : '0 20px 45px rgba(15, 23, 42, 0.06)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: colors.paper,
            border: `1px solid ${colors.divider}`,
            boxShadow:
              mode === 'dark'
                ? '0 24px 60px rgba(0, 0, 0, 0.32)'
                : '0 24px 60px rgba(15, 23, 42, 0.08)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingInline: 18,
          },
          outlined: {
            borderColor: alpha(colors.primary, mode === 'dark' ? 0.42 : 0.28),
            '&:hover': {
              borderColor: colors.primary,
              backgroundColor: alpha(colors.primary, mode === 'dark' ? 0.12 : 0.08),
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            border: `1px solid ${alpha(colors.text, mode === 'dark' ? 0.12 : 0.08)}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.74)',
            borderRadius: 14,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(colors.text, mode === 'dark' ? 0.16 : 0.14),
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(colors.primary, 0.5),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
              borderWidth: 2,
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
