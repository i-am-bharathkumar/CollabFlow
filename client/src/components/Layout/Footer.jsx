import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './LayoutStyles.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="var(--primary-color)" fillOpacity="0.1" d="M0,96L48,106.7C96,117,192,139,288,138.7C384,139,480,117,576,122.7C672,128,768,160,864,160C960,160,1056,128,1152,122.7C1248,117,1344,139,1392,149.3L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      
      <Container>
        <Row>
          <Col lg={4} md={6} className="mb-4 mb-md-0 footer-col">
            <div className="footer-brand">
              <h5 className="footer-heading">CollabFlow</h5>
              <p className="footer-description">
                A real-time collaboration tool that empowers teams to work together effectively, regardless of location. Streamline your workflow and boost productivity.
              </p>
            </div>
            <div className="social-icons">
              <a href="#!" className="social-icon" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#!" className="social-icon" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#!" className="social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#!" className="social-icon" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0 footer-col">
            <h5 className="footer-heading">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li className="footer-link-item">
                <Link to="/" className="footer-link">
                  <i className="fas fa-chevron-right me-2"></i>Home
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/features" className="footer-link">
                  <i className="fas fa-chevron-right me-2"></i>Features
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/pricing" className="footer-link">
                  <i className="fas fa-chevron-right me-2"></i>Pricing
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/about" className="footer-link">
                  <i className="fas fa-chevron-right me-2"></i>About Us
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/contact" className="footer-link">
                  <i className="fas fa-chevron-right me-2"></i>Contact
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-md-0 footer-col">
            <h5 className="footer-heading">Resources</h5>
            <ul className="list-unstyled footer-links">
              <li className="footer-link-item">
                <a href="#!" className="footer-link">
                  <i className="fas fa-file-alt me-2"></i>Documentation
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#!" className="footer-link">
                  <i className="fas fa-book me-2"></i>Tutorials
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#!" className="footer-link">
                  <i className="fas fa-code me-2"></i>API Reference
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#!" className="footer-link">
                  <i className="fas fa-users me-2"></i>Community
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#!" className="footer-link">
                  <i className="fas fa-question-circle me-2"></i>Support
                </a>
              </li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="footer-col">
            <h5 className="footer-heading">Contact Us</h5>
            <ul className="list-unstyled footer-contact">
              <li className="footer-contact-item">
                <i className="fas fa-envelope contact-icon"></i>
                <span>support@collabflow.com</span>
              </li>
              <li className="footer-contact-item">
                <i className="fas fa-phone contact-icon"></i>
                <span>(999) 999-9999</span>
              </li>
              <li className="footer-contact-item">
                <i className="fas fa-map-marker-alt contact-icon"></i>
                <span>Kundapura, Karnataka, India</span>
              </li>
            </ul>
            <div className="newsletter mt-3">
              <h6 className="newsletter-heading">Subscribe to our newsletter</h6>
              <div className="newsletter-form">
                <input type="email" className="form-control" placeholder="Your email" />
                <button className="btn btn-primary newsletter-btn">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </Col>
        </Row>
        
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {currentYear} CollabFlow. All rights reserved.</p>
          </div>
          <div className="footer-bottom-links">
            <a href="#!" className="footer-bottom-link">Privacy Policy</a>
            <a href="#!" className="footer-bottom-link">Terms of Service</a>
            <a href="#!" className="footer-bottom-link">Cookie Policy</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;