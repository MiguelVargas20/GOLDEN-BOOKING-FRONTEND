// 1. LIBRERÍAS Y ESTILOS GLOBALES
import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';

// 2. CONTEXTOS Y COMPONENTES DE CONTROL
import { ThemeProvider } from './shared/context/ThemeContext';
import Layout from './shared/layout/Layout.jsx';
import RutaProtegida from './shared/components/RutaProteccion.jsx';

// 3. VISTAS / PÁGINAS DEL SISTEMA

// Módulo: Autenticación (Públicas)
import Login from './modules/auth/pages/Login.jsx';
import Register from './modules/auth/pages/Register.jsx';
import Forgot from './modules/auth/pages/Forgot.jsx';

// Módulo: General / Dashboard (Privadas)
import Inicio from './modules/home/pages/Inicio.jsx';
import Contactos from './modules/mensajes/pages/Contactos.jsx';

// Módulo: Reservas Deportivas (Clientes / Admin)
import ReservasD from './modules/reservasDeportivas/pages/ReservasD.jsx';
import ReservasDCatalogo from './modules/reservasDeportivas/pages/ReservasDCatalogo.jsx';
import ReservarEspacioD from './modules/reservasDeportivas/pages/ReservarEspacioD.jsx';
import ReservasDSolicitadas from './modules/reservasDeportivas/pages/ReservasDSolicitadas.jsx';
import GestionarReservas from './modules/reservasDeportivas/pages/GestionarReservas.jsx';
import GestionEspacios from './modules/reservasDeportivas/pages/GestionEspacios.jsx';

// Módulo: Habitaciones (catálogo y detalle para todos; gestión, creación y tipos para ADMIN)
import CatalogoHabitaciones from './modules/habitaciones/pages/CatalogoHabitaciones.jsx';
import DetalleHabitacion from './modules/habitaciones/pages/DetalleHabitacion.jsx';
import GestionHabitaciones from './modules/habitaciones/pages/GestionHabitaciones.jsx';
import CrearHabitacion from './modules/habitaciones/pages/CrearHabitacion.jsx';
import TiposHabitacion from './modules/habitaciones/pages/TiposHabitacion.jsx';

// Módulo: Reservas Hoteleras (solo reservas: las del cliente y la gestión del ADMIN)
import MisReservasHotel from './modules/reservasHoteleras/pages/MisReservasHotel.jsx';
import GestionarReservasHotel from './modules/reservasHoteleras/pages/GestionarReservasHotel.jsx';

// Módulo: Recepción (ADMIN reserva a nombre de un cliente)
import NuevaReservaCliente from './modules/recepcion/pages/NuevaReservaCliente.jsx';


// Módulo: Gestión de Usuarios (Exclusivo ADMIN)
import UsuariosH from './modules/usuarios/pages/UsuariosH.jsx';
import UsuariosE from './modules/usuarios/pages/UsuariosE.jsx';
import UsuariosC from './modules/usuarios/pages/UsuariosC.jsx';
import MiPerfil from './modules/usuarios/pages/MiPerfil.jsx';

// Módulo: Mensajes (Exclusivo ADMIN)
import  AdminMensajes  from "./modules/mensajes/pages/AdminMensajes.jsx";

// Módulo: Mensajes (Usuario normal — ve sus propios mensajes y respuestas del admin)
import MisMensajes from './modules/mensajes/pages/MisMensajes.jsx';

// Módulo: Verificación de cuenta (Público)
import VerificarCuenta from './modules/auth/pages/VerificarCuenta.jsx';

// Módulo: Restablecimiento de contraseña (Público)
import RestablecerPassword from './modules/auth/pages/RestablecerPassword.jsx';


/**
 * Componente Principal de la Aplicación (App)
 * Configura el proveedor de tema, el enrutamiento dinámico de React Router Dom v6
 * y la división de accesos según el estado de autenticación y roles de usuario.
 */
