import { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/UsuariosC.css";
import userImg from '../assets/edit-user.png';
import { registrarUsuario } from "../services/authService";

export default function UsuariosC() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoDoc: "CC",
    numeroDoc: "",
    username: "",
    email: "",
    password: "",
    estado: "ACTIVO",
    roles: ["ROL_CLIENTE"]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await registrarUsuario(formData);
      setExito(true);
      setTimeout(() => navigate("/usuarios"), 1500);
    } catch (err) {
      setError(err.message || "Error al crear usuario");
    }
  };

  return (
    <Container className="editar-container">
      <Card className="editar-card">
        <Card.Header className="editar-header">
          <h5>CREAR USUARIO</h5>
        </Card.Header>

        <Card.Body className="p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          {exito && <div className="alert alert-success">¡Usuario creado correctamente!</div>}

          <Row className="align-items-center">
            <Col md={4} className="text-center">
              <div className="editar-img-wrapper">
                <img src={userImg} alt="usuario" className="editar-img" />
              </div>
            </Col>

            <Col md={8}>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Nombre"
                        className="input-custom"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Apellido"
                        className="input-custom"
                        value={formData.apellido}
                        onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Select
                        className="input-custom"
                        value={formData.tipoDoc}
                        onChange={(e) => setFormData({...formData, tipoDoc: e.target.value})}
                      >
                        <option value="CC">CC</option>
                        <option value="TI">TI</option>
                        <option value="CE">CE</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Número documento"
                        className="input-custom"
                        value={formData.numeroDoc}
                        onChange={(e) => setFormData({...formData, numeroDoc: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Username"
                    className="input-custom"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    className="input-custom"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Contraseña"
                    className="input-custom"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Select
                    className="input-custom"
                    value={formData.roles[0]}
                    onChange={(e) => setFormData({...formData, roles: [e.target.value]})}
                  >
                    <option value="ROL_CLIENTE">Cliente</option>
                    <option value="ROL_ADMIN">Administrador</option>
                  </Form.Select>
                </Form.Group>

                <div className="botones">
                  <Button type="submit" className="btn-aceptar">CREAR</Button>
                  <Button className="btn-cancelar" onClick={() => navigate("/usuarios")}>CANCELAR</Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}