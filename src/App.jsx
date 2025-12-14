import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layout/layout.jsx';
import Contactos from './pages/Contactos.jsx';
import Forgot from './pages/Forgot.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Prueba from './pages/Prueba.jsx';
import Register from './pages/Register.jsx';
import ReservasD from './pages/ReservasD.jsx';
import UsuariosH from './pages/UsuariosH.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*RUTA PRINCIPAL*/}
        <Route path="/" element={<Login> </Login>} />

        {/*RUTAS SECUNDARIAS*/}
        <Route element={<Layout/>}>
          <Route path="/prueba" element={<Prueba />} />
          <Route path="/home" element={<Home />} />
          <Route path="/usuarios" element={<UsuariosH />} />
          <Route path="/crear-usuarios" element={<UsuariosC />} />
          <Route path="/contactos" element={<Contactos />} />
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path='/reservas-deportivas' element={<ReservasD />} />
        
      </Routes>
    </BrowserRouter>
    
  )
}

