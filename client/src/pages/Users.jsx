import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SalesExecutive',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'SalesExecutive',
        isActive: true
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'User Name is required.';

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!editingUser) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!formData.password) {
        errors.password = 'Password is required.';
      } else if (!passwordRegex.test(formData.password)) {
        errors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        });
        Swal.fire('Success', 'User profile updated successfully.', 'success');
      } else {
        await api.post('/users', formData);
        Swal.fire('Success', 'New user account provisioned successfully.', 'success');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || 'Failed to save user.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlockAccount = async (id, name) => {
    try {
      await api.put(`/users/${id}`, { resetLockout: true });
      Swal.fire('Unlocked', `Account for ${name} has been unlocked and failed attempts reset.`, 'success');
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', 'Failed to unlock account.', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      Swal.fire('Updated', `User account marked as ${!user.isActive ? 'Active' : 'Deactivated'}.`, 'success');
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', 'Failed to update user status.', 'error');
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">User & Access Management</h2>
          <p className="text-muted small mb-0">Administer personnel accounts, assign RBAC roles, and manage account lockout security.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={() => handleOpenModal()}>
          <i className="bi bi-person-plus-fill me-2"></i> Provision New User
        </button>
      </div>

      <div className="crm-table-card shadow-sm">
        <div className="table-responsive">
          <table className="table crm-table table-hover mb-0">
            <thead>
              <tr>
                <th>User Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Failed Logins</th>
                <th>Lockout State</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isLocked = u.lockoutEnd && new Date(u.lockoutEnd) > new Date();

                  return (
                    <tr key={u._id}>
                      <td className="fw-semibold">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'Admin' ? 'bg-danger' : u.role === 'Manager' ? 'bg-primary' : 'bg-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.failedLoginCount >= 5 ? 'bg-danger' : u.failedLoginCount > 0 ? 'bg-warning text-dark' : 'bg-light text-dark border'}`}>
                          {u.failedLoginCount || 0} / 5
                        </span>
                      </td>
                      <td>
                        {isLocked ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-danger badge-pulse">LOCKED</span>
                            <button
                              className="btn btn-sm btn-outline-warning py-0 px-1"
                              onClick={() => handleUnlockAccount(u._id, u.name)}
                              title="Unlock Account"
                            >
                              <i className="bi bi-unlock-fill me-1"></i> Unlock
                            </button>
                          </div>
                        ) : (
                          <span className="badge bg-light text-success border">Normal</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => handleOpenModal(u)} title="Edit Role/User">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className={`btn ${u.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi ${u.isActive ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  {editingUser ? `Edit User: ${editingUser.name}` : 'Provision New System User'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label">Full Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email Address <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      placeholder="user@acxiomcrm.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>

                  {!editingUser && (
                    <div className="mb-3">
                      <label className="form-label">Password <span className="text-danger">*</span></label>
                      <input
                        type="password"
                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                        placeholder="Min 8 chars, Aa1@"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                      <small className="text-muted d-block mt-1">
                        Must contain uppercase, lowercase, digit, and special symbol.
                      </small>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Role Assignment <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="SalesExecutive">Sales Executive (Field / Inside Sales)</option>
                      <option value="Manager">Sales Manager (Team Management)</option>
                      <option value="Admin">Administrator (Full Access)</option>
                    </select>
                  </div>

                  <div className="form-check form-switch mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="userActiveSwitch"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="userActiveSwitch">
                      Account Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingUser ? 'Update User' : 'Provision User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
