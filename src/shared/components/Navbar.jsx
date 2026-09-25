import { useState, useEffect } from 'react'; 
import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/LOGO.png';
import styles from '../styles/Navbar.module.css';
import { useTheme } from '../context/ThemeContext.jsx';
import { BsSun, BsMoonStarsFill, BsBoxArrowRight, BsPersonCircle } from 'react-icons/bs';
import { MdSportsTennis, MdKingBed, MdAddBox, MdCategory } from 'react-icons/md';
import { BsCalendarCheck, BsClockHistory, BsGrid, BsSearch, BsPersonPlus } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext.jsx';
import Swal from 'sweetalert2';

// 1. Notificaciones para el ADMIN (mensajes sin leer en la bandeja)
import { useMensajesNoLeidos } from "../../modules/mensajes/hooks/useMensajesNoLeidos";
// 🆕 Notificaciones para el USUARIO NORMAL (respuestas del admin que no ha visto)
import { useRespuestasNoVistas } from "../../modules/mensajes/hooks/useRespuestasNoVistas";
import { BiBell } from "react-icons/bi";
// Reservas pendientes de aprobación (contador para el ADMIN)
import { useReservasPendientes } from "../hooks/useReservasPendientes";

/**
 * Componente ComponentNavbar
 * Barra de navegación principal y adaptativa (responsive) para Golden Booking.
 */
