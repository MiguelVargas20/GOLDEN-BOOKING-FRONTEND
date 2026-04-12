import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../styles/UsuariosH.css';
import { listarUsuarios, eliminarUsuario } from "../api/UserApi";

// Página de gestión de usuarios (solo para ADMIN)
export default function UsuariosH() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Cargar usuarios al montar el componente
  useEffect(() => {
    obtenerUsuarios();
  }, []);


  // Función para cargar usuarios desde el backend
  const obtenerUsuarios = async () => {
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un usuario
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      obtenerUsuarios();
    } catch {
      alert("Error al eliminar usuario");
    }
  };


  //Filtrar por documento, nombre o email
  const usuariosFiltrados = usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.documento?.numeroD?.includes(busqueda)  // ← buscar por documento
  );

  if (loading) return <div className="p-4">Cargando usuarios...</div>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  // Renderizar tabla de usuarios
  return (
    <Container fluid className="users-wrapper">
      <Row className="align-items-center justify-content-between mb-3">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre, email o documento"
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Col>

        <Col md="auto">
          <h1 className="title-users">USUARIOS</h1>
        </Col>

        <Col md="auto">
          <Button
            variant="success"
            className="add-btn-users"
            onClick={() => navigate("/usuarios-crear")}
          >
            ADD
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive className="users-table">
        <thead>
          <tr>
            <th>DOCUMENTO</th>
            <th>NOMBRE</th>
            <th>APELLIDO</th>
            <th>CORREO</th>
            <th>ESTADO</th>
            <th>GESTIONAR</th>
          </tr>
        </thead>
        <tbody>
          {/* Si no hay usuarios, mostrar mensaje */}
          {usuariosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">No hay usuarios registrados</td>
            </tr>
          ) : (

            // Renderizar usuarios filtrados
            usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td>{u.documento?.numeroD || u.id?.slice(-6)}</td>
                <td>{u.nombre}</td>
                <td>{u.apellido}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.estado === "ACTIVO" ? "bg-success" : "bg-danger"}`}>
                    {u.estado}
                  </span>
                </td>
                <td className="opciones-usuarios">
                  <button
                    className="btn-edit"
                    onClick={() => navigate("/usuarios-edit", { state: { usuario: u } })}
                  >
                    EDIT
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleEliminar(u.id)}
                  >
                    DELETE
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}