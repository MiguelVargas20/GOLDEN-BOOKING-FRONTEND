import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';

import App from './App.jsx';
import Forgot from './pages/Forgot.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>a
    <BrowserRouter>
    <Routes>
      {/*RUTA PRINCIPAL*/}
      <Route path="/" element={<App> </App>} />

      {/*RUTAS SECUNDARIAS*/}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/home" element={<Home />} />
      
    </Routes>
    </BrowserRouter>
    
  </StrictMode>
)
