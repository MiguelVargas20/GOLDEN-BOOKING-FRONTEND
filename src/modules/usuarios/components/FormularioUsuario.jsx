import { useState } from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { aTextoFecha } from "../../../shared/utils/fechas";

const TIPOS_DOCUMENTO = [
  { valor: "CC", texto: "Cédula de ciudadanía" },
  { valor: "TI", texto: "Tarjeta de identidad" },
  { valor: "CE", texto: "Cédula de extranjería" },
  { valor: "PA", texto: "Pasaporte" },
];

// Fecha local (toISOString daría la de UTC, que en la noche ya es "mañana")
const HOY = aTextoFecha(new Date());

/**
 * Campos de un usuario (crear y editar desde el panel del ADMIN).
 * @param {"crear"|"editar"} modo  en "crear" pide usuario y contraseña
 * @param {boolean} bloquearCuenta deshabilita estado y rol (la propia cuenta del admin)
 */
export default function FormularioUsuario({ modo, valores, onCambio, onEnviar, onCancelar, guardando, bloquearCuenta = false, textoEnviar }) {
  const [verPassword, setVerPassword] = useState(false);
  const campo = (nombre) => ({
    id: `fu-${nombre}`,
    value: valores[nombre],
    onChange: (e) => onCambio({ ...valores, [nombre]: e.target.value }),
  });

  return (
    <Form onSubmit={onEnviar} className="gb-form">
      <h2 className="gb-seccion-titulo">Datos personales</h2>
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Form.Label htmlFor="fu-nombre">Nombre *</Form.Label>
          <Form.Control required minLength={2} maxLength={60} autoComplete="off" {...campo("nombre")} />
        </Col>
        <Col md={6}>
          <Form.Label htmlFor="fu-apellido">Apellido *</Form.Label>
          <Form.Control required minLength={2} maxLength={60} autoComplete="off" {...campo("apellido")} />
        </Col>
        <Col md={4}>
          <Form.Label htmlFor="fu-tipoDocumento">Tipo de documento</Form.Label>
          <Form.Select {...campo("tipoDocumento")}>
            {TIPOS_DOCUMENTO.map((t) => <option key={t.valor} value={t.valor}>{t.texto}</option>)}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Label htmlFor="fu-numeroDocumento">Número de documento *</Form.Label>
          <Form.Control required minLength={5} maxLength={15} pattern="\S+" title="Sin espacios" {...campo("numeroDocumento")} />
        </Col>
        <Col md={4}>
          <Form.Label htmlFor="fu-fechaNacimiento">Fecha de nacimiento{modo === "crear" ? " *" : ""}</Form.Label>
          <Form.Control type="date" max={HOY} min="1900-01-01" required={modo === "crear"} {...campo("fechaNacimiento")} />
        </Col>
      </Row>

      <h2 className="gb-seccion-titulo">Contacto</h2>
      <Row className="g-3 mb-4">
        <Col md={7}>
          <Form.Label htmlFor="fu-email">Correo electrónico *</Form.Label>
          <Form.Control type="email" required {...campo("email")} />
        </Col>
        <Col md={5}>
          <Form.Label htmlFor="fu-telefono">Teléfono{modo === "crear" ? " *" : ""}</Form.Label>
          <Form.Control type="tel" inputMode="tel" placeholder="3001234567" maxLength={15}
            pattern="\+?[0-9 ]{7,15}" title="Entre 7 y 15 dígitos" required={modo === "crear"} {...campo("telefono")} />
        </Col>
      </Row>

      <h2 className="gb-seccion-titulo">Dirección</h2>
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Form.Label htmlFor="fu-calle">Calle</Form.Label>
          <Form.Control maxLength={40} {...campo("calle")} />
        </Col>
        <Col sm={6} lg={3}>
          <Form.Label htmlFor="fu-carrera">Carrera</Form.Label>
          <Form.Control maxLength={40} {...campo("carrera")} />
        </Col>
        <Col sm={6} lg={3}>
          <Form.Label htmlFor="fu-ciudad">Ciudad{modo === "crear" ? " *" : ""}</Form.Label>
          <Form.Control maxLength={60} required={modo === "crear"} {...campo("ciudad")} />
        </Col>
        <Col sm={6} lg={3}>
          <Form.Label htmlFor="fu-pais">País{modo === "crear" ? " *" : ""}</Form.Label>
          <Form.Control maxLength={60} required={modo === "crear"} {...campo("pais")} />
        </Col>
      </Row>

      <h2 className="gb-seccion-titulo">Cuenta</h2>
      <Row className="g-3 mb-2">
        {modo === "crear" && (
          <>
            <Col md={6}>
              <Form.Label htmlFor="fu-username">Nombre de usuario *</Form.Label>
              <Form.Control required minLength={4} maxLength={20} pattern="[A-Za-z0-9._\-]+" autoComplete="off"
                title="4 a 20 caracteres: letras, números, punto, guion o guion bajo" {...campo("username")} />
            </Col>
            <Col md={6}>
              <Form.Label htmlFor="fu-password">Contraseña *</Form.Label>
              <div className="position-relative">
                <Form.Control type={verPassword ? "text" : "password"} required minLength={8} maxLength={30}
                  pattern="(?=.*[A-Z])(?=.*[0-9]).{8,30}" title="Mínimo 8 caracteres, una mayúscula y un número"
                  autoComplete="new-password" style={{ paddingRight: 44 }} {...campo("password")} />
                <button type="button" className="fu-ver-password" onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {verPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                </button>
              </div>
              <span className="gb-ayuda">Mínimo 8 caracteres, una mayúscula y un número.</span>
            </Col>
          </>
        )}
        {modo === "editar" && (
          <Col md={6}>
            <Form.Label htmlFor="fu-estado">Estado</Form.Label>
            <Form.Select {...campo("estado")} disabled={bloquearCuenta}>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo (pierde el acceso de inmediato)</option>
            </Form.Select>
          </Col>
        )}
        <Col md={6}>
          <Form.Label htmlFor="fu-rol">Rol</Form.Label>
          <Form.Select {...campo("rol")} disabled={bloquearCuenta}>
            <option value="ROL_CLIENTE">Cliente</option>
            <option value="ROL_ADMIN">Administrador</option>
          </Form.Select>
        </Col>
      </Row>

      <div className="gb-form-botones">
        <button type="button" className="btn-gb btn-gb-secondary" onClick={onCancelar} disabled={guardando}>Cancelar</button>
        <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
          {guardando ? <><Spinner size="sm" /> Guardando…</> : textoEnviar}
        </button>
      </div>
    </Form>
  );
}
