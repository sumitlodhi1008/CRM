import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Swal from 'sweetalert2';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityType, setActivityType] = useState('');

  // Log Activity Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    activityType: 'Call',
    subject: '',
    description: '',
    relatedType: 'Customer',
    customerId: '',
    leadId: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let url = '/activities?limit=50';
      if (activityType) url += `&activityType=${activityType}`;
      const res = await api.get(url);
      setActivities(res.data.data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/leads?limit=100')
      ]);
      setCustomers(cRes.data.data);
      setLeads(lRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchDependencies();
  }, [activityType]);

  const handleOpenModal = () => {
    setFormData({
      activityType: 'Call',
      subject: '',
      description: '',
      relatedType: 'Customer',
      customerId: customers[0]?._id || '',
      leadId: leads[0]?._id || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      Swal.fire('Validation Error', 'Subject is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        activityType: formData.activityType,
        subject: formData.subject,
        description: formData.description,
        customerId: formData.relatedType === 'Customer' ? formData.customerId : null,
        leadId: formData.relatedType === 'Lead' ? formData.leadId : null
      };

      await api.post('/activities', payload);
      Swal.fire('Logged', 'Activity logged into customer/lead history.', 'success');
      setShowModal(false);
      fetchActivities();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || 'Failed to log activity.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return <i className="bi bi-telephone-fill text-success"></i>;
      case 'Meeting': return <i className="bi bi-people-fill text-primary"></i>;
      case 'Email': return <i className="bi bi-envelope-fill text-warning"></i>;
      case 'Task': return <i className="bi bi-check2-square text-info"></i>;
      default: return <i className="bi bi-clock-history"></i>;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Omnichannel Activity Log</h2>
          <p className="text-muted small mb-0">Record and track calls, meetings, emails, and sales tasks.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={handleOpenModal}>
          <i className="bi bi-plus-lg me-2"></i> Log New Activity
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '10px' }}>
        <div className="d-flex flex-wrap gap-2">
          {['', 'Call', 'Meeting', 'Email', 'Task'].map((type) => (
            <button
              key={type}
              type="button"
              className={`btn btn-sm ${activityType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActivityType(type)}
            >
              {type === '' ? 'All Activities' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Table */}
      <div className="crm-table-card shadow-sm">
        <div className="table-responsive">
          <table className="table crm-table table-hover mb-0">
            <thead>
              <tr>
                <th>Type</th>
                <th>Subject & Description</th>
                <th>Related Record</th>
                <th>Logged By</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading activities...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No activity entries found.</td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act._id}>
                    <td>
                      <span className="badge bg-light text-dark border p-2">
                        {getActivityIcon(act.activityType)} <span className="ms-1">{act.activityType}</span>
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{act.subject}</div>
                      {act.description && <small className="text-muted d-block">{act.description}</small>}
                    </td>
                    <td>
                      {act.customerId ? (
                        <span className="fw-semibold text-primary">{act.customerId.customerName}</span>
                      ) : act.leadId ? (
                        <span className="fw-semibold text-info">{act.leadId.leadName}</span>
                      ) : '—'}
                    </td>
                    <td><small>{act.assignedTo?.name || 'User'}</small></td>
                    <td>
                      <div>{new Date(act.activityDate).toLocaleDateString()}</div>
                      <small className="text-muted">{new Date(act.activityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </td>
                    <td><span className="badge bg-success">{act.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Activity Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">Log Sales Activity</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label">Activity Type</label>
                    <select
                      className="form-select"
                      value={formData.activityType}
                      onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    >
                      <option value="Call">Phone Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Email">Email Communication</option>
                      <option value="Task">Sales Task</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Link To:</label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${formData.relatedType === 'Customer' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFormData({ ...formData, relatedType: 'Customer' })}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        className={`btn ${formData.relatedType === 'Lead' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFormData({ ...formData, relatedType: 'Lead' })}
                      >
                        Lead
                      </button>
                    </div>
                  </div>

                  {formData.relatedType === 'Customer' ? (
                    <div className="mb-3">
                      <label className="form-label">Select Customer</label>
                      <select
                        className="form-select"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      >
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>{c.customerName}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label">Select Lead</label>
                      <select
                        className="form-select"
                        value={formData.leadId}
                        onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                      >
                        {leads.map((l) => (
                          <option key={l._id} value={l._id}>{l.leadName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Subject / Purpose <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Discussed proposal pricing with executive sponsor"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Detailed Notes / Minutes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Key takeaways and next action items..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Log Activity'}
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

export default Activities;
