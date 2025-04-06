import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './LayoutStyles.css';

const NavbarComponent = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Navbar bg="light" expand="lg" className="navbar-custom" expanded={expanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand">
          <i className="fas fa-users me-2"></i>
          CollabFlow
        </Navbar.Brand>
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Home</Nav.Link>
            <Nav.Link as={Link} to="/features" onClick={() => setExpanded(false)}>Features</Nav.Link>
            <Nav.Link as={Link} to="/about" onClick={() => setExpanded(false)}>About</Nav.Link>
            <Nav className="ms-lg-2">
              <Button as={Link} to="/login" variant="outline-primary" className="me-2" onClick={() => setExpanded(false)}>
                Login
              </Button>
              <Button as={Link} to="/register" variant="primary" onClick={() => setExpanded(false)}>
                Sign Up
              </Button>
            </Nav>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;