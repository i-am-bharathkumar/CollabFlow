import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Alert, Tab, Tabs, Card, Modal, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfileStyles.css';

const Profile = () => {
  const { currentUser, updateUser, updatePassword, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const profileFormRef = useRef(null);
  const passwordFormRef = useRef(null);
  
  // Profile info state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: ''
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: 'danger'
  });

  // Account activity state
  const [accountActivity, setAccountActivity] = useState([
    { type: 'login', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), ip: '192.168.1.1', device: 'Chrome on Windows' },
    { type: 'password_change', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), ip: '192.168.1.1', device: 'Firefox on MacOS' }
  ]);

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        website: currentUser.website || ''
      });
      setAvatarPreview(currentUser.avatarUrl || null);
    }
  }, [currentUser]);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update password strength when new password changes
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image/*')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkPasswordStrength = (password) => {
    // Simple password strength algorithm
    let score = 0;
    let message = '';
    let color = 'danger';
    
    if (password.length >= 8) score += 1;
    if (password.match(/[A-Z]/)) score += 1;
    if (password.match(/[a-z]/)) score += 1;
    if (password.match(/[0-9]/)) score += 1;
    if (password.match(/[^A-Za-z0-9]/)) score += 1;
    
    if (score === 0 || score === 1) {
      message = 'Very Weak';
      color = 'danger';
    } else if (score === 2) {
      message = 'Weak';
      color = 'warning';
    } else if (score === 3) {
      message = 'Moderate';
      color = 'info';
    } else if (score === 4) {
      message = 'Strong';
      color = 'primary';
    } else {
      message = 'Very Strong';
      color = 'success';
    }
    
    setPasswordStrength({ score, message, color });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Form validation
    if (!profileData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Create form data to include avatar file
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key]);
      });
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      await updateUser(formData);
      setSuccess('Profile updated successfully!');
      profileFormRef.current.reset();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      passwordFormRef.current.reset();
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setLoading(true);
    
    try {
      await deleteAccount(passwordConfirmation);
      setShowDeleteModal(false);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to logout');
    }
  };

  // Format date for activity log
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Container className="profile-page py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="profile-card shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <div className="avatar-container mb-3">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="default-avatar">
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="avatar-overlay">
                    <label htmlFor="avatar-upload" className="avatar-edit-btn">
                      <i className="bi bi-camera-fill"></i>
                    </label>
                  </div>
                </div>
                <h2>{profileData.name || 'My Profile'}</h2>
                <p className="text-muted">Manage your account settings</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-3">
                {/* Profile Information Tab */}
                <Tab eventKey="profile" title="Profile Information">
                  <Form ref={profileFormRef} onSubmit={handleProfileSubmit} className="mt-4">
                    <input
                      type="file"
                      id="avatar-upload"
                      className="d-none"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            placeholder="Enter your phone number"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Location</Form.Label>
                          <Form.Control
                            type="text"
                            name="location"
                            value={profileData.location}
                            onChange={handleProfileChange}
                            placeholder="City, Country"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Website/Social Media</Form.Label>
                      <Form.Control
                        type="url"
                        name="website"
                        value={profileData.website}
                        onChange={handleProfileChange}
                        placeholder="https://example.com"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us a little about yourself"
                      />
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      className="w-100"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : 'Update Profile'}
                    </Button>
                  </Form>
                </Tab>

                {/* Change Password Tab */}
                <Tab eventKey="password" title="Change Password">
                  <Form ref={passwordFormRef} onSubmit={handlePasswordSubmit} className="mt-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="d-flex align-items-center">
                            <div className="me-2">Strength:</div>
                            <div className={`password-strength text-${passwordStrength.color}`}>
                              {passwordStrength.message}
                            </div>
                          </div>
                          <div className="password-strength-bar mt-1">
                            {[1, 2, 3, 4, 5].map((segment) => (
                              <div 
                                key={segment}
                                className={`segment bg-${segment <= passwordStrength.score ? passwordStrength.color : 'light'}`}
                              ></div>
                            ))}
                          </div>
                          <small className="text-muted mt-1 d-block">
                            Use at least 8 characters with uppercase letters, lowercase letters, numbers, and symbols
                          </small>
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <small className="text-danger">Passwords do not match</small>
                      )}
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      className="w-100"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : 'Change Password'}
                    </Button>
                  </Form>
                </Tab>

                {/* Security Tab */}
                <Tab eventKey="security" title="Activity">
                  <div className="mt-4">
                    <h5>Recent Activity</h5>
                    <div className="activity-log mt-3">
                      {accountActivity.map((activity, index) => (
                        <div key={index} className="activity-item p-3 mb-2 border rounded">
                          <div className="d-flex justify-content-between">
                            <div>
                              <div className="activity-type">
                                {activity.type === 'login' ? 'Account Login' : 
                                 activity.type === 'password_change' ? 'Password Changed' : 
                                 'Account Updated'}
                              </div>
                              <div className="activity-device text-muted small">
                                {activity.device}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="activity-time">
                                {formatDate(activity.date)}
                              </div>
                              <div className="activity-ip text-muted small">
                                IP: {activity.ip}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tab>
              </Tabs>

              <div className="d-flex mt-4">
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                  className="me-2"
                >
                  Logout
                </Button>
                <Button 
                  variant="link" 
                  className="text-danger ms-auto"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            Warning: This action cannot be undone. All your data will be permanently deleted.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Enter your password to confirm</Form.Label>
            <Form.Control
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Your current password"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={!passwordConfirmation || loading}
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;