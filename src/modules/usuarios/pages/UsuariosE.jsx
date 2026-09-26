import { useState } from "react";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/UsuariosE.css";
import userImg from "../../../assets/edit-user.png";
import { actualizarUsuario } from "../api/UserApi";
import { useAuth } from "../../../shared/context/AuthContext";
import { aTextoFecha } from "../../../shared/utils/fechas";

const TIPOS_DOCUMENTO = [
  { valor: "CC", texto: "Cédula de ciudadanía" },
  { valor: "TI", texto: "Tarjeta de identidad" },
  { valor: "CE", texto: "Cédula de extranjería" },
  { valor: "PA", texto: "Pasaporte" },
];

// Fecha local (toISOString daría la de UTC, que en la noche ya es "mañana")
const HOY = aTextoFecha(new Date());

/** Datos del usuario → estado del formulario (todo como texto, sin null). */
const aFormulario = (u) => ({
  nombre: u.nombre || "",
  apellido: u.apellido || "",
  tipoDocumento: u.documento?.tipo || "CC",
  numeroDocumento: u.documento?.numeroD || "",
  telefono: u.telefono || "",
  email: u.email || "",
  fechaNacimiento: u.fechaNacimiento || "",
  calle: u.direccion?.cll || "",
  carrera: u.direccion?.crr || "",
  ciudad: u.direccion?.cd || "",
  pais: u.direccion?.ps || "",
  estado: u.estado || "ACTIVO",
  rol: u.roles?.includes("ROL_ADMIN") ? "ROL_ADMIN" : "ROL_CLIENTE",
});

/**
 * Edición completa de un usuario por el ADMIN: datos personales, documento,
 * contacto, dirección, estado y rol.
 *
 * El backend valida todo otra vez (correo y documento únicos, formatos) y,
 * si cambia el número de documento, traslada las reservas del usuario al
 * número nuevo. Un admin no puede quitarse su propio rol ni desactivarse.
 */
