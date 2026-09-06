import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material/styles';

import { App } from './App';
import './global.css';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-body)',
    button: { textTransform: 'none', fontSize: 'var(--step--1)' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, color: 'inherit' },
      styleOverrides: { root: { minHeight: 44, paddingInline: 20 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
    },
  },
});

const rootElement = document.querySelector('#root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
