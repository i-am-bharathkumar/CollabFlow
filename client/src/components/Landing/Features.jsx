import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './LandingStyles.css';

const Features = () => {
  const features = [
    {
      icon: 'fas fa-edit',
      title: 'Simultaneous Editing',
      description: 'Multiple users can edit the same document at the same time without conflicts.',
      route: '/simultaneous-editing',
      color: '#4f46e5'
    },
    {
      icon: 'fas fa-comments',
      title: 'Live Chat',
      description: 'Communicate with your team in real-time while working on projects.',
      route: '/live-chat',
      color: '#8b5cf6'
    },
    {
      icon: 'fas fa-video',
      title: 'Video Conferencing',
      description: 'Start video calls directly within the platform for seamless collaboration.',
      route: '/video-conferencing',
      color: '#ec4899'
    },
    {
      icon: 'fas fa-code-branch',
      title: 'Version Control',
      description: 'Track changes, compare versions, and restore previous document states.',
      route: '/version-control',
      color: '#10b981'
    },
    {
      icon: 'fas fa-tasks',
      title: 'Task Management',
      description: 'Assign tasks, set deadlines, and track progress within your workspace.',
      route: '/task-management',
      color: '#f59e0b'
    },
    {
      icon: 'fas fa-sitemap',
      title: 'Workflow Automation',
      description: 'Create custom workflows to automate repetitive processes and approvals.',
      route: '/workflow-automation',
      color: '#3b82f6'
    }
  ];

  return (
    <section id="features" className="features-section section-padding">
      <Container>
        <Row className="justify-content-center mb-5 fade-in">
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
            <Col md={6} lg={4} key={index} className={`mb-4 fade-in delay-${index % 3 + 1}`}>
              <div className="feature-card feature-card-enhanced">
                <div className="feature-icon-wrapper" style={{ backgroundColor: `${feature.color}20` }}>
                  <i className={feature.icon} style={{ color: feature.color }}></i>
                </div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
                <Link 
                  to={feature.route} 
                  className="feature-link"
                  style={{ color: feature.color }}
                >
                  Explore Feature <i className="fas fa-arrow-right ms-1"></i>
                </Link>
              </div>
            </Col>
          ))}
        </Row>
        <Row className="mt-5 justify-content-center fade-in delay-3">
          <Col md={6} className="text-center">
            <Link to="/features" className="btn btn-outline-primary btn-lg">
              View All Features <i className="fas fa-chevron-right ms-2"></i>
            </Link>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Features;