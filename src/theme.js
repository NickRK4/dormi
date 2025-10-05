import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance with a red color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f',  // Red 700
      light: '#ef5350', // Red 400
      dark: '#b71c1c',  // Red 900
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff9800',  // Orange 500
      light: '#ffb74d', // Orange 300
      dark: '#f57c00',  // Orange 700
      contrastText: '#fff',
    },
    error: {
      main: red[500],
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
