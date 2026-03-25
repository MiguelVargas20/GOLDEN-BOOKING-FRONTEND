import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap'; 
import { Link } from 'react-router-dom';
import logo from '../assets/LOGO.PNG';
import styles from '../styles/Navbar.module.css';
import { useTheme } from '../context/Themecontext.jsx';
import { BsSun, BsMoonStarsFill } from 'react-icons/bs';
// Importamos los nuevos iconos para el menú
import { MdSportsTennis, MdHotel, MdRestaurant } from 'react-icons/md';

export default function ComponentNavbar() {
    const { isDarkMode, toggleTheme } = useTheme();

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
                        
                        {/* --- DROPDOWN MEJORADO --- */}
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
                        <Nav.Link as={Link} to="/usuarios" className={styles.navLink}>Usuarios</Nav.Link>
                    </Nav>
                    
                    <Button
                        variant="outline-warning"
                        className="ms-3"
                        onClick={toggleTheme}
                        style={{ borderRadius: '50px' }}
                    >
                        {isDarkMode ? <BsSun /> : <BsMoonStarsFill />}
                    </Button>

                    <div className="d-flex align-items-center mt-3 mt-lg-0">
                        <Button className={styles.adminLoginBtn} as={Link} to="/login">
                            Admin Login
                        </Button>
                        <div className={styles.userIconContainer}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                            </svg>
                        </div>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}