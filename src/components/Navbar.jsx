import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/LOGO.PNG';
import styles from '../styles/Navbar.module.css';
import { useTheme } from '../context/Themecontext.jsx';
import { BsSun, BsMoonStarsFill } from 'react-icons/bs';
import { MdSportsTennis, MdHotel, MdRestaurant } from 'react-icons/md';
import { useAuth } from '../context/AuthContext.jsx';

export default function ComponentNavbar() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Navbar
            bg={isDarkMode ? 'dark' : 'white'}
            variant={isDarkMode ? 'dark' : 'light'}
            expand="lg"
            className={`${styles.customNavbar} shadow-sm py-3`}
        >
            <Container fluid className="px-md-5">
                <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center">
                    <img src={logo} alt="Logo" className={styles.navbarLogo} />
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <Nav.Link as={Link} to="/home" className={styles.navLink}>Inicio</Nav.Link>

                        <NavDropdown
                            title="Servicios"
                            id="services-dropdown"
                            className={`${styles.navLink} ${styles.servicesDropdown}`}
                        >
                            <NavDropdown.Item as={Link} to="/reservas-deportivas" className={styles.dropdownItemCustom}>
                                <div className={styles.iconBox}><MdSportsTennis /></div>
                                <div>
                                    <span className={styles.itemTitle}>Reservas Deportivas</span>
                                    <small className={styles.itemText}>Pádel, Tenis y Gimnasio de alto rendimiento.</small>
                                </div>
                            </NavDropdown.Item>

                            <NavDropdown.Item as={Link} to="/reservas-hospedaje" className={styles.dropdownItemCustom}>
                                <div className={styles.iconBox}><MdHotel /></div>
                                <div>
                                    <span className={styles.itemTitle}>Reservas Hoteleras</span>
                                    <small className={styles.itemText}>Suites de lujo con vistas panorámicas.</small>
                                </div>
                            </NavDropdown.Item>

                            <NavDropdown.Item as={Link} to="/reservas-restaurante" className={styles.dropdownItemCustom}>
                                <div className={styles.iconBox}><MdRestaurant /></div>
                                <div>
                                    <span className={styles.itemTitle}>Restaurante</span>
                                    <small className={styles.itemText}>Experiencia gastronómica de autor.</small>
                                </div>
                            </NavDropdown.Item>
                        </NavDropdown>

                        <Nav.Link as={Link} to="/contactos" className={styles.navLink}>Contactanos</Nav.Link>

                        {/* Solo mostrar Usuarios si es ADMIN */}
                        {isAdmin() && (
                            <Nav.Link as={Link} to="/usuarios" className={styles.navLink}>Usuarios</Nav.Link>
                        )}
                    </Nav>

                    <Button
                        variant="outline-warning"
                        className="ms-3"
                        onClick={toggleTheme}
                        style={{ borderRadius: '50px' }}
                    >
                        {isDarkMode ? <BsSun /> : <BsMoonStarsFill />}
                    </Button>

                    <div className="d-flex align-items-center mt-3 mt-lg-0 gap-2 ms-3">
                        {user ? (
                            <>
                                <span className={styles.navLink} style={{ fontWeight: 600 }}>
                                    👤 {user.nombreCompleto}
                                </span>
                                {isAdmin() && (
                                    <span className="badge bg-warning text-dark">ADMIN</span>
                                )}
                                <Button
                                    variant="outline-danger"
                                    onClick={handleLogout}
                                    style={{ borderRadius: '50px' }}
                                >
                                    Cerrar sesión
                                </Button>
                            </>
                        ) : (
                            <Button className={styles.adminLoginBtn} as={Link} to="/login">
                                Iniciar sesión
                            </Button>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}