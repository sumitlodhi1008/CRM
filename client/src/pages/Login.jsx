import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please provide your Username/Email and Password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Invalid login credentials or server unavailable.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="card shadow-sm border-0 p-4" style={{ maxWidth: '440px', width: '100%', borderRadius: '12px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary p-3 rounded-circle mb-3">
            <i className="bi bi-shield-lock-fill fs-2"></i>
          </div>
          <h3 className="fw-bold text-dark">AcxiomCRM</h3>
          <p className="text-muted small">Enterprise Customer Relationship Management</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center p-2 mb-3 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2 fs-5"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username or Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-envelope text-muted"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="name@acxiomcrm.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-key text-muted"></i></span>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center mt-4"
            disabled={submitting}
            style={{ backgroundColor: '#1E3A8A' }}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Authenticating...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>

        <div className="border-top mt-4 pt-3">
          <small className="text-muted d-block text-center mb-2 fw-semibold">Quick Role Selector (Demo):</small>
          <div className="d-flex justify-content-between gap-1">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger flex-fill"
              onClick={() => fillCredentials('admin@acxiomcrm.com', 'Admin@12345')}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary flex-fill"
              onClick={() => fillCredentials('manager@acxiomcrm.com', 'Manager@12345')}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-success flex-fill"
              onClick={() => fillCredentials('sales@acxiomcrm.com', 'Sales@12345')}
            >
              Sales Rep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
