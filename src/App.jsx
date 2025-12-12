import Layout from './layout/layout.jsx';
import Forgot from './pages/Forgot.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Prueba from './pages/Prueba.jsx';
import Register from './pages/Register.jsx';
import ReservasD from './pages/ReservasD/ReservasD.jsx';
import ReservasDCatalogo from './pages/ReservasD/ReservasDCatalogo.jsx';

import Contactos from './pages/Contactos.jsx';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ReservaD from './components/ReservaD.jsx';
import ReservasDSolicitadas from './pages/ReservasD/ReservasDSolicitadas.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*RUTA PRINCIPAL*/}
        <Route path="/" element={<Navigate to="/login" />} />

        {/*RUTAS SECUNDARIAS*/}
        <Route element={<Layout/>}>
          <Route path="/prueba" element={<Prueba />} />
          <Route path="/home" element={<Home />} >
            <Route index element={<Contactos/>}></Route>
          </Route>
          <Route path='/contactos' element={<Contactos />} />
          <Route path='/usuarios' element={<Contactos />} />
          <Route path='/reservas-deportivas' element={<ReservasD />}>
            <Route index element={<ReservasDCatalogo/>}></Route>
            <Route path='mis-reservas' element={<ReservasDSolicitadas />}></Route>
          </Route>
          <Route path='/reservas-hospedaje' element={<ReservasD />} />
          <Route path='/reservas-restaurante' element={<ReservasD />} />
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        
      </Routes>
    </BrowserRouter>
    
  )
}

