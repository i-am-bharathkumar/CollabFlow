import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Dashboard = () => {
  // For Week 1, we'll create a placeholder dashboard
  // This will be expanded in Week 3 with real functionality
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-4">Welcome to Your Dashboard</h1>
          <p className="lead">
            This is a placeholder dashboard for Week 1 submission. In the coming weeks, 
            we'll implement real-time collaboration features, document management, 
            and other functionality.
          </p>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Documents</Card.Title>
              <Card.Text>
                Create and manage your documents. Collaborate with team members in real-time.
              </Card.Text>
              <Button variant="primary">My Documents</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Projects</Card.Title>
              <Card.Text>
                Organize your work into projects. Track progress and manage tasks.
              </Card.Text>
              <Button variant="primary">My Projects</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Team</Card.Title>
              <Card.Text>
                Manage your team members and their access permissions.
              </Card.Text>
              <Button variant="primary">Team Settings</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Recent Activity</Card.Header>
            <Card.Body>
              <p>No recent activity to display.</p>
              <p className="text-muted">
                This section will show your recent collaborations and document edits
                once the real-time features are implemented in Week 3.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;