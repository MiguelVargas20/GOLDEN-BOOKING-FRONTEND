import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsPersonCircle } from "react-icons/bs";
import { useAuth } from "../../../shared/context/AuthContext";
import { actualizarMiPerfil } from "../api/UserApi";
import { API_URL, authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";
import { aTextoFecha } from "../../../shared/utils/fechas";
import { fecha } from "../../../shared/utils/formato";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/MiPerfil.css";

const HOY = aTextoFecha(new Date());
const TIPOS_DOCUMENTO = { CC: "Cédula de ciudadanía", TI: "Tarjeta de identidad", CE: "Cédula de extranjería", PA: "Pasaporte" };

/**
 * Perfil propio (cliente o admin): contacto, dirección y fecha de nacimiento.
 * El documento solo se muestra: si hay que corregirlo lo hace un administrador
 * (las reservas dependen de él).
 */
export default function MiPerfil() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    apiFetch(`${API_URL}/api/usuarios/perfil/${user.id}`, { headers: authHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo cargar tu perfil."));
        return res.json();
      })
      .then((datos) => {
        setPerfil(datos);
        setForm({
          nombre: datos.nombre || "",
          apellido: datos.apellido || "",
          telefono: datos.telefono || "",
          correo: datos.email || "",
          fechaNacimiento: datos.fechaNacimiento || "",
          calle: datos.direccion?.cll || "",
          carrera: datos.direccion?.crr || "",
          ciudad: datos.direccion?.cd || "",
          pais: datos.direccion?.ps || "",
        });
      })
      .catch((err) => setError(err.message));
  }, [user?.id]);

  const campo = (nombre) => ({
    id: `mp-${nombre}`,
    value: form[nombre],
    onChange: (e) => setForm((f) => ({ ...f, [nombre]: e.target.value })),
  });

  const guardar = async (e) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const actualizado = await actualizarMiPerfil(user.id, {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim(),
        fechaNacimiento: form.fechaNacimiento,
        calle: form.calle.trim(),
        carrera: form.carrera.trim(),
        ciudad: form.ciudad.trim(),
        pais: form.pais.trim(),
      });
      setPerfil(actualizado);
      Swal.fire({ title: "Perfil actualizado", icon: "success", timer: 1500, showConfirmButton: false });
    } catch (err) {
      setError(err.message || "No se pudo actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  if (!form) {
    return (
      <div className="gb-panel">
        {error ? <div className="alert alert-danger">{error}</div>
          : <div className="text-center py-5"><Spinner style={{ color: "var(--gb-primary)" }} /></div>}
      </div>
    );
  }

  const esAdmin = user?.roles?.includes("ROL_ADMIN");

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Mi <span>perfil</span></h1>
          <p className="gb-panel-subtitulo">Mantén tus datos al día para recibir la confirmación de tus reservas.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <Row className="g-4">
        <Col lg={4}>
          <div className="gb-tarjeta mp-resumen">
            <BsPersonCircle className="mp-avatar" aria-hidden="true" />
            <strong className="mp-nombre">{perfil.nombre} {perfil.apellido}</strong>
            <span className={`gb-estado ${esAdmin ? "gb-estado-pendiente" : "gb-estado-confirmada"}`}>
              {esAdmin ? "Administrador" : "Cliente"}
            </span>
            <dl className="mp-datos">
              <dt>Documento</dt>
              <dd>{TIPOS_DOCUMENTO[perfil.documento?.tipo] || perfil.documento?.tipo || "—"} {perfil.documento?.numeroD || ""}</dd>
              <dt>Miembro desde</dt>
              <dd>{fecha(perfil.fechaRegistro)}</dd>
              {perfil.fechaNacimiento && (
                <>
                  <dt>Fecha de nacimiento</dt>
                  <dd>{fecha(perfil.fechaNacimiento)}</dd>
                </>
              )}
            </dl>
            <span className="gb-ayuda">¿Tu documento está mal? Escríbenos desde Contáctanos y un administrador lo corrige.</span>
          </div>
        </Col>

        <Col lg={8}>
          <div className="gb-tarjeta">
            <Form onSubmit={guardar} className="gb-form">
              <h2 className="gb-seccion-titulo">Datos personales</h2>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Label htmlFor="mp-nombre">Nombre *</Form.Label>
                  <Form.Control required minLength={2} maxLength={60} autoComplete="given-name" {...campo("nombre")} />
                </Col>
                <Col md={6}>
                  <Form.Label htmlFor="mp-apellido">Apellido *</Form.Label>
                  <Form.Control required minLength={2} maxLength={60} autoComplete="family-name" {...campo("apellido")} />
                </Col>
                <Col md={6}>
                  <Form.Label htmlFor="mp-fechaNacimiento">Fecha de nacimiento</Form.Label>
                  <Form.Control type="date" max={HOY} min="1900-01-01" {...campo("fechaNacimiento")} />
                </Col>
              </Row>

              <h2 className="gb-seccion-titulo">Contacto</h2>
              <Row className="g-3 mb-4">
                <Col md={7}>
                  <Form.Label htmlFor="mp-correo">Correo electrónico *</Form.Label>
                  <Form.Control type="email" required autoComplete="email" {...campo("correo")} />
                  <span className="gb-ayuda">Aquí te llegan las confirmaciones y recordatorios.</span>
                </Col>
                <Col md={5}>
                  <Form.Label htmlFor="mp-telefono">Teléfono</Form.Label>
                  <Form.Control type="tel" inputMode="tel" maxLength={15} pattern="\+?[0-9 ]{7,15}"
                    title="Entre 7 y 15 dígitos" autoComplete="tel" {...campo("telefono")} />
                </Col>
              </Row>

              <h2 className="gb-seccion-titulo">Dirección</h2>
              <Row className="g-3 mb-2">
                <Col sm={6} lg={3}>
                  <Form.Label htmlFor="mp-calle">Calle</Form.Label>
                  <Form.Control maxLength={40} {...campo("calle")} />
                </Col>
                <Col sm={6} lg={3}>
                  <Form.Label htmlFor="mp-carrera">Carrera</Form.Label>
                  <Form.Control maxLength={40} {...campo("carrera")} />
                </Col>
                <Col sm={6} lg={3}>
                  <Form.Label htmlFor="mp-ciudad">Ciudad</Form.Label>
                  <Form.Control maxLength={60} autoComplete="address-level2" {...campo("ciudad")} />
                </Col>
                <Col sm={6} lg={3}>
                  <Form.Label htmlFor="mp-pais">País</Form.Label>
                  <Form.Control maxLength={60} autoComplete="country-name" {...campo("pais")} />
                </Col>
              </Row>

              <div className="gb-form-botones">
                <button type="button" className="btn-gb btn-gb-secondary" onClick={() => navigate(-1)} disabled={guardando}>Volver</button>
                <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
                  {guardando ? <><Spinner size="sm" /> Guardando…</> : "Guardar cambios"}
                </button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}
