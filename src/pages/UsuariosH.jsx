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

  // --- NUEVOS ESTADOS DE PAGINACIÓN ---
  const [paginaActual, setPaginaActual]     = useState(0);
  const [totalPaginas, setTotalPaginas]     = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const TAMANIO_PAGINA = 10;

  // Cargar usuarios al montar el componente (inicia en la página 0)
  useEffect(() => {
    obtenerUsuarios(0);
  }, []);

  // --- FUNCIÓN ACTUALIZADA CON PAGINACIÓN ---
  const obtenerUsuarios = async (pagina = 0) => {
    try {
      const data = await listarUsuarios(pagina, TAMANIO_PAGINA);
      setUsuarios(data.contenido);
      setPaginaActual(data.paginaActual);
      setTotalPaginas(data.totalPaginas);
      setTotalElementos(data.totalElementos);
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
        const nuevaPagina = usuarios.length === 1 && paginaActual > 0 
            ? paginaActual - 1 
            : paginaActual;
        obtenerUsuarios(nuevaPagina);
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
            Agregar Usuario
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
                  <span className={`user-status ${u.estado?.toLowerCase()}`}>
                    {u.estado}
                  </span>
                </td>
                <td className="opciones-usuarios">
                  <button
                    className="btn-edit"
                    onClick={() => navigate("/usuarios-edit", { state: { usuario: u } })}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleEliminar(u.id, u.nombre, u.apellido)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* --- CONTROLES DE PAGINACIÓN INTEGARDOS --- */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-1">
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Mostrando página {paginaActual + 1} de {totalPaginas} — {totalElementos} usuarios en total
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => obtenerUsuarios(paginaActual - 1)}
              disabled={paginaActual === 0}
            >
              ← Anterior
            </button>
            {/* Botones de páginas numeradas */}
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${i === paginaActual 
                  ? 'btn-warning' 
                  : 'btn-outline-secondary'}`}
                onClick={() => obtenerUsuarios(i)}
                style={i === paginaActual 
                  ? { background: '#f38d1e', border: 'none', color: '#fff' } 
                  : {}}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => obtenerUsuarios(paginaActual + 1)}
              disabled={paginaActual === totalPaginas - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}