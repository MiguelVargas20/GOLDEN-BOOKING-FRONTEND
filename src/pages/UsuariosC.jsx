import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
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
    <div className="crear-page">

      {/* Header */}
      <div className="crear-page-header">
        <h1 className="crear-page-title">CREAR USUARIO</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {exito && <div className="alert alert-success">¡Usuario creado correctamente!</div>}

      <div className="crear-page-body">
        <Row className="align-items-start w-100">

          {/* Avatar */}
          <Col md={3} className="text-center">
            <div className="crear-avatar">
              <img src={userImg} alt="usuario" className="crear-avatar-img" />
            </div>
            <p className="crear-avatar-label">Nuevo usuario</p>
          </Col>

          {/* Formulario */}
          <Col md={9}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label className="crear-label">Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    className="crear-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="crear-label">Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    className="crear-input"
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Label className="crear-label">Tipo doc.</Form.Label>
                  <Form.Select
                    className="crear-input"
                    value={formData.tipoDoc}
                    onChange={(e) => setFormData({...formData, tipoDoc: e.target.value})}
                  >
                    <option value="CC">CC</option>
                    <option value="TI">TI</option>
                    <option value="CE">CE</option>
                  </Form.Select>
                </Col>
                <Col md={9}>
                  <Form.Label className="crear-label">Número documento</Form.Label>
                  <Form.Control
                    type="text"
                    className="crear-input"
                    value={formData.numeroDoc}
                    onChange={(e) => setFormData({...formData, numeroDoc: e.target.value})}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label className="crear-label">Username</Form.Label>
                  <Form.Control
                    type="text"
                    className="crear-input"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="crear-label">Email</Form.Label>
                  <Form.Control
                    type="email"
                    className="crear-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label className="crear-label">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    className="crear-input"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="crear-label">Rol</Form.Label>
                  <Form.Select
                    className="crear-input"
                    value={formData.roles[0]}
                    onChange={(e) => setFormData({...formData, roles: [e.target.value]})}
                  >
                    <option value="ROL_CLIENTE">Cliente</option>
                    <option value="ROL_ADMIN">Administrador</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="crear-botones">
                <Button type="submit" className="crear-btn-guardar">CREAR</Button>
                <Button className="crear-btn-cancelar" onClick={() => navigate("/usuarios")}>CANCELAR</Button>
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
}