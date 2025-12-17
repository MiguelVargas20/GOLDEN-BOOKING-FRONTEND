import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import "../styles/UsuariosC.css"; 
import userImg from '../assets/edit-user.png' 

export default function UsuariosC() {
  return (
    <>
      <Container className="editar-container">
        <Card className="editar-card">
          <Card.Header className="editar-header">
            <h5>CREAR USUARIO</h5>
          </Card.Header>

          <Card.Body>
            <Row className="align-items-center">
              {/* Imagen */}
              <Col md={4} className="text-center">
                <div className="editar-img-wrapper">
                  <img src={userImg} alt="usuario" className="editar-img" />
                </div>
              </Col>

              {/* Formulario */}
              <Col md={8}>
                <Form>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          placeholder="Nombre Completo"
                          className="input-custom"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Select className="input-custom">
                          <option>Rol</option>
                          <option>Administrador</option>
                          <option>Cliente</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Control
                      type="email"
                      placeholder="usuario.nombre@gmail.com"
                      className="input-custom"
                    />
                  </Form.Group>

                  {/* Botones */}
                  <div className="botones">
                    <Button className="btn-aceptar" onClick={() => navigate("/usuarios")}>ACEPTAR </Button>
                    <Button className="btn-cancelar" onClick={() => navigate("/usuarios")}>CANCELAR </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

    </>
  );
}