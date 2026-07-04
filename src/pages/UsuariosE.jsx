import React, { useEffect, useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/UsuariosE.css";
import userImg from '../assets/edit-user.png';
import { actualizarUsuario } from "../api/UserApi";

const UsuariosE = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const usuario = state?.usuario;

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    estado: "ACTIVO"
  });

  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

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

  if (!usuario) return (
    <div className="alert alert-warning m-4">
      No se seleccionó ningún usuario.
      <button className="btn btn-link" onClick={() => navigate("/usuarios")}>Volver</button>
    </div>
  );

  return (
    <div className="editar-page">

      {/* Header */}
      <div className="editar-page-header">
        <h1 className="editar-page-title">EDITAR USUARIO</h1>
        <span className="editar-page-id">ID: {usuario.id?.slice(-6)}</span>
      </div>

      {/* Alertas */}
      {error && <div className="alert alert-danger mx-4">{error}</div>}
      {exito && <div className="alert alert-success mx-4">¡Usuario actualizado correctamente!</div>}

      {/* Contenido */}
      <div className="editar-page-body">
        <Row className="align-items-center w-100">

          {/* Imagen */}
          <Col md={3} className="text-center">
            <div className="editar-avatar">
              <img src={userImg} alt="usuario" className="editar-avatar-img" />
            </div>
            <p className="editar-avatar-label">{usuario.nombre} {usuario.apellido}</p>
          </Col>

          {/* Formulario */}
          <Col md={9}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label className="editar-label">Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    className="editar-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="editar-label">Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    className="editar-input"
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={8}>
                  <Form.Label className="editar-label">Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    className="editar-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="editar-label">Estado</Form.Label>
                  <Form.Select
                    className="editar-input"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="editar-botones">
                <Button type="submit" className="editar-btn-guardar">Guardar</Button>
                <Button className="editar-btn-cancelar" onClick={() => navigate("/usuarios")}>Cancelar</Button>
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default UsuariosE;