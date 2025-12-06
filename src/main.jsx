import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';

import App from './App.jsx';
import Layout from './layout/layout.jsx';
import Forgot from './pages/Forgot.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Prueba from './pages/Prueba.jsx';
import Register from './pages/Register.jsx';
import ReservasD from './pages/ReservasD.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      {/*RUTA PRINCIPAL*/}
      <Route path="/" element={<App> </App>} />

      {/*RUTAS SECUNDARIAS*/}
      <Route element={<Layout/>}>
        <Route path="/prueba" element={<Prueba />} />
        <Route path="/home" element={<Home />} />
      </Route>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot" element={<Forgot />} />

      <Route path='/reservas-deportivas' element={<ReservasD />} />
      
    </Routes>
    </BrowserRouter>
    
  </StrictMode>
)