export default function ComponentNavbar() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    // 2. Hooks de notificaciones (cada uno solo hace polling si aplica al rol del usuario)
    const noLeidos = useMensajesNoLeidos();
    const respuestasNoVistas = useRespuestasNoVistas();

    // Estado para el menú hamburguesa (móvil)
    const [navExpanded, setNavExpanded] = useState(false);

    // Estado controlado de los dropdowns. Antes quedaba 100% en manos
    // del comportamiento default de react-bootstrap (solo cierra con click
    // afuera / Escape / click en un item), así que si cambiabas de ventana o
    // pestaña, react-bootstrap nunca se enteraba y el dropdown quedaba abierto
    // al volver. Se fuerza el cierre explícitamente al perder el foco.
    // Ahora hay varios menús desplegables: se guarda cuál está abierto (o null).
    const [menuAbierto, setMenuAbierto] = useState(null);
    const pendientes = useReservasPendientes();

    useEffect(() => {
        const cerrarDropdown = () => setMenuAbierto(null);
        document.addEventListener('visibilitychange', cerrarDropdown);
        window.addEventListener('blur', cerrarDropdown);
        return () => {
            document.removeEventListener('visibilitychange', cerrarDropdown);
            window.removeEventListener('blur', cerrarDropdown);
        };
    }, []);

    // Cierra el desplegable y el menú móvil al elegir una opción
    const cerrarMenus = () => { setMenuAbierto(null); setNavExpanded(false); };

    // Función auxiliar para navegar y cerrar el menú móvil a la vez de forma limpia
    const handleNavigate = (path) => {
        setNavExpanded(false);
        navigate(path);
    };

    /**
     * Manejador del cierre de sesión con SweetAlert2.
     */
    const handleLogout = async () => {
        const resultado = await Swal.fire({
            title: '¿Cerrar sesión?',
            text: 'Tu sesión será terminada y tendrás que volver a ingresar.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#f38d1e',
            cancelButtonColor: '#6c757d',
            customClass: {
                popup: 'swal-popup-custom',
                title: 'swal-title-custom',
            }
        });

        if (resultado.isConfirmed) {
            await logout();
            navigate("/login");
        }
    };

    return (
        <Navbar
            bg={isDarkMode ? 'dark' : 'white'}
            variant={isDarkMode ? 'dark' : 'light'}
            expand="lg"
            expanded={navExpanded} // Vinculado al estado móvil
            onToggle={(isOpen) => setNavExpanded(isOpen)}
            className={`${styles.customNavbar} shadow-sm py-2`}
        >
            <Container fluid className="px-md-5">
                        <div className="row w-100 align-items-center m-0 flex-wrap flex-lg-nowrap">
                            
                        {/* 1. COLUMNA IZQUIERDA: Logo (col-auto toma solo el espacio de la imagen) */}
                        <div className="col-auto d-flex justify-content-start align-items-center p-0">
                            <Navbar.Brand as={Link} to="/home" onClick={() => setNavExpanded(false)} className="d-flex align-items-center m-0 p-0">
                                <img src={logo} alt="Logo" className={styles.navbarLogo} />
                            </Navbar.Brand>
                        </div>

                        {/* 2. Botón hamburguesa (solo móvil/tablet) */}
                        <div className="col d-lg-none p-0 d-flex justify-content-center">
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        </div>

                        {/* Menú de navegación: en escritorio va al centro; en móvil se
                            despliega a todo el ancho debajo de la barra (order-last). */}
                        <Navbar.Collapse id="basic-navbar-nav" className="col-12 col-lg-auto flex-lg-grow-1 order-last order-lg-0 p-0">
                            <Nav className="mx-auto align-items-center justify-content-center w-100">
                                <Nav.Link as={Link} to="/home" onClick={() => setNavExpanded(false)} className={styles.navLink}>
                                    Inicio
                                </Nav.Link>

                                {isAdmin() && (
                                    <Nav.Link as={Link} to="/dashboard" onClick={() => setNavExpanded(false)} className={styles.navLink}>
                                        Dashboard
                                    </Nav.Link>
                                )}

                                {/* ── Servicios: un solo menú con las secciones de reservas y habitaciones ── */}
                                <NavDropdown
                                    title={<TituloMenu texto="Servicios" pendientes={pendientes.deporte + pendientes.hotel} />}
                                    id="menu-servicios"
                                    show={menuAbierto === "servicios"}
                                    onToggle={(abierto) => setMenuAbierto(abierto ? "servicios" : null)}
                                    className={`${styles.navLink} ${styles.servicesDropdown}`}
                                >
                                    <div className={`${styles.megaMenu} ${isAdmin() ? styles.megaMenuTres : ""}`}>
                                        {/* Reservas deportivas */}
                                        <section className={styles.megaSeccion}>
                                            <NavDropdown.Header className={styles.megaTitulo}>Reservas deportivas</NavDropdown.Header>
                                            <ItemMenu to="/reservas-deportivas" icono={<MdSportsTennis />} titulo="Espacios deportivos" texto="Explora y reserva canchas." onElegir={cerrarMenus} />
                                            <ItemMenu to="/reservas-deportivas/mis-reservas" icono={<BsClockHistory />} titulo="Mis reservas" texto="Estado de tus reservas." onElegir={cerrarMenus} />
                                            {isAdmin() && (
                                                <>
                                                    <ItemMenu to="/reservas-deportivas/gestionar" icono={<BsCalendarCheck />} titulo="Gestionar reservas" texto="Aprobar o cancelar solicitudes." badge={pendientes.deporte} onElegir={cerrarMenus} />
                                                    <ItemMenu to="/recepcion/nueva-reserva?tipo=deporte" icono={<BsPersonPlus />} titulo="Reservar para un cliente" texto="Registro en recepción." onElegir={cerrarMenus} />
                                                    <ItemMenu to="/reservas-deportivas/espacios" icono={<BsGrid />} titulo="Administrar espacios" texto="Crear, editar e imágenes." onElegir={cerrarMenus} />
                                                </>
                                            )}
                                        </section>

                                        {/* Reservas hoteleras */}
                                        <section className={styles.megaSeccion}>
                                            <NavDropdown.Header className={styles.megaTitulo}>Reservas hoteleras</NavDropdown.Header>
                                            <ItemMenu to="/reservas-hospedaje" icono={<BsSearch />} titulo="Reservar habitación" texto="Disponibilidad y precios." onElegir={cerrarMenus} />
                                            <ItemMenu to="/mis-reservas-hotel" icono={<BsClockHistory />} titulo="Mis reservas" texto="Estado de tus estadías." onElegir={cerrarMenus} />
                                            {isAdmin() && (
                                                <>
                                                    <ItemMenu to="/reservas-hoteleras/gestionar" icono={<BsCalendarCheck />} titulo="Gestionar reservas" texto="Aprobar o cancelar solicitudes." badge={pendientes.hotel} onElegir={cerrarMenus} />
                                                    <ItemMenu to="/recepcion/nueva-reserva?tipo=hotel" icono={<BsPersonPlus />} titulo="Reservar para un cliente" texto="Registro en recepción." onElegir={cerrarMenus} />
                                                </>
                                            )}
                                        </section>

                                        {/* Habitaciones (administración, independiente de las reservas) */}
                                        {isAdmin() && (
                                            <section className={styles.megaSeccion}>
                                                <NavDropdown.Header className={styles.megaTitulo}>Habitaciones</NavDropdown.Header>
                                                <ItemMenu to="/gestionar-habitaciones" icono={<MdKingBed />} titulo="Gestionar habitaciones" texto="Precios, estados y edición." onElegir={cerrarMenus} />
                                                <ItemMenu to="/crear-habitacion" icono={<MdAddBox />} titulo="Crear habitación" texto="Agregar al catálogo." onElegir={cerrarMenus} />
                                                <ItemMenu to="/tipo-habitacion" icono={<MdCategory />} titulo="Tipos de habitación" texto="Suite, doble, sencilla..." onElegir={cerrarMenus} />
                                            </section>
                                        )}
                                    </div>
                                </NavDropdown>

                                <Nav.Link as={Link} to="/contactos" onClick={() => setNavExpanded(false)} className={styles.navLink}>
                                    Contactanos
                                </Nav.Link>

                                {isAdmin() && (
                                    <Nav.Link as={Link} to="/usuarios" onClick={() => setNavExpanded(false)} className={styles.navLink}>
                                        Usuarios
                                    </Nav.Link>
                                )}
                            </Nav>
                        </Navbar.Collapse>

                    {/* 3. COLUMNA DERECHA: Acciones globales */}
                    <div className="col-auto d-flex justify-content-end align-items-center gap-2 p-0">
                        <button
                            className={styles.themeBtn}
                            onClick={toggleTheme}
                            title={isDarkMode ? "Modo claro" : "Modo oscuro"}
                        >
                            {isDarkMode ? <BsSun size={16} /> : <BsMoonStarsFill size={16} />}
                        </button>
                    {user ? (
                            <>
                                {/* 3. NOTIFICACIONES PARA ADMINISTRADORES (bandeja de mensajes recibidos) */}
                                {isAdmin() && (
                                    <div 
                                        className="position-relative d-flex align-items-center justify-content-center mx-1 mx-md-2" 
                                        onClick={() => handleNavigate("/mensajes")}
                                        style={{ 
                                            cursor: "pointer", 
                                            color: isDarkMode ? "#f8f9fa" : "#212529", // Se adapta al tema
                                            transition: "color 0.3s ease"
                                        }}
                                        title="Bandeja de mensajes"
                                    >
                                        <BiBell size={22} />
                                        {noLeidos > 0 && (
                                            <span 
                                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                                style={{ fontSize: "0.6rem", padding: "0.3em 0.5em" }}
                                            >
                                                {noLeidos > 9 ? "9+" : noLeidos}
                                                <span className="visually-hidden">mensajes no leídos</span>
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* 🆕 NOTIFICACIONES PARA USUARIOS NORMALES (respuestas del admin a sus mensajes) */}
                                {!isAdmin() && (
                                    <div 
                                        className="position-relative d-flex align-items-center justify-content-center mx-1 mx-md-2" 
                                        onClick={() => handleNavigate("/mis-mensajes")}
                                        style={{ 
                                            cursor: "pointer", 
                                            color: isDarkMode ? "#f8f9fa" : "#212529",
                                            transition: "color 0.3s ease"
                                        }}
                                        title="Mis mensajes"
                                    >
                                        <BiBell size={22} />
                                        {respuestasNoVistas > 0 && (
                                            <span 
                                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                                style={{ fontSize: "0.6rem", padding: "0.3em 0.5em" }}
                                            >
                                                {respuestasNoVistas > 9 ? "9+" : respuestasNoVistas}
                                                <span className="visually-hidden">respuestas nuevas</span>
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`${styles.userInfo} d-none d-sm-flex align-items-center`}
                                    onClick={() => handleNavigate("/mi-perfil")}
                                    style={{ cursor: "pointer" }}
                                    title="Ver mi perfil"
                                >
                                    <BsPersonCircle size={18} className={styles.userIcon} />
                                    <span className={styles.userName}>{user.nombreCompleto}</span>
                                    {isAdmin() ? (
                                        <span className={styles.adminBadge}>ADMIN</span>
                                    ) : (
                                        <span className={styles.clientBadge}>CLIENTE</span>
                                    )}
                                </div>

                                <button
                                    className={styles.logoutBtn}
                                    onClick={handleLogout}
                                    title="Cerrar sesión"
                                >
                                    <BsBoxArrowRight size={18} />
                                </button>
                            </>
                        ) : (
                            <Button className={styles.adminLoginBtn} as={Link} to="/login" onClick={() => setNavExpanded(false)}>
                                Iniciar sesión
                            </Button>
                        )}
                    </div>
                </div>
            </Container>
        </Navbar>
    );
}

/** Título de un menú desplegable con contador de pendientes (solo si hay). */
function TituloMenu({ texto, pendientes }) {
    return (
        <span className="d-inline-flex align-items-center gap-1">
            {texto}
            {pendientes > 0 && (
                <span className={styles.pendienteBadge} title={`${pendientes} reservas pendientes de aprobación`}>
                    {pendientes > 9 ? "9+" : pendientes}
                </span>
            )}
        </span>
    );
}

/** Opción de un menú desplegable con ícono, título, descripción y contador opcional. */
function ItemMenu({ to, icono, titulo, texto, badge, onElegir }) {
    return (
        <NavDropdown.Item as={Link} to={to} className={styles.dropdownItemCustom} onClick={onElegir}>
            <div className={styles.iconBox}>{icono}</div>
            <div className="flex-grow-1">
                <span className={styles.itemTitle}>
                    {titulo}
                    {badge > 0 && <span className={styles.pendienteBadge}>{badge > 9 ? "9+" : badge}</span>}
                </span>
                <small className={styles.itemText}>{texto}</small>
            </div>
        </NavDropdown.Item>
    );
}
