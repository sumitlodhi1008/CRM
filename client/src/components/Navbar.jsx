import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return <span className="badge bg-danger">Administrator</span>;
      case 'Manager':
        return <span className="badge bg-primary">Sales Manager</span>;
      case 'SalesExecutive':
        return <span className="badge bg-success">Sales Executive</span>;
      default:
        return <span className="badge bg-secondary">{role}</span>;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ backgroundColor: '#1E3A8A' }}>
      <div className="container-fluid px-3">
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/dashboard">
          <i className="bi bi-diagram-3-fill me-2 fs-4 text-warning"></i>
          <span>AcxiomCRM</span>
        </Link>

        <div className="d-flex align-items-center ms-auto">
          {user && (
            <div className="d-flex align-items-center text-white me-3">
              <i className="bi bi-person-circle fs-4 me-2"></i>
              <div className="d-none d-md-block text-end me-3">
                <div className="fw-semibold lh-1">{user.name}</div>
                <small className="text-light opacity-75">{user.email}</small>
              </div>
              <div className="me-3">{getRoleBadge(user.role)}</div>
              <button
                onClick={logout}
                className="btn btn-outline-light btn-sm d-flex align-items-center"
                title="Logout"
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                <span className="d-none d-sm-inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
