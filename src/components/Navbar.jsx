import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap'; // Importación única
import logo from '../assets/LOGO.PNG';
import styles from '../styles/Navbar.module.css';
import { useTheme } from '../context/Themecontext.jsx';
import { BsSun, BsMoonStarsFill } from 'react-icons/bs';

export default function ComponentNavbar() {
    // La lógica del tema debe ir dentro del componente que se renderiza
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        /* Cambié bg="white" por una condición para que el fondo también cambie en modo oscuro */
        <Navbar 
            bg={isDarkMode ? 'dark' : 'white'} 
            variant={isDarkMode ? 'dark' : 'light'}
            expand="lg" 
            className={`${styles.customNavbar} shadow-sm py-3`}
        >
            <Container fluid className="px-md-5">

                {/* Logo a la izquierda */}
                <Navbar.Brand href="#home" className="d-flex align-items-center">
                    <img
                        src={logo}
                        alt="Golden Booking Logo"
                        className={styles.navbarLogo}
                    />
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Menú Centrado */}
                    <Nav className="mx-auto">
                        <Nav.Link href="/home" className={styles.navLink}>Inicio</Nav.Link>
                        <Nav.Link href="/servicios" className={styles.navLink}>Servicios</Nav.Link>
                        <Nav.Link href="/contactos" className={styles.navLink}>Contactanos</Nav.Link>
                        <Nav.Link href="/usuarios" className={styles.navLink}>Usuarios</Nav.Link>
                    </Nav>
                    
                    {/* BOTÓN DE MODO OSCURO (React-Bootstrap) */}
                    <Button
                        variant="outline-warning"
                        className="ms-3"
                        onClick={toggleTheme}
                        style={{ borderRadius: '50px' }}
                    >
                        {isDarkMode ? <BsSun /> : <BsMoonStarsFill />}
                    </Button>


                    {/* Botón y Perfil a la derecha */}
                    <div className="d-flex align-items-center mt-3 mt-lg-0">
                        <Button className={styles.adminLoginBtn}>
                            Administrador
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