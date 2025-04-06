import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './AuthStyles.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // Password confirmation validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call for Week 1
    try {
      // In Week 1, we're just setting up the UI components
      // This would be replaced with an actual API call in later weeks
      console.log('Registration attempt:', { name, email, password });
      
      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
        // For demonstration, redirect to dashboard
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (err) {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in delay-1">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <div className="auth-card">
              <div className="text-center mb-4">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join CollabFlow to start collaborating</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Create a password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Must be at least 6 characters long
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-4"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
                  </p>
                </div>
              </Form>
              
              <div className="auth-divider">
                <span>or sign up with</span>
              </div>
              
              <div className="social-auth">
                <Button variant="outline-secondary" className="w-100 mb-3">
                  <i className="fab fa-google me-2"></i> Google
                </Button>
                <Button variant="outline-secondary" className="w-100">
                  <i className="fab fa-github me-2"></i> GitHub
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;