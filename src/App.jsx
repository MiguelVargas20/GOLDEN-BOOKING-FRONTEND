import Layout from './layout/layout.jsx';
import Forgot from './pages/Forgot.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ReservasD from './pages/ReservasD/ReservasD.jsx';
import ReservasDCatalogo from './pages/ReservasD/ReservasDCatalogo.jsx';
import Crear from './components/Crear.jsx';
import Editar from './components/Editar.jsx'
import Contactos from './pages/Contactos.jsx';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import GestionarReservas from './pages/ReservasD/GestionarReservas.jsx';
import ReservasDSolicitadas from './pages/ReservasD/ReservasDSolicitadas.jsx';
import ReservarEspacio from './pages/ReservasD/ReservarEspacio.jsx'
import Booking from './pages/Booking.jsx';
import ReservasH from './pages/reservasH.jsx';
import UsuariosH from './pages/UsuariosH.jsx';
import UsuariosC from './pages/UsuariosC.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*RUTA PRINCIPAL*/}
        <Route path="/" element={<Navigate to="/login" />} />

        {/*RUTAS SECUNDARIAS*/}
        <Route element={<Layout/>}>

          <Route path="/home" element={<Home />} >
            <Route index element={<Contactos/>}></Route>
          </Route>

          <Route path='/contactos' element={<Contactos />} />
          <Route path="/usuarios" element={<UsuariosH />} />
          <Route path="/usuariosc" element={<UsuariosC />} />

          <Route path='/reservas-deportivas' element={<ReservasD />}>
            <Route index element={<ReservasDCatalogo/>}/>
            <Route path='mis-reservas' element={<ReservasDSolicitadas />}/>
            <Route path='reservar-espacio' element={<ReservarEspacio/>} />
            <Route path='gestionar' element={<GestionarReservas/>} />
            <Route path='crear' element={<Crear/>} />
            <Route path='editar' element={<Editar/>} />
          </Route>

          <Route path='/reservas-hospedaje' element={<ReservasH />} />
          <Route path='/reservas-restaurante' element={<ReservasD />} />

        </Route>
        
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        
      </Routes>
    </BrowserRouter>
    
  )
}

