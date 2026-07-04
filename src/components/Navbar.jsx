import { useState } from 'react'; 
import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/LOGO.PNG';
import styles from '../styles/Navbar.module.css';
import { useTheme } from '../context/Themecontext.jsx';
import { BsSun, BsMoonStarsFill, BsBoxArrowRight, BsPersonCircle } from 'react-icons/bs';
import { MdSportsTennis, MdHotel, MdRestaurant } from 'react-icons/md';
import { useAuth } from '../context/AuthContext.jsx';
import Swal from 'sweetalert2';

// 1. Nuevas importaciones de notificaciones
import { useMensajesNoLeidos } from "../hooks/useMensajesNoLeidos";
import { BiBell } from "react-icons/bi";

/**
 * Componente ComponentNavbar
 * Barra de navegación principal y adaptativa (responsive) para Golden Booking.
 */
export default function ComponentNavbar() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    // 2. Hook de mensajes no leídos
    const noLeidos = useMensajesNoLeidos();

    // Estado para el menú hamburguesa (móvil)
    const [navExpanded, setNavExpanded] = useState(false);

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
                        <div className="row w-100 align-items-center m-0 flex-nowrap">
                            
                        {/* 1. COLUMNA IZQUIERDA: Logo (col-auto toma solo el espacio de la imagen) */}
                        <div className="col-auto d-flex justify-content-start align-items-center p-0">
                            <Navbar.Brand as={Link} to="/home" onClick={() => setNavExpanded(false)} className="d-flex align-items-center m-0 p-0">
                                <img src={logo} alt="Logo" className={styles.navbarLogo} />
                            </Navbar.Brand>
                        </div>

                        {/* 2. COLUMNA CENTRAL: Menú de navegación (col toma todo el espacio sobrante) */}
                        <div className="col p-0 d-flex justify-content-center">
                            <div className="d-lg-none">
                                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            </div>
                        
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mx-auto align-items-center justify-content-center w-100">
                                <Nav.Link as={Link} to="/home" onClick={() => setNavExpanded(false)} className={styles.navLink}>
                                    Inicio
                                </Nav.Link>

                                {/* CONTROL TOTAL DEL DROPDOWN */}
                                <NavDropdown
                                    title="Servicios"
                                    id="services-dropdown"
                                    className={`${styles.navLink} ${styles.servicesDropdown}`}
                                >
                                    <NavDropdown.Item 
                                        as={Link} 
                                        to="/reservas-deportivas" 
                                        className={styles.dropdownItemCustom}
                                        onClick={() => setNavExpanded(false)}
                                    >
                                        <div className={styles.iconBox}><MdSportsTennis /></div>
                                        <div>
                                            <span className={styles.itemTitle}>Reservas Deportivas</span>
                                            <small className={styles.itemText}>Pádel, Tenis y Gimnasio.</small>
                                        </div>
                                    </NavDropdown.Item>

                                    <NavDropdown.Item 
                                        as={Link} 
                                        to="/reservas-hospedaje" 
                                        className={styles.dropdownItemCustom}
                                        onClick={() => setNavExpanded(false)}
                                    >
                                        <div className={styles.iconBox}><MdHotel /></div>
                                        <div>
                                            <span className={styles.itemTitle}>Reservas Hoteleras</span>
                                            <small className={styles.itemText}>Suites de lujo.</small>
                                        </div>
                                    </NavDropdown.Item>

                                    <NavDropdown.Item 
                                        as={Link} 
                                        to="/reservas-restaurante" 
                                        className={styles.dropdownItemCustom}
                                        onClick={() => setNavExpanded(false)}
                                    >
                                        <div className={styles.iconBox}><MdRestaurant /></div>
                                        <div>
                                            <span className={styles.itemTitle}>Restaurante</span>
                                            <small className={styles.itemText}>Experiencia gastronomica.</small>
                                        </div>
                                    </NavDropdown.Item>
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
                    </div>

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
                                {/* 3. NOTIFICACIONES PARA ADMINISTRADORES */}
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