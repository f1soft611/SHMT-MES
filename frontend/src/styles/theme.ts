import { createTheme } from '@mui/material/styles';
import { koKR } from '@mui/x-data-grid/locales';

export const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#043269',
      },
      secondary: {
        main: '#F90049',
      },
      background: {
        default: '#f5f5f5',
      },
    },
    typography: {
      fontFamily: [
        'Pretendard GOV',
        'Pretendard',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontSize: '2.5rem' },
      h2: { fontSize: '2rem' },
      h3: { fontSize: '1.75rem' },
      h4: { fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1.125rem', fontWeight: 600 },
      body1: { fontSize: '1.125rem' },
      body2: { fontSize: '1rem' },
      button: { fontSize: '1rem' },
      caption: { fontSize: '0.875rem' },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  },
  koKR // ✅ 이 부분이 핵심! MUI X DataGrid의 한글 locale 적용
);
