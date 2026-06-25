import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../styles/UsuariosH.css';
import { listarUsuarios, eliminarUsuario } from "../api/UserApi";
import Swal from 'sweetalert2';

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

const handleEliminar = async (id, nombre, apellido) => {
    const resultado = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: `Esta acción eliminará permanentemente a ${nombre} ${apellido} y no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#6c757d',
    });

    if (resultado.isConfirmed) {
        try {
            await eliminarUsuario(id);
            await Swal.fire({
                title: '¡Eliminado!',
                text: `${nombre} ${apellido} fue eliminado correctamente.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            obtenerUsuarios();
        } catch {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el usuario.',
                icon: 'error',
                confirmButtonColor: '#e53e3e',
            });
        }
    }
};

  // Filtrar por documento, nombre o email
  const usuariosFiltrados = usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.documento?.numeroD?.includes(busqueda)
  );

  if (loading) return <div className="p-4">Cargando usuarios...</div>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <Container fluid className="users-wrapper">
      <Row className="align-items-center justify-content-between mb-4 header-usuarios">
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
            AGREGAR USUARIO
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
          {usuariosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center">No hay usuarios registrados</td>
            </tr>
          ) : (
            usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td>{u.documento?.numeroD || u.id?.slice(-6)}</td>
                <td>{u.nombre}</td>
                <td>{u.apellido}</td>
                <td>{u.email}</td>
                <td>
                  {/* --- CAMBIO AQUÍ: Implementación de los estilos sutiles --- */}
                  <span className={`user-status ${u.estado?.toLowerCase()}`}>
                    {u.estado}
                  </span>
                </td>
                <td className="opciones-usuarios">
                  <button
                    className="btn-edit"
                    onClick={() => navigate("/usuarios-edit", { state: { usuario: u } })}
                  >
                    EDITAR
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleEliminar(u.id, u.nombre, u.apellido)}
                  >
                    ELIMINAR
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