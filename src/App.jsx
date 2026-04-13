import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './layout/layout.jsx';
import Forgot from './pages/Forgot.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ReservasD from './pages/ReservasD/ReservasD.jsx';
import ReservasDCatalogo from './pages/ReservasD/ReservasDCatalogo.jsx';
import Crear from './components/Crear.jsx';
import Editar from './components/Editar.jsx';
import Contactos from './pages/Contactos.jsx';
import GestionarReservas from './pages/ReservasD/GestionarReservas.jsx';
import ReservasDSolicitadas from './pages/ReservasD/ReservasDSolicitadas.jsx';
import ReservasH from './pages/reservasH.jsx';
import UsuariosH from './pages/UsuariosH.jsx';
import UsuariosE from './pages/UsuariosE.jsx';
import UsuariosC from './pages/UsuariosC.jsx';
import { ThemeProvider } from './context/Themecontext';
import RutaProtegida from './components/RutaProteccion.jsx';
import ReservarEspacioD from './pages/ReservasD/ReservarEspacioD.jsx';
import HabitacionD from './pages/HabitacionD.jsx';
import TipoHabitacion from './pages/TipoHabitacion.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />

          {/* RUTAS PROTEGIDAS — Layout con Outlet */}
          <Route path="/" element={<RutaProtegida><Layout /></RutaProtegida>}>

            <Route path="/home" element={<Home />}>
              <Route index element={<Contactos />} />
            </Route>

            <Route path="/contactos" element={<Contactos />} />

            {/* Reservas — cliente y admin */}
            <Route path="/reservas-deportivas" element={<ReservasD />}>
              <Route index element={<ReservasDCatalogo />} />
              <Route path="mis-reservas" element={<ReservasDSolicitadas />} />
              <Route path="reservar-espacio" element={<ReservarEspacioD />} />
              <Route path="gestionar" element={<GestionarReservas />} />
              <Route path="crear" element={<Crear />} />
              <Route path="editar" element={<Editar />} />
            </Route>

            <Route path="/reservas-hospedaje" element={<ReservasH />} />
            <Route path="/reservas-restaurante" element={<ReservasD />} />
            <Route path="/HabitacionD" element={<HabitacionD />} />
            <Route path="/TipoHabitacion" element={<TipoHabitacion />} />
            <Route path="/checkoutpage" element={<CheckoutPage />} />
            



            {/* Usuarios — solo ADMIN */}
            <Route path="/usuarios" element={
              <RutaProtegida soloAdmin={true}><UsuariosH /></RutaProtegida>
            } />
            <Route path="/usuarios-edit" element={
              <RutaProtegida soloAdmin={true}><UsuariosE /></RutaProtegida>
            } />
            <Route path="/usuarios-crear" element={
              <RutaProtegida soloAdmin={true}><UsuariosC /></RutaProtegida>
            } />


            {/* Gestión de Habitaciones — solo ADMIN */}
            <Route path="/nueva-habitacion" element={
              <RutaProtegida soloAdmin={true}><HabitacionD /></RutaProtegida>
            }/>

          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}