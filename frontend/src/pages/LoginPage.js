import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col, Card, Form, Button, ButtonGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, selectedRole);
      navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/chat');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="auth-container min-vh-100 d-flex align-items-center justify-content-center py-5" style={{background: 'linear-gradient(135deg, var(--color-primary-900), var(--color-primary-700))'}}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={4}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <Card className="shadow-lg border-0" style={{backgroundColor: 'var(--color-primary-800)', borderRadius: '16px'}}>
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <i className="fas fa-shield-alt fs-1 text-primary mb-3" style={{color: 'var(--color-accent)'}}></i>
                    </motion.div>
                    <h1 className="fs-2 fw-bold text-primary mb-1" style={{color: 'var(--color-accent)', letterSpacing: '2px'}}>WATCHDOG</h1>
                    <p className="text-muted mb-1">Enterprise AI Safety Platform</p>
                    <h2 className="fs-4 fw-semibold text-white mb-0">Sign in to WATCHDOG</h2>
                  </div>

                  <div className="mb-4">
                    <ButtonGroup className="w-100" size="lg">
                      <Button 
                        variant={selectedRole === 'user' ? 'primary' : 'outline-light'}
                        onClick={() => setSelectedRole('user')}
                        className="d-flex align-items-center justify-content-center gap-2"
                        style={selectedRole === 'user' ? {backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)'} : {}}
                      >
                        <i className="fas fa-user"></i>
                        User
                      </Button>
                      <Button 
                        variant={selectedRole === 'admin' ? 'primary' : 'outline-light'}
                        onClick={() => setSelectedRole('admin')}
                        className="d-flex align-items-center justify-content-center gap-2"
                        style={selectedRole === 'admin' ? {backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)'} : {}}
                      >
                        <i className="fas fa-shield-alt"></i>
                        Admin
                      </Button>
                    </ButtonGroup>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white fw-medium">Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        size="lg"
                        style={{
                          backgroundColor: 'var(--color-primary-700)',
                          border: '1px solid var(--color-primary-600)',
                          color: 'white'
                        }}
                        className="custom-form-control"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="text-white fw-medium">Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        size="lg"
                        style={{
                          backgroundColor: 'var(--color-primary-700)',
                          border: '1px solid var(--color-primary-600)',
                          color: 'white'
                        }}
                        className="custom-form-control"
                      />
                    </Form.Group>

                    <motion.div
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        className="w-100 fw-medium d-flex align-items-center justify-content-center gap-2"
                        disabled={isLoading}
                        style={{
                          backgroundColor: 'var(--color-accent)',
                          borderColor: 'var(--color-accent)',
                          padding: '12px'
                        }}
                      >
                        {isLoading ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          <>
                            <i className="fas fa-sign-in-alt"></i>
                            Sign In
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </Form>

                  <div className="text-center mt-4">
                    <a 
                      href="/signup" 
                      className="text-decoration-none fw-medium"
                      style={{color: 'var(--color-accent)'}}
                    >
                      Create a user account
                    </a>
                  </div>

                  <motion.div 
                    className="text-center mt-4 p-3 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{backgroundColor: 'rgba(11, 15, 20, 0.5)'}}
                  >
                    <p className="small text-muted mb-2 fw-bold">Demo Credentials</p>
                    <div className="small text-light">
                      <div className="mb-1"><strong style={{color: 'var(--color-accent)'}}>Admin:</strong> admin@watchdog.ai / admin123</div>
                      <div><strong style={{color: 'var(--color-accent)'}}>User:</strong> user@test.com / user123</div>
                    </div>
                  </motion.div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;