/** /detalle/:id (ruta anterior) → /habitaciones/:id */
function RedireccionDetalleHabitacion() {
    const { id } = useParams();
    return <Navigate to={`/habitaciones/${id}`} replace />;
}

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

                    <Route path="/verificar-cuenta" element={<VerificarCuenta />} />

                    <Route path="/restablecer-password" element={<RestablecerPassword />} />

                    {/* =========================================================
                        RUTAS PROTEGIDAS GLOBALMENTE (Requieren sesión activa)
                        Todas heredan el Layout maestro (Navbar, Contenido dinámico, Footer)
                        ========================================================= */}
                    <Route path="/" element={<RutaProtegida><Layout /></RutaProtegida>}>

                        {/* Vista de Inicio del Sistema */}
                        {/* Admin: panel de control (dashboard). Cliente: portada con los servicios. */}
                        <Route path="/home" element={<Inicio />} />

                        {/* Sección informativa / Formulario de contacto directo */}
                        <Route path="/contactos" element={<Contactos />} />

                        {/* Vista de perfil del usuario en sesión (Datos personales, historial, etc.) */}
                        <Route path="/mi-perfil" element={<MiPerfil />} />

                        {/* Historial de mensajes que el usuario en sesión envió, con respuestas del admin */}
                        <Route path="/mis-mensajes" element={<MisMensajes />} />

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
                            {/* FIX hallazgo #14: esta ruta y las 2 siguientes (crear/editar) no tenían
                                soloAdmin={true}, a diferencia de /usuarios, /mensajes, /crear-habitacion
                                y /gestionar-habitaciones que sí lo llevan. Cualquier CLIENTE autenticado
                                que tecleara la URL directamente veía el panel de gestión deportiva. */}
                            <Route path="gestionar" element={
                                <RutaProtegida soloAdmin={true}><GestionarReservas /></RutaProtegida>
                            } />

                            {/* Administración de espacios deportivos (crear, editar, imagen, estado) */}
                            <Route path="espacios" element={
                                <RutaProtegida soloAdmin={true}><GestionEspacios /></RutaProtegida>
                            } />

                            {/* Se quitaron las rutas "crear" y "editar": eran formularios de
                                maqueta sin ninguna lógica (no guardaban nada) y ninguna pantalla
                                navegaba hacia ellos. */}
                        </Route>

                        {/* -----------------------------------------------------
                            HABITACIONES — todo lo de las habitaciones
                            ----------------------------------------------------- */}
                        {/* Catálogo: ver disponibilidad y reservar (clientes y admin) */}
                        <Route path="/habitaciones" element={<CatalogoHabitaciones />} />
                        {/* Solo ADMIN: administrar, crear y tipos de habitación */}
                        <Route path="/habitaciones/gestionar" element={
                            <RutaProtegida soloAdmin={true}><GestionHabitaciones /></RutaProtegida>
                        } />
                        <Route path="/habitaciones/crear" element={
                            <RutaProtegida soloAdmin={true}><CrearHabitacion /></RutaProtegida>
                        } />
                        <Route path="/habitaciones/tipos" element={
                            <RutaProtegida soloAdmin={true}><TiposHabitacion /></RutaProtegida>
                        } />
                        {/* Detalle de una habitación (las rutas fijas de arriba tienen prioridad) */}
                        <Route path="/habitaciones/:id" element={<DetalleHabitacion />} />

                        {/* -----------------------------------------------------
                            RESERVAS HOTELERAS — solo las reservas
                            ----------------------------------------------------- */}
                        <Route path="/reservas-hoteleras/mis-reservas" element={<MisReservasHotel />} />
                        {/* Gestión de reservas hoteleras: aprobar / cancelar con motivo */}
                        <Route path="/reservas-hoteleras/gestionar" element={
                            <RutaProtegida soloAdmin={true}><GestionarReservasHotel /></RutaProtegida>
                        } />

                        {/* Rutas anteriores: redirigen a las nuevas para no romper enlaces guardados */}
                        <Route path="/reservas-hospedaje" element={<Navigate to="/habitaciones" replace />} />
                        <Route path="/tipo-habitacion" element={<Navigate to="/habitaciones/tipos" replace />} />
                        <Route path="/crear-habitacion" element={<Navigate to="/habitaciones/crear" replace />} />
                        <Route path="/gestionar-habitaciones" element={<Navigate to="/habitaciones/gestionar" replace />} />
                        <Route path="/mis-reservas-hotel" element={<Navigate to="/reservas-hoteleras/mis-reservas" replace />} />
                        <Route path="/detalle/:id" element={<RedireccionDetalleHabitacion />} />

                        {/* Recepción: registrar una reserva (deportiva u hotelera) a nombre de un cliente */}
                        <Route path="/recepcion/nueva-reserva" element={
                            <RutaProtegida soloAdmin={true}><NuevaReservaCliente /></RutaProtegida>
                        } />

                        {/* =========================================================
                            RUTAS PROTEGIDAS CON PRIVILEGIOS DE ADMINISTRADOR
                            (Filtro estricto por rol 'ROL_ADMIN')
                            ========================================================= */}
                        
                        {/* --- PANEL DE CONTROL (indicadores del día, pendientes, habitaciones) --- */}
                        {/* El dashboard ahora es el Inicio del admin; la ruta vieja redirige */}
                        <Route path="/dashboard" element={<Navigate to="/home" replace />} />

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

                        {/* --- MÓDULO CONTROL DE MENSAJES --- */}
                        <Route path="/mensajes" element={
                            <RutaProtegida soloAdmin={true}><AdminMensajes /></RutaProtegida>
                        } />

                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}