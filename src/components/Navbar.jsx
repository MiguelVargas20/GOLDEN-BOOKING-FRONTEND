import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
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
 * Gestiona accesos rápidos, menú desplegable de servicios, cambio de tema (claro/oscuro)
 * y el estado de la autenticación de usuarios/administradores.
 */
export default function ComponentNavbar() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    /**
     * Manejador del cierre de sesión.
     * Despliega una alerta de confirmación con SweetAlert2 antes de destruir la sesión.
     */
    const handleLogout = async () => {
        const resultado = await Swal.fire({
            title: '¿Cerrar sesión?',
            text: 'Tu sesión será terminada y tendrás que volver a ingresar.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#f38d1e', // Color corporativo naranja Golden Booking
            cancelButtonColor: '#6c757d',
            borderRadius: '16px',
            customClass: {
                popup: 'swal-popup-custom',
                title: 'swal-title-custom',
            }
        });

        // Si el usuario confirma, ejecuta el logout del contexto y redirige
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
            className={`${styles.customNavbar} shadow-sm py-2`}
        >
            <Container fluid className="px-md-5">
                {/* Fila contenedora con alineación vertical perfecta para corregir desajustes de altura 
                */}
                <div className="row w-100 align-items-center m-0">
                    
                    {/* 1. COLUMNA IZQUIERDA: Logo corporativo */}
                    <div className="col-3 col-lg-3 d-flex justify-content-start align-items-center p-0">
                        <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center m-0 p-0">
                            <img src={logo} alt="Logo" className={styles.navbarLogo} />
                        </Navbar.Brand>
                    </div>

                    {/* 2. COLUMNA CENTRAL: Menú de navegación principal */}
                    <div className="col-6 col-lg-6 p-0">
                        {/* Botón Hamburguesa de Bootstrap centrado exclusivamente en resoluciones móviles */}
                        <div className="d-lg-none d-flex justify-content-center">
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        </div>
                        
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mx-auto align-items-center justify-content-center w-100">
                                <Nav.Link as={Link} to="/home" className={styles.navLink}>
                                    Inicio
                                </Nav.Link>

                                {/* Menú desplegable enriquecido de Servicios */}
                                <NavDropdown
                                    title="Servicios"
                                    id="services-dropdown"
                                    className={`${styles.navLink} ${styles.servicesDropdown}`}
                                >
                                    {/* Opción: Reservas Deportivas */}
                                    <NavDropdown.Item as={Link} to="/reservas-deportivas" className={styles.dropdownItemCustom}>
                                        <div className={styles.iconBox}><MdSportsTennis /></div>
                                        <div>
                                            <span className={styles.itemTitle}>Reservas Deportivas</span>
                                            <small className={styles.itemText}>Pádel, Tenis y Gimnasio.</small>
                                        </div>
                                    </NavDropdown.Item>

                                    {/* Opción: Reservas Hoteleras */}
                                    <NavDropdown.Item as={Link} to="/reservas-hospedaje" className={styles.dropdownItemCustom}>
                                        <div className={styles.iconBox}><MdHotel /></div>
                                        <div>
                                            <span className={styles.itemTitle}>Reservas Hoteleras</span>
                                            <small className={styles.itemText}>Suites de lujo.</small>
                                        </div>
                                    </NavDropdown.Item>

                                    {/* Opción: Restaurante */}
                                    <NavDropdown.Item as={Link} to="/reservas-restaurante" className={styles.dropdownItemCustom}>
                                        <div className={styles.iconBox}><MdRestaurant /></div>
                                        <div>
                                            <span className={styles.itemTitle}>Restaurante</span>
                                            <small className={styles.itemText}>Experiencia gastronómica.</small>
                                        </div>
                                    </NavDropdown.Item>
                                </NavDropdown>

                                <Nav.Link as={Link} to="/contactos" className={styles.navLink}>
                                    Contactanos
                                </Nav.Link>

                                {/* Acceso reservado únicamente a usuarios con privilegios de Administrador */}
                                {isAdmin() && (
                                    <Nav.Link as={Link} to="/usuarios" className={styles.navLink}>
                                        Usuarios
                                    </Nav.Link>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </div>

                    {/* 3. COLUMNA DERECHA: Acciones globales (Tema y Sesión de Usuario) */}
                    <div className="col-3 col-lg-3 d-flex justify-content-end align-items-center gap-2 p-0">
                        
                        {/* Interruptor para alternar entre Modo Claro y Oscuro */}
                        <button
                            className={styles.themeBtn}
                            onClick={toggleTheme}
                            title={isDarkMode ? "Modo claro" : "Modo oscuro"}
                        >
                            {isDarkMode ? <BsSun size={16} /> : <BsMoonStarsFill size={16} />}
                        </button>

                        {/* Renderizado dinámico según el estado de autenticación */}
                        {user ? (
                            <>
                                {/* Caja de información de usuario activo */}
                                <div className={`${styles.userInfo} d-none d-sm-flex align-items-center`}>
                                    <BsPersonCircle size={18} className={styles.userIcon} />
                                    <span className={styles.userName}>{user.nombreCompleto}</span>
                                    {isAdmin() && (
                                        <span className={styles.adminBadge}>ADMIN</span>
                                    )}
                                </div>

                                {/* Botón de salida para activar el Modal de Logout */}
                                <button
                                    className={styles.logoutBtn}
                                    onClick={handleLogout}
                                    title="Cerrar sesión"
                                >
                                    <BsBoxArrowRight size={18} />
                                </button>
                            </>
                        ) : (
                            /* En caso de no haber sesión, despliega el botón de acceso estándar */
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