import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Bootstrap primero (la base)
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. Tus estilos globales después (para que puedan sobrescribir a Bootstrap)
import './index.css';
import './styles/theme.css';

import './styles/dark-mode-overrides.css';   // ← nuevo, va último

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
)