import { Container, Row, Col } from 'react-bootstrap';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaShareAlt, FaGlobe, FaMedal } from 'react-icons/fa';
import styles from '../styles/Footer.module.css'; 

export default function Footer() {
  return (
    <footer className={styles['footer-premium']}>
      <Container className="py-5">
        <Row className="justify-content-between gy-4">
          {/* Columna 1: Branding - Ocupa 4/12 partes */}
          <Col lg={4} md={12}>
            <div className={`${styles['footer-brand']} mb-3`}>
              <span className={styles['brand-text']}>GOLDEN BOOKING</span>
            </div>
            <p className={styles['footer-info']}>
              Web oficial del Club Valle Dorado, tu puerta de entrada a experiencias premium en reservas de espacios deportivos, hotelería y más.
            </p>
            <div className={styles['social-container']}>
              <div className={styles['icon-circle']}><FaMedal /></div>
              <div className={styles['icon-circle']}><FaShareAlt /></div>
              <div className={styles['icon-circle']}><FaGlobe /></div>
            </div>
          </Col>

          {/* Columna 2: Enlaces Rápidos - Ahora alineada más cerca de la marca */}
          <Col lg={3} md={6}>
            <h5 className={styles['column-title']}>Enlaces Rápidos</h5>
            <ul className={`list-unstyled ${styles['custom-links']}`}>
              <li><a href="#nosotros">Nosotros</a></li>
              <li><a href="#servicios">Servicios</a></li>
              <li><a href="#reglamento">Reglamento</a></li>
              <li><a href="#soporte">Soporte</a></li>
            </ul>
          </Col>

          {/* Columna 3: Contacto - Alineada a la derecha */}
          <Col lg={3} md={6}>
            <h5 className={styles['column-title']}>Contacto</h5>
            <ul className={`list-unstyled ${styles['contact-info']}`}>
              <li><FaMapMarkerAlt className={styles['icon-orange']} /> Valle Dorado, GT</li>
              <li><FaEnvelope className={styles['icon-orange']} /> contacto@valledorado.com</li>
              <li><FaPhoneAlt className={styles['icon-orange']} /> +502 5555-5555</li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}