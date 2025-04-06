import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Features from './Features';
import './LandingStyles.css';

const Landing = () => {
  return (
    <div className="landing-page fade-in delay-1">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">
                  Real-time Collaboration Made Simple
                </h1>
                <p className="lead mb-4">
                  CollabFlow enables teams to work together seamlessly on documents, 
                  projects, and tasks in real-time. Enhance productivity and 
                  eliminate version conflicts with our powerful collaboration platform.
                </p>
                <div className="hero-buttons">
                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    size="lg"
                    className="me-3 mb-3 mb-sm-0"
                  >
                    Get Started Free
                  </Button>
                  <Button
                    as={Link}
                    to="/features"
                    variant="outline-primary"
                    size="lg"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image text-center">
                <img
                 src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Collaboration Platform"
                  className="img-fluid rounded shadow"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Features />

      {/* About Section */}
      <section id="about" className="about-section section-padding">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title">Why Choose CollabFlow?</h2>
              <p className="section-description">
                Our platform is designed with teams in mind, offering a comprehensive 
                solution that addresses the challenges of remote collaboration.
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6} lg={3} className="mb-4">
              <div className="about-card text-center">
                <div className="about-icon mb-3">
                  <i className="fas fa-bolt fa-2x"></i>
                </div>
                <h4>Real-time Updates</h4>
                <p>See changes as they happen without refreshing the page.</p>
              </div>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <div className="about-card text-center">
                <div className="about-icon mb-3">
                  <i className="fas fa-lock fa-2x"></i>
                </div>
                <h4>Secure Sharing</h4>
                <p>Control access and permissions for all your documents.</p>
              </div>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <div className="about-card text-center">
                <div className="about-icon mb-3">
                  <i className="fas fa-history fa-2x"></i>
                </div>
                <h4>Version Control</h4>
                <p>Track changes and revert to previous versions with ease.</p>
              </div>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <div className="about-card text-center">
                <div className="about-icon mb-3">
                  <i className="fas fa-comments fa-2x"></i>
                </div>
                <h4>Integrated Chat</h4>
                <p>Discuss changes and ideas without leaving the platform.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <h2 className="mb-4">Ready to Transform Your Team's Collaboration?</h2>
              <p className="mb-4">
                Join thousands of teams that have improved their productivity with CollabFlow.
              </p>
              <Button
                as={Link}
                to="/register"
                variant="light"
                size="lg"
                className="btn-cta"
              >
                Start Collaborating Now
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Landing;