import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/UsuariosE.css";
import userImg from '../assets/edit-user.png';
import { actualizarUsuario } from "../api/UserApi";

export default function UsuariosE() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const usuario = state?.usuario;

  // Formulario controlado para editar usuario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    estado: "ACTIVO"
  });

  // Estados para manejo de errores y éxito
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);


  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        email: usuario.email || "",
        estado: usuario.estado || "ACTIVO"
      });
    }
  }, [usuario]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await actualizarUsuario(usuario.id, formData);
      setExito(true);
      setTimeout(() => navigate("/usuarios"), 1500);
    } catch (err) {
      setError(err.message || "Error al actualizar usuario");
    }
  };

  // Si no se recibió un usuario, mostrar mensaje de error
  if (!usuario) return (
    <div className="alert alert-warning m-4">
      No se seleccionó ningún usuario. 
      <button className="btn btn-link" onClick={() => navigate("/usuarios")}>
        Volver
      </button>
    </div>
  );


  // Renderizar formulario de edición
  return (
    <Container className="editar-container">
      <Card className="editar-card">
        <Card.Header className="editar-header">
          <h5>EDITAR USUARIO</h5>
        </Card.Header>
      <Card.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          {exito && <div className="alert alert-success">¡Usuario actualizado!</div>}

          <Row className="align-items-center">
            <Col md={4} className="text-center">
              <div className="editar-img-wrapper">
                <img src={userImg} alt="usuario" className="editar-img" />
              </div>
              <p className="mt-2 text-muted small">ID: {usuario.id?.slice(-6)}</p>
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

                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    className="input-custom"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Select
                    className="input-custom"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </Form.Select>
                </Form.Group>

                <div className="botones">
                  <Button type="submit" className="btn-aceptar">GUARDAR</Button>
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