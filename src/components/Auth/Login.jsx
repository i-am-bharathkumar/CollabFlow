import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './AuthStyles.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call for Week 1
    try {
      // In Week 1, we're just setting up the UI components
      // This would be replaced with an actual API call in later weeks
      console.log('Login attempt:', { email, password });
      
      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
        // For demonstration, redirect to dashboard
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (err) {
      setError('Invalid credentials');
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
                <h2 className="auth-title">Welcome Back!</h2>
                <p className="auth-subtitle">Sign in to your CollabFlow account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={onSubmit}>
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
                    placeholder="Enter your password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    id="remember-me"
                  />
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </Link>
                </div>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-4"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
                  </p>
                </div>
              </Form>
              
              <div className="auth-divider">
                <span>or continue with</span>
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

export default Login;