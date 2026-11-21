import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Leads = () => {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    leadName: '',
    email: '',
    phone: '',
    companyName: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    expectedValue: 0,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Conversion modal state
  const [convertModal, setConvertModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);
  const [convertData, setConvertData] = useState({
    opportunityName: '',
    amount: 0,
    expectedCloseDate: ''
  });
  const [converting, setConverting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let url = `/leads?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;
      if (priority) url += `&priority=${priority}`;

      const res = await api.get(url);
      setLeads(res.data.data);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, status, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleOpenModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        leadName: lead.leadName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName || '',
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        expectedValue: lead.expectedValue,
        notes: lead.notes || ''
      });
    } else {
      setEditingLead(null);
      setFormData({
        leadName: '',
        email: '',
        phone: '',
        companyName: '',
        source: 'Website',
        status: 'New',
        priority: 'Medium',
        expectedValue: 0,
        notes: ''
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.leadName.trim()) errors.leadName = 'Lead Name is required.';

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid phone number (10 digits).';
    }

    if (formData.expectedValue < 0) {
      errors.expectedValue = 'Expected value cannot be negative.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, formData);
        Swal.fire('Success', 'Lead details updated successfully.', 'success');
      } else {
        await api.post('/leads', formData);
        Swal.fire('Success', 'New Lead captured successfully.', 'success');
      }
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save lead.';
      Swal.fire('Validation Error', msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenConvert = (lead) => {
    setConvertingLead(lead);
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
    setConvertData({
      opportunityName: `${lead.companyName || lead.leadName} - Deal`,
      amount: lead.expectedValue > 0 ? lead.expectedValue : 15000,
      expectedCloseDate: thirtyDaysAhead.toISOString().split('T')[0]
    });
    setConvertModal(true);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setConverting(true);
    try {
      const res = await api.post(`/leads/${convertingLead._id}/convert`, convertData);
      Swal.fire({
        title: 'Lead Converted!',
        html: `Successfully created Customer and Opportunity Deal.<br><b>Customer Code:</b> ${res.data.data.customerCode}`,
        icon: 'success'
      });
      setConvertModal(false);
      fetchLeads();
    } catch (err) {
      Swal.fire('Conversion Error', err.response?.data?.detail || 'Failed to convert lead.', 'error');
    } finally {
      setConverting(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'New': return <span className="badge bg-primary">New</span>;
      case 'Contacted': return <span className="badge bg-warning text-dark">Contacted</span>;
      case 'Qualified': return <span className="badge bg-success">Qualified</span>;
      case 'Unqualified': return <span className="badge bg-secondary">Unqualified</span>;
      case 'Converted': return <span className="badge bg-purple" style={{ backgroundColor: '#6366F1' }}>Converted</span>;
      case 'Lost': return <span className="badge bg-danger">Lost</span>;
      default: return <span className="badge bg-light text-dark">{st}</span>;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Lead Management</h2>
          <p className="text-muted small mb-0">Capture, qualify, and convert sales prospects into paying clients.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={() => handleOpenModal()}>
          <i className="bi bi-funnel-fill me-2"></i> Capture New Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '10px' }}>
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search Lead, Company, Email, Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Unqualified">Unqualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="col-12 col-md-2">
            <select className="form-select" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div className="col-12 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-fill">Filter</button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => { setSearch(''); setStatus(''); setPriority(''); setPage(1); fetchLeads(); }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Leads Table */}
      <div className="crm-table-card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table crm-table table-hover mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Lead Name</th>
                <th>Company</th>
                <th>Source</th>
                <th>Expected Value</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">No leads found.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td><span className="badge bg-light text-dark font-monospace">{lead.leadCode}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{lead.leadName}</div>
                      <small className="text-muted">{lead.email} | {lead.phone}</small>
                    </td>
                    <td>{lead.companyName || '—'}</td>
                    <td><span className="badge bg-light text-secondary">{lead.source}</span></td>
                    <td className="fw-bold">${lead.expectedValue?.toLocaleString()}</td>
                    <td>{getStatusBadge(lead.status)}</td>
                    <td>
                      <span className={`badge ${lead.priority === 'Urgent' ? 'bg-danger' : lead.priority === 'High' ? 'bg-warning text-dark' : 'bg-info'}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td><small>{lead.assignedTo?.name || 'Unassigned'}</small></td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {lead.status !== 'Converted' && (
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleOpenConvert(lead)}
                            title="Convert to Customer & Deal"
                          >
                            <i className="bi bi-arrow-repeat me-1"></i> Convert
                          </button>
                        )}
                        <button className="btn btn-outline-primary" onClick={() => handleOpenModal(lead)} title="Edit Lead">
                          <i className="bi bi-pencil"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 d-flex justify-content-between align-items-center border-top">
            <span className="small text-muted">Page {page} of {totalPages}</span>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </button>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Capture / Edit Lead Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  {editingLead ? `Edit Lead (${editingLead.leadCode})` : 'Capture New Prospective Lead'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Lead Contact Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.leadName ? 'is-invalid' : ''}`}
                        placeholder="John Doe"
                        value={formData.leadName}
                        onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                      />
                      {formErrors.leadName && <div className="invalid-feedback">{formErrors.leadName}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Company / Organization</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Company name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        placeholder="lead@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone Number (10 digits) <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Acquisition Source <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      >
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Partner">Partner</option>
                        <option value="Campaign">Campaign</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Lead Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Expected Deal Value ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.expectedValue}
                        onChange={(e) => setFormData({ ...formData, expectedValue: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Notes / Requirements</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Prospect requirement summary..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingLead ? 'Update Lead' : 'Save Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Convert Lead to Customer & Opportunity Modal */}
      {convertModal && convertingLead && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-arrow-repeat me-2"></i>Convert Lead to Customer & Deal
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setConvertModal(false)}></button>
              </div>
              <form onSubmit={handleConvertSubmit}>
                <div className="modal-body p-4">
                  <p className="small text-muted">
                    This atomic transaction will create a new <strong>Customer Master</strong> record from lead contact details, register a new <strong>Sales Opportunity</strong>, and mark this lead as <strong>Converted</strong>.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Opportunity Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={convertData.opportunityName}
                      onChange={(e) => setConvertData({ ...convertData, opportunityName: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Initial Opportunity Amount ($) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      required
                      value={convertData.amount}
                      onChange={(e) => setConvertData({ ...convertData, amount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Expected Close Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={convertData.expectedCloseDate}
                      onChange={(e) => setConvertData({ ...convertData, expectedCloseDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setConvertModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success" disabled={converting}>
                    {converting ? 'Converting...' : 'Execute Conversion'}
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

export default Leads;
