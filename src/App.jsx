// 1. LIBRERÍAS Y ESTILOS GLOBALES
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. CONTEXTOS Y COMPONENTES DE CONTROL
import { ThemeProvider } from './context/Themecontext';
import Layout from './layout/layout.jsx';
import RutaProtegida from './components/RutaProteccion.jsx';

// 3. VISTAS / PÁGINAS DEL SISTEMA

// Módulo: Autenticación (Públicas)
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Forgot from './pages/Forgot.jsx';

// Módulo: General / Dashboard (Privadas)
import Home from './pages/Home.jsx';
import Contactos from './pages/Contactos.jsx';

// Módulo: Reservas Deportivas (Clientes / Admin)
import ReservasD from './pages/ReservasD/ReservasD.jsx';
import ReservasDCatalogo from './pages/ReservasD/ReservasDCatalogo.jsx';
import ReservarEspacioD from './pages/ReservasD/ReservarEspacioD.jsx';
import ReservasDSolicitadas from './pages/ReservasD/ReservasDSolicitadas.jsx';
import GestionarReservas from './pages/ReservasD/GestionarReservas.jsx';
import Crear from './components/Crear.jsx';
import Editar from './components/Editar.jsx';

// Módulo: Hospedaje / Habitaciones (Clientes / Admin)
import ReservasH from './pages/reservasH.jsx';
import HabitacionD from './pages/HabitacionD.jsx';
import TipoHabitacionD from './pages/TipoHabitacionD.jsx';
import GestionHabitacionesD from './pages/GestionHabitacionesD.jsx';
import DetalleHabitacion from "./pages/DetalleHabitacion";

// Módulo: Gestión de Usuarios (Exclusivo ADMIN)
import UsuariosH from './pages/UsuariosH.jsx';
import UsuariosE from './pages/UsuariosE.jsx';
import UsuariosC from './pages/UsuariosC.jsx';
import MiPerfil from './pages/MiPerfil.jsx';

/**
 * Componente Principal de la Aplicación (App)
 * Configura el proveedor de tema, el enrutamiento dinámico de React Router Dom v6
 * y la división de accesos según el estado de autenticación y roles de usuario.
 */
export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    
                    {/* =========================================================
                        RUTAS PÚBLICAS (Accesibles sin iniciar sesión)
                        ========================================================= */}
                    {/* Redirección inicial: Envía la raíz al login directamente */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    
                    {/* Pantalla de inicio de sesión estándar */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Formulario de auto-registro para nuevos clientes */}
                    <Route path="/register" element={<Register />} />
                    
                    {/* Formulario de recuperación de contraseñas olvidadas */}
                    <Route path="/forgot" element={<Forgot />} />

                    {/* =========================================================
                        RUTAS PROTEGIDAS GLOBALMENTE (Requieren sesión activa)
                        Todas heredan el Layout maestro (Navbar, Contenido dinámico, Footer)
                        ========================================================= */}
                    <Route path="/" element={<RutaProtegida><Layout /></RutaProtegida>}>

                        {/* Vista de Inicio del Sistema */}
                        <Route path="/home" element={<Home />}>
                            {/* Sub-vista por defecto en Home: Muestra los contactos */}
                            <Route index element={<Contactos />} />
                        </Route>

                        {/* Sección informativa / Formulario de contacto directo */}
                        <Route path="/contactos" element={<Contactos />} />

                        {/* Vista de perfil del usuario en sesión (Datos personales, historial, etc.) */}
                        <Route path="/mi-perfil" element={<MiPerfil />} />

                        {/* -----------------------------------------------------
                            SUB-SISTEMA: RESERVAS DEPORTIVAS (Pádel, Tenis, etc.)
                            ----------------------------------------------------- */}
                        <Route path="/reservas-deportivas" element={<ReservasD />}>
                            {/* Index: Catálogo o panel principal de opciones deportivas */}
                            <Route index element={<ReservasDCatalogo />} />
                            
                            {/* Historial o listado de reservas del usuario en sesión */}
                            <Route path="mis-reservas" element={<ReservasDSolicitadas />} />
                            
                            {/* Formulario o grilla horaria para agendar una nueva cancha */}
                            <Route path="reservar-espacio" element={<ReservarEspacioD />} />
                            
                            {/* Panel administrativo para aprobar, cancelar o ver todas las canchas */}
                            <Route path="gestionar" element={<GestionarReservas />} />
                            
                            {/* Formulario de creación de nuevos espacios/canchas */}
                            <Route path="crear" element={<Crear />} />
                            
                            {/* Formulario de modificación de parámetros de espacios deportivos */}
                            <Route path="editar" element={<Editar />} />
                        </Route>

                        {/* -----------------------------------------------------
                            SUB-SISTEMA: HOSPEDAJE Y RESTAURANTE
                            ----------------------------------------------------- */}
                        {/* Panel principal de reservas hoteleras para clientes */}
                        <Route path="/reservas-hospedaje" element={<ReservasH />} />
                        
                        {/* Panel principal de reservas del restaurante de la sede */}
                        <Route path="/reservas-restaurante" element={<ReservasD />} />

                        {/* Vista general o detalle técnico de habitaciones */}
                        <Route path="/habitacionD" element={<HabitacionD />} />
                        
                        {/* Configuración y listado de tipos de habitación (Deluxe, Suite, etc.) */}
                        <Route path="/tipo-habitacion" element={<TipoHabitacionD />} />
                        
                        {/* Panel de administración de habitaciones (Disponibilidad, Precios, Estados) */}
                        <Route path="/detalle/:id" element={<DetalleHabitacion />} />|

                        {/* =========================================================
                            RUTAS PROTEGIDAS CON PRIVILEGIOS DE ADMINISTRADOR
                            (Filtro estricto por rol 'ROL_ADMIN')
                            ========================================================= */}
                        
                        {/* --- MÓDULO CONTROL DE USUARIOS --- */}
                        {/* Tabla principal de control, visualización y auditoría de usuarios */}
                        <Route path="/usuarios" element={
                            <RutaProtegida soloAdmin={true}><UsuariosH /></RutaProtegida>
                        } />
                        
                        {/* Formulario de edición de perfiles o cambio de roles */}
                        <Route path="/usuarios-edit" element={
                            <RutaProtegida soloAdmin={true}><UsuariosE /></RutaProtegida>
                        } />
                        
                        {/* Formulario de alta para personal administrativo interno */}
                        <Route path="/usuarios-crear" element={
                            <RutaProtegida soloAdmin={true}><UsuariosC /></RutaProtegida>
                        } />

                        

                        {/* --- MÓDULO CONTROL DE INFRAESTRUCTURA HOTELERA --- */}
                        {/* Formulario exclusivo para registrar nuevas habitaciones al catálogo */}
                        <Route path="/crear-habitacion" element={
                            <RutaProtegida soloAdmin={true}><HabitacionD /></RutaProtegida>
                        } />
                        
                        {/* Panel de administración hotelera (Modificar disponibilidad, precios, estados) */}
                        <Route path="/gestionar-habitaciones" element={
                            <RutaProtegida soloAdmin={true}><GestionHabitacionesD /></RutaProtegida>
                        } />

                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}