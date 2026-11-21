import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Opportunities = () => {
  const { isAdmin } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [formData, setFormData] = useState({
    opportunityName: '',
    customerId: '',
    amount: '',
    stage: 'Qualification',
    probability: 20,
    expectedCloseDate: '',
    source: 'Website',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      let url = `/opportunities?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (stage) url += `&stage=${stage}`;
      if (status) url += `&status=${status}`;

      const res = await api.get(url);
      setOpportunities(res.data.data);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers?limit=100');
      setCustomers(res.data.data);
    } catch (err) {
      console.error('Error fetching customer list:', err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchCustomers();
  }, [page, stage, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  const handleOpenModal = (opp = null) => {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    const defaultDate = today.toISOString().split('T')[0];

    if (opp) {
      setEditingOpp(opp);
      setFormData({
        opportunityName: opp.opportunityName,
        customerId: opp.customerId?._id || opp.customerId,
        amount: opp.amount,
        stage: opp.stage,
        probability: opp.probability,
        expectedCloseDate: opp.expectedCloseDate ? opp.expectedCloseDate.split('T')[0] : defaultDate,
        source: opp.source || 'Website',
        notes: opp.notes || ''
      });
    } else {
      setEditingOpp(null);
      setFormData({
        opportunityName: '',
        customerId: customers[0]?._id || '',
        amount: '',
        stage: 'Qualification',
        probability: 20,
        expectedCloseDate: defaultDate,
        source: 'Website',
        notes: ''
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleStageChange = (newStage) => {
    let prob = formData.probability;
    if (newStage === 'Qualification') prob = 20;
    else if (newStage === 'Proposal') prob = 50;
    else if (newStage === 'Negotiation') prob = 80;
    else if (newStage === 'Won') prob = 100;
    else if (newStage === 'Lost') prob = 0;

    setFormData({ ...formData, stage: newStage, probability: prob });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.opportunityName.trim()) {
      errors.opportunityName = 'Opportunity Name is required.';
    }

    if (!formData.customerId) {
      errors.customerId = 'Associated Customer is required.';
    }

    // Business validation rule 1: Amount must be > 0
    const numAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Opportunity Amount must be greater than 0.';
    }

    // Business validation rule 2: Probability must be 0 to 100
    const numProb = Number(formData.probability);
    if (isNaN(numProb) || numProb < 0 || numProb > 100) {
      errors.probability = 'Probability must be between 0 and 100.';
    }

    // Business validation rule 3: Expected Close Date cannot be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closeDate = new Date(formData.expectedCloseDate);
    if (!formData.expectedCloseDate || closeDate < today) {
      errors.expectedCloseDate = 'Expected Close Date cannot be in the past.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingOpp) {
        await api.put(`/opportunities/${editingOpp._id}`, formData);
        Swal.fire('Success', 'Opportunity details updated successfully.', 'success');
      } else {
        await api.post('/opportunities', formData);
        Swal.fire('Success', 'New Opportunity registered successfully.', 'success');
      }
      setShowModal(false);
      fetchOpportunities();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save opportunity.';
      Swal.fire('Validation Error', msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStageUpdate = async (oppId, targetStage) => {
    try {
      await api.put(`/opportunities/${oppId}`, { stage: targetStage });
      Swal.fire('Stage Updated', `Deal transitioned to ${targetStage}.`, 'success');
      fetchOpportunities();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.detail || 'Failed to update stage.', 'error');
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Opportunity Pipeline Management</h2>
          <p className="text-muted small mb-0">Track active deals, pipeline stages, and weighted revenue forecasting.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle-fill me-2"></i> Register New Opportunity
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '10px' }}>
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search Opportunity name or source..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <select className="form-select" value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }}>
              <option value="">All Pipeline Stages</option>
              <option value="Qualification">Qualification</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Closed Won</option>
              <option value="Lost">Closed Lost</option>
            </select>
          </div>
          <div className="col-12 col-md-4 d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-fill">Apply Filters</button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => { setSearch(''); setStage(''); setStatus(''); setPage(1); fetchOpportunities(); }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Opportunities Table */}
      <div className="crm-table-card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table crm-table table-hover mb-0">
            <thead>
              <tr>
                <th>Deal Name</th>
                <th>Customer Account</th>
                <th>Amount ($)</th>
                <th>Stage</th>
                <th>Probability</th>
                <th>Weighted Value ($)</th>
                <th>Expected Close</th>
                <th>Owner</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading opportunities...
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">No opportunities found.</td>
                </tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp._id}>
                    <td>
                      <div className="fw-semibold text-dark">{opp.opportunityName}</div>
                      <small className="text-muted">Source: {opp.source || 'Direct'}</small>
                    </td>
                    <td>
                      {opp.customerId ? (
                        <Link to={`/customers/${opp.customerId._id}`} className="text-decoration-none fw-semibold">
                          {opp.customerId.customerName}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="fw-bold fs-6">${opp.amount?.toLocaleString()}</td>
                    <td>
                      <select
                        className="form-select form-select-sm fw-semibold"
                        style={{ width: '130px' }}
                        value={opp.stage}
                        onChange={(e) => handleQuickStageUpdate(opp._id, e.target.value)}
                      >
                        <option value="Qualification">Qualification</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2 fw-semibold">{opp.probability}%</span>
                        <div className="progress flex-fill" style={{ height: '6px', width: '50px' }}>
                          <div
                            className={`progress-bar ${opp.probability >= 70 ? 'bg-success' : opp.probability >= 40 ? 'bg-primary' : 'bg-warning'}`}
                            style={{ width: `${opp.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="fw-bold" style={{ color: '#0D9488' }}>
                      ${((opp.amount * opp.probability) / 100).toLocaleString()}
                    </td>
                    <td>
                      <small>{new Date(opp.expectedCloseDate).toLocaleDateString()}</small>
                    </td>
                    <td><small>{opp.assignedTo?.name || 'Unassigned'}</small></td>
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenModal(opp)} title="Edit Deal">
                        <i className="bi bi-pencil"></i>
                      </button>
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

      {/* Register / Edit Opportunity Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  {editingOpp ? `Edit Opportunity: ${editingOpp.opportunityName}` : 'Register New Sales Opportunity'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label">Opportunity Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.opportunityName ? 'is-invalid' : ''}`}
                        placeholder="e.g. Enterprise Cloud Infrastructure Migration"
                        value={formData.opportunityName}
                        onChange={(e) => setFormData({ ...formData, opportunityName: e.target.value })}
                      />
                      {formErrors.opportunityName && <div className="invalid-feedback">{formErrors.opportunityName}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Customer Account <span className="text-danger">*</span></label>
                      <select
                        className={`form-select ${formErrors.customerId ? 'is-invalid' : ''}`}
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      >
                        <option value="">Select Customer...</option>
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>{c.customerName} ({c.customerCode})</option>
                        ))}
                      </select>
                      {formErrors.customerId && <div className="invalid-feedback">{formErrors.customerId}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Deal Amount ($) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className={`form-control ${formErrors.amount ? 'is-invalid' : ''}`}
                        placeholder="Must be > 0"
                        min="1"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                      {formErrors.amount && <div className="invalid-feedback">{formErrors.amount}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Pipeline Stage</label>
                      <select
                        className="form-select"
                        value={formData.stage}
                        onChange={(e) => handleStageChange(e.target.value)}
                      >
                        <option value="Qualification">Qualification (20%)</option>
                        <option value="Proposal">Proposal (50%)</option>
                        <option value="Negotiation">Negotiation (80%)</option>
                        <option value="Won">Closed Won (100%)</option>
                        <option value="Lost">Closed Lost (0%)</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Probability (0 - 100%)</label>
                      <input
                        type="number"
                        className={`form-control ${formErrors.probability ? 'is-invalid' : ''}`}
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                      />
                      {formErrors.probability && <div className="invalid-feedback">{formErrors.probability}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Expected Close Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className={`form-control ${formErrors.expectedCloseDate ? 'is-invalid' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.expectedCloseDate}
                        onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                      />
                      {formErrors.expectedCloseDate && <div className="invalid-feedback">{formErrors.expectedCloseDate}</div>}
                      <small className="text-muted">Cannot be set in the past for active opportunities.</small>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Deal Source</label>
                      <select
                        className="form-select"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      >
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Partner">Partner</option>
                        <option value="Existing Client">Existing Client</option>
                      </select>
                    </div>

                    {formData.amount > 0 && (
                      <div className="col-12">
                        <div className="alert alert-info py-2 mb-0 d-flex justify-content-between align-items-center">
                          <span>Derived Weighted Pipeline Calculation:</span>
                          <strong className="fs-6">${((Number(formData.amount) * Number(formData.probability)) / 100).toLocaleString()}</strong>
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label">Opportunity Notes / Scope Summary</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingOpp ? 'Update Opportunity' : 'Save Opportunity'}
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

export default Opportunities;
