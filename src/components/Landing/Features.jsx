import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './LandingStyles.css';

const Features = () => {
 
  const features = [
    {
      icon: 'fas fa-edit',
      title: 'Simultaneous Editing',
      description: 'Multiple users can edit the same document at the same time without conflicts.'
    },
    {
      icon: 'fas fa-comments',
      title: 'Live Chat',
      description: 'Communicate with your team in real-time while working on projects.'
    },
    {
      icon: 'fas fa-video',
      title: 'Video Conferencing',
      description: 'Start video calls directly within the platform for seamless collaboration.'
    },
    {
      icon: 'fas fa-code-branch',
      title: 'Version Control',
      description: 'Track changes, compare versions, and restore previous document states.'
    },
    {
      icon: 'fas fa-tasks',
      title: 'Task Management',
      description: 'Assign tasks, set deadlines, and track progress within your workspace.'
    },
    {
      icon: 'fas fa-sitemap',
      title: 'Workflow Automation',
      description: 'Create custom workflows to automate repetitive processes and approvals.'
    }
    
  ];

  return (
    <section id="features" className="features-section section-padding bg-light">
      <Container>
        <Row className="justify-content-center mb-5 fade-in delay-1">
          <Col lg={8} className="text-center">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-description">
              Our comprehensive suite of tools enables seamless collaboration 
              across teams, regardless of location or time zone.
            </p>
          </Col>
        </Row>
        <Row>
          {features.map((feature, index) => (
            <Col md={6} lg={4} key={index} className="mb-4 fade-in delay-3">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Features;