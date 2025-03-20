import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './LayoutStyles.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="footer-heading">CollabFlow</h5>
            <p>
              A real-time collaboration tool that allows multiple users to work
              on the same project simultaneously.
            </p>
            <div className="social-icons">
              <a href="#!" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#!" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#!" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#!" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </Col>
          
          <Col md={2} className="mb-4 mb-md-0">
            <h5 className="footer-heading">Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/features" className="footer-link">Features</Link></li>
              <li><Link to="/about" className="footer-link">About</Link></li>
              <li><Link to="/login" className="footer-link">Login</Link></li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <h5 className="footer-heading">Resources</h5>
            <ul className="list-unstyled">
              <li><a href="#!" className="footer-link">Documentation</a></li>
              <li><a href="#!" className="footer-link">Tutorials</a></li>
              <li><a href="#!" className="footer-link">API Reference</a></li>
              <li><a href="#!" className="footer-link">Community</a></li>
            </ul>
          </Col>
          
          <Col md={3}>
            <h5 className="footer-heading">Contact</h5>
            <ul className="list-unstyled">
              <li className="footer-link">
                <i className="fas fa-envelope me-2"></i> bk@gmail.com
              </li>
              <li className="footer-link">
                <i className="fas fa-phone me-2"></i> (999) 999-9999
              </li>
              <li className="footer-link">
                <i className="fas fa-map-marker-alt me-2"></i> Kundapura, India
              </li>
            </ul>
          </Col>
        </Row>
        
      
      </Container>
    </footer>
  );
};

export default Footer;