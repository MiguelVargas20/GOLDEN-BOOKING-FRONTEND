import { Container, Row, Col, Table, Button, Form, ButtonGroup } from "react-bootstrap";
import '../styles/UsuariosH.css'

export default function UsuariosH (){
    return(
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
          <Button variant="success" className="add-btn-users"  >
            ADD 
          </Button>
        </Col>

      </Row>

      {/* TABLA */}
      <Table bordered hover responsive className="users-table">
        <thead>
          <tr>
            <th>NOMBRE</th>
            <th> CORREO ELECTRÓNICO</th>
            <th>GESTIONAR USUARIO</th>
          </tr>
        </thead>

        <tbody>
                <ButtonGroup>
                  <Button variant="outline-dark" size="sm" className="edit-btn-users">EDIT </Button>
                  <Button variant="danger" size="sm" className="delete-btn-users">DELETE</Button>
                </ButtonGroup>
        </tbody>
      </Table>

    </Container>
    </>
  )
}