export default function UsuariosE() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const usuario = state?.usuario;

  // El estado inicial sale directo del usuario recibido (sin efecto que lo copie)
  const [form, setForm] = useState(() => (usuario ? aFormulario(usuario) : null));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  if (!usuario) {
    return (
      <div className="alert alert-warning m-4">
        No se seleccionó ningún usuario.
        <button className="btn btn-link" onClick={() => navigate("/usuarios")}>Volver</button>
      </div>
    );
  }

  const esMiCuenta = user?.id === usuario.id || user?.email === usuario.email;
  const cambiaDocumento = form.numeroDocumento.trim() !== (usuario.documento?.numeroD || "");
  const campo = (nombre) => ({
    value: form[nombre],
    onChange: (e) => setForm((f) => ({ ...f, [nombre]: e.target.value })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (cambiaDocumento) {
      const { isConfirmed } = await Swal.fire({
        title: "¿Cambiar el número de documento?",
        text: "Las reservas de este usuario se moverán al nuevo número de documento.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiarlo",
        cancelButtonText: "Revisar",
        confirmButtonColor: "#f38d1e",
      });
      if (!isConfirmed) return;
    }

    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id, {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        documento: { tipo: form.tipoDocumento, numeroD: form.numeroDocumento.trim() },
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        // input type="date" ya da "YYYY-MM-DD" (LocalDate): se envía tal cual
        fechaNacimiento: form.fechaNacimiento || null,
        direccion: { cll: form.calle.trim(), crr: form.carrera.trim(), cd: form.ciudad.trim(), ps: form.pais.trim() },
        estado: form.estado,
        roles: [form.rol],
      });
      await Swal.fire({ title: "Usuario actualizado", icon: "success", timer: 1500, showConfirmButton: false });
      navigate("/usuarios");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="editar-page">
      <div className="editar-page-header">
        <h1 className="editar-page-title">EDITAR USUARIO</h1>
        <span className="editar-page-id">ID: {usuario.id?.slice(-6)}</span>
      </div>

      {error && <div className="alert alert-danger mx-4">{error}</div>}

      <div className="editar-page-body">
        <Row className="w-100">
          <Col md={3} className="text-center mb-4">
            <div className="editar-avatar">
              <img src={userImg} alt="usuario" className="editar-avatar-img" />
            </div>
            <p className="editar-avatar-label">{usuario.nombre} {usuario.apellido}</p>
            {esMiCuenta && <p className="editar-nota">Es tu cuenta: no puedes quitarte el rol de administrador ni desactivarte.</p>}
          </Col>

          <Col md={9}>
            <Form onSubmit={handleSubmit}>
              <h2 className="editar-seccion">Datos personales</h2>
              <Row className="mb-3 g-3">
                <Col md={6}>
                  <Form.Label className="editar-label">Nombre</Form.Label>
                  <Form.Control className="editar-input" required maxLength={60} {...campo("nombre")} />
                </Col>
                <Col md={6}>
                  <Form.Label className="editar-label">Apellido</Form.Label>
                  <Form.Control className="editar-input" required maxLength={60} {...campo("apellido")} />
                </Col>
                <Col md={4}>
                  <Form.Label className="editar-label">Tipo de documento</Form.Label>
                  <Form.Select className="editar-input" {...campo("tipoDocumento")}>
                    {TIPOS_DOCUMENTO.map((t) => <option key={t.valor} value={t.valor}>{t.texto}</option>)}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="editar-label">Número de documento</Form.Label>
                  <Form.Control className="editar-input" required minLength={5} maxLength={15} {...campo("numeroDocumento")} />
                  {cambiaDocumento && <Form.Text className="editar-aviso">Sus reservas se moverán a este número.</Form.Text>}
                </Col>
                <Col md={4}>
                  <Form.Label className="editar-label">Fecha de nacimiento</Form.Label>
                  <Form.Control type="date" className="editar-input" max={HOY} {...campo("fechaNacimiento")} />
                </Col>
              </Row>

              <h2 className="editar-seccion">Contacto</h2>
              <Row className="mb-3 g-3">
                <Col md={7}>
                  <Form.Label className="editar-label">Correo electrónico</Form.Label>
                  <Form.Control type="email" className="editar-input" required {...campo("email")} />
                </Col>
                <Col md={5}>
                  <Form.Label className="editar-label">Teléfono</Form.Label>
                  <Form.Control type="tel" className="editar-input" placeholder="3001234567" maxLength={15}
                    pattern="\+?[0-9 ]{7,15}" title="Entre 7 y 15 dígitos" {...campo("telefono")} />
                </Col>
              </Row>

              <h2 className="editar-seccion">Dirección</h2>
              <Row className="mb-3 g-3">
                <Col md={3}>
                  <Form.Label className="editar-label">Calle</Form.Label>
                  <Form.Control className="editar-input" maxLength={40} {...campo("calle")} />
                </Col>
                <Col md={3}>
                  <Form.Label className="editar-label">Carrera</Form.Label>
                  <Form.Control className="editar-input" maxLength={40} {...campo("carrera")} />
                </Col>
                <Col md={3}>
                  <Form.Label className="editar-label">Ciudad</Form.Label>
                  <Form.Control className="editar-input" maxLength={60} {...campo("ciudad")} />
                </Col>
                <Col md={3}>
                  <Form.Label className="editar-label">País</Form.Label>
                  <Form.Control className="editar-input" maxLength={60} {...campo("pais")} />
                </Col>
              </Row>

              <h2 className="editar-seccion">Cuenta</h2>
              <Row className="mb-3 g-3">
                <Col md={6}>
                  <Form.Label className="editar-label">Estado</Form.Label>
                  <Form.Select className="editar-input" {...campo("estado")} disabled={esMiCuenta}>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo (pierde el acceso de inmediato)</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label className="editar-label">Rol</Form.Label>
                  <Form.Select className="editar-input" {...campo("rol")} disabled={esMiCuenta}>
                    <option value="ROL_CLIENTE">Cliente</option>
                    <option value="ROL_ADMIN">Administrador</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="editar-botones">
                <Button type="submit" className="editar-btn-guardar" disabled={guardando}>
                  {guardando ? <><Spinner size="sm" /> Guardando…</> : "Guardar cambios"}
                </Button>
                <Button className="editar-btn-cancelar" onClick={() => navigate("/usuarios")} disabled={guardando}>Cancelar</Button>
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
}
