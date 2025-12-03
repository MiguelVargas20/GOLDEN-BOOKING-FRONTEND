import Footer from '../components/footer';
import Navbar from '../components/navbar';
import '../styles/Home.css'
import { Container, Row, Col } from "react-bootstrap";

export default function Home() {
  return (
    <>
    <Navbar />

    <Container className="principal">
      <Row>
        <Col>
        <h3 className="text-title">Club Valle Dorado</h3>
        <p> Somos un club comprometido con la experiencia de nuestros clientes, contamos con
profesionales para cada experiencia; ofrecemos espacios recreativos, hospedaje en
nuestras instalaciones, y lo más importante para toda la familia. </p>
        </Col>
        <Col className="right-side-icon">
        <img src="/club-valle-dorado.png" alt="Club Valle Dorado" />
        </Col>
      </Row>
    </Container>


    <Footer />
    </>
  );
}

