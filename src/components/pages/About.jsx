import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaSync, FaLock, FaCode } from 'react-icons/fa';
import './About.css'; // Import the CSS file

function About() {
  return (
    <div className="about-section">
      <Container>
        <Row className="mb-5">
          <Col className="text-center about-header">
            <h1 className="display-4 fade-in">About Our Collaboration Platform</h1>
            <p className="lead fade-in delay-1">
              A real-time collaboration solution empowering teams to work together seamlessly
            </p>
            <hr className="my-4" />
          </Col>
        </Row>
        
        <Row className="mb-5">
          <Col lg={6} className="fade-in delay-2">
            <h2 className="mb-4">Our Mission</h2>
            <p className="mb-4 mission-text">
              We've built this platform to eliminate the frustration of version conflicts, lost updates, and inefficient 
              collaboration. Our mission is to provide teams with a powerful yet intuitive workspace where multiple users 
              can contribute simultaneously without the traditional barriers of distributed teamwork.
            </p>
            <p className="mission-text">
              Whether you're managing projects, developing software, or creating educational content, our platform 
              streamlines collaboration with real-time synchronization, comprehensive version control, and integrated 
              communication tools.
            </p>
          </Col>
          <Col lg={6} className="fade-in delay-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h3 className="mb-3">Why Choose Our Platform?</h3>
                <br/>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-center">
                    <div className="feature-icon">
                      <FaUsers className="text-primary" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1">Seamless Collaboration</h5>
                      <p className="mb-0 text-muted">Multiple users can edit documents simultaneously with changes reflected in real-time</p>
                    </div>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <div className="feature-icon">
                      <FaSync className="text-primary" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1">Real-Time Updates</h5>
                      <p className="mb-0 text-muted">See changes as they happen with our WebSocket integration</p>
                    </div>
                  </li>
                  <li className="d-flex align-items-center">
                    <div className="feature-icon">
                      <FaCode className="text-primary" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1">Modern Technology</h5>
                      <p className="mb-0 text-muted">Built on the MERN stack for reliability and performance</p>
                    </div>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-5 fade-in delay-2">
          <Col>
            <h2 className="mb-4">Our Technology Stack</h2>
            <Row>
              <Col md={3} className="mb-4">
                <Card className="tech-card border-0 shadow-sm">
                  <Card.Body>
                    <h3 className="h5">MongoDB</h3>
                    <p className="text-muted">NoSQL database for flexible document storage and retrieval</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-4">
                <Card className="tech-card border-0 shadow-sm">
                  <Card.Body>
                    <h3 className="h5">Express.js</h3>
                    <p className="text-muted">Web application framework for powerful backend APIs</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-4">
                <Card className="tech-card border-0 shadow-sm">
                  <Card.Body>
                    <h3 className="h5">React.js</h3>
                    <p className="text-muted">Frontend library for building dynamic, responsive interfaces</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-4">
                <Card className="tech-card border-0 shadow-sm">
                  <Card.Body>
                    <h3 className="h5">Node.js</h3>
                    <p className="text-muted">JavaScript runtime for scalable server-side applications</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
        
        <Row className="fade-in delay-3">
          <Col>
            <div className="use-case-section border-0">
              <h2 className="mb-4">Use Cases</h2>
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <h4>Project Management</h4>
                  <p>Teams can track tasks, update progress, and collaborate on project documentation in real-time.</p>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <h4>Software Development</h4>
                  <p>Developers can collaboratively code, review, and document their work with instant feedback.</p>
                </Col>
                <Col md={4}>
                  <h4>Education</h4>
                  <p>Instructors and students can create interactive learning experiences with real-time collaboration.</p>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default About;