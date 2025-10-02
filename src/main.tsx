import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseProvider } from './context/SupabaseContext';
import { AuthProvider } from './context/AuthContext'; // 👈 import AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <BrowserRouter>
        <AuthProvider>   {/* 👈 wrap App with AuthProvider */}
          <App />
        </AuthProvider>
      </BrowserRouter>
    </SupabaseProvider>
  </StrictMode>
);
