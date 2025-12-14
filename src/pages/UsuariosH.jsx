import { Button, ButtonGroup, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../styles/UsuariosH.css';

export default function UsuariosH() {
  const navigate = useNavigate();
  return (
    <>
      <Container fluid className="users-wrapper">

        {/* ENCABEZADO */}
        <Row className="align-items-center justify-content-between mb">

          <Col md={3}>
            <Form.Control type="text" placeholder="Buscar" className="search-input" />
          </Col>

          <Col md="auto">
            <h1 className="title-users">USUARIOS</h1>
          </Col>

          <Col md="auto">
            <Button variant="success" className="add-btn-users" onClick={() => navigate("/usuariosC")} >
              ADD
            </Button>
          </Col>

        </Row>

{/* TABLA */}
<Table bordered hover responsive className="users-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>NOMBRE</th>
      <th>ROL</th>
      <th>CORREO ELECTRÓNICO</th>
      <th>GESTIONAR USUARIO</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>Juan Pérez</td>
      <td>Administrador</td>
      <td>juan.perez@example.com</td>
      <td className="text-center">
        <ButtonGroup>
          <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT</Button>
          <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
        </ButtonGroup>
      </td>
    </tr>

    <tr>
      <td>2</td>
      <td>María Gómez</td>
      <td>Editor</td>
      <td>maria.gomez@example.com</td>
      <td className="text-center">
        <ButtonGroup>
          <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT</Button>
          <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
        </ButtonGroup>
      </td>
    </tr>

    <tr>
      <td>3</td>
      <td>Carlos López</td>
      <td>Usuario</td>
      <td>carlos.lopez@example.com</td>
      <td className="text-center">
        <ButtonGroup>
          <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT</Button>
          <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
        </ButtonGroup>
      </td>
    </tr>

    <tr>
      <td>4</td>
      <td>Laura Sánchez</td>
      <td>Administrador</td>
      <td>laura.sanchez@example.com</td>
      <td className="text-center">
        <ButtonGroup>
          <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT</Button>
          <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
        </ButtonGroup>
      </td>
    </tr>

    <tr>
      <td>5</td>
      <td>Pedro Martínez</td>
      <td>Usuario</td>
      <td>pedro.martinez@example.com</td>
      <td className="text-center">
        <ButtonGroup>
          <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT</Button>
          <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
        </ButtonGroup>
      </td>
    </tr>

    <tr>
      <td>6</td>
      <td>Sofía Herrera</td>
      <td>Editor</td>
      <td>sofia.herrera@example.com</td>
      <td className="text-center">
        <ButtonGroup>
          <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT</Button>
          <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
        </ButtonGroup>
      </td>
    </tr>

    <tr>
      <td>7</td>
      <td>Diego Torres</td>
      <td>Usuario</td>
      <td>diego.torres@example.com</td>
      <td className="text-center">
        <ButtonGroup>
          <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT</Button>
          <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
        </ButtonGroup>
      </td>
    </tr>

    <tr>
      <td>8</td>
      <td>Ana Ruiz</td>
      <td>Editor</td>
      <td>ana.ruiz@example.com</td>
      <td className="text-center">
        <ButtonGroup>
          <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT</Button>
          <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
        </ButtonGroup>
      </td>
    </tr>
  </tbody>
</Table>
      </Container>
    </>
  )
}