import { useState, useEffect } from 'react'; 
import React  from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Importamos useLocation
import logo from '../assets/LOGO.PNG';
import styles from '../styles/Navbar.module.css';
import { useTheme } from '../context/Themecontext.jsx';
import { BsSun, BsMoonStarsFill, BsBoxArrowRight, BsPersonCircle } from 'react-icons/bs';
import { MdSportsTennis, MdHotel, MdRestaurant } from 'react-icons/md';
import { useAuth } from '../context/AuthContext.jsx';
import Swal from 'sweetalert2';

/**
 * Componente ComponentNavbar
 * Barra de navegación principal y adaptativa (responsive) para Golden Booking.
 */
export default function ComponentNavbar() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Estado para el menú hamburguesa (móvil)
    const [navExpanded, setNavExpanded] = useState(false);
    


    // 3. LA SOLUCIÓN DEFINITIVA: Forzar el cierre de TODO al cambiar de vista
    useEffect(() => {
        setNavExpanded(false);   // Cierra el menú hamburguesa en móviles
     }, [location]);

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
                <div className="row w-100 align-items-center m-0">
                    
                    {/* 1. COLUMNA IZQUIERDA: Logo */}
                    <div className="col-3 col-lg-3 d-flex justify-content-start align-items-center p-0">
                        <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center m-0 p-0">
                            <img src={logo} alt="Logo" className={styles.navbarLogo} />
                        </Navbar.Brand>
                    </div>

                    {/* 2. COLUMNA CENTRAL: Menú de navegación */}
                    <div className="col-6 col-lg-6 p-0">
                        <div className="d-lg-none d-flex justify-content-center">
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        </div>
                        
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mx-auto align-items-center justify-content-center w-100">
                                <Nav.Link as={Link} to="/home" className={styles.navLink}>
                                    Inicio
                                </Nav.Link>

                                {/* 4. CONTROL TOTAL DEL DROPDOWN: show y onToggle configurados */}
                                <NavDropdown
                                    title="Servicios"
                                    id="services-dropdown"
                                    className={`${styles.navLink} ${styles.servicesDropdown}`}
                                >
                                    {/* Recuperamos el uso limpio de 'as={Link}' combinándolo con un cierre manual inmediato al hacer click */}
                                    <NavDropdown.Item 
                                        as={Link} 
                                        to="/reservas-deportivas" 
                                        className={styles.dropdownItemCustom}
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
                                        onClick={() => setShowServices(false)}
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
                                        onClick={() => setShowServices(false)}
                                    >
                                        <div className={styles.iconBox}><MdRestaurant /></div>
                                        <div>
                                            <span className={styles.itemTitle}>Restaurante</span>
                                            <small className={styles.itemText}>Experiencia gastronomica.</small>
                                        </div>
                                    </NavDropdown.Item>
                                </NavDropdown>

                                <Nav.Link as={Link} to="/contactos" className={styles.navLink}>
                                    Contactanos
                                </Nav.Link>

                                {isAdmin() && (
                                    <Nav.Link as={Link} to="/usuarios" className={styles.navLink}>
                                        Usuarios
                                    </Nav.Link>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </div>

                    {/* 3. COLUMNA DERECHA: Acciones globales */}
                    <div className="col-3 col-lg-3 d-flex justify-content-end align-items-center gap-2 p-0">
                        <button
                            className={styles.themeBtn}
                            onClick={toggleTheme}
                            title={isDarkMode ? "Modo claro" : "Modo oscuro"}
                        >
                            {isDarkMode ? <BsSun size={16} /> : <BsMoonStarsFill size={16} />}
                        </button>
                    {user ? (
                            <>
                                <div
                                    className={`${styles.userInfo} d-none d-sm-flex align-items-center`}
                                    onClick={() => navigate("/mi-perfil")}
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
                            <Button className={styles.adminLoginBtn} as={Link} to="/login">
                                Iniciar sesión
                            </Button>
                        )}
                    </div>
                </div>
            </Container>
        </Navbar>
    );
}