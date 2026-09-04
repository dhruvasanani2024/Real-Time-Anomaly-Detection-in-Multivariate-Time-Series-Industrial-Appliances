import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00bcd4' },
    secondary: { main: '#ff4081' },
    background: { default: '#0a0a0a', paper: '#1a1a1a' },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppProvider>
        <div className="app">
          <Dashboard />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;