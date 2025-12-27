import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App';
import { AuthProvider } from './hooks/AuthContext';
import './global.css';

// Remove StrictMode to avoid double-invocation of effects in dev (reduces flicker)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
);
