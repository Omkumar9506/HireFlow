import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { NotificationProvider } from './store/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
