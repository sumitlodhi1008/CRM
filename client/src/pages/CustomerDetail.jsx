import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/customers/${id}`);
        setCustomer(res.data.data);
      } catch (err) {
        console.error('Error fetching customer 360:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container p-4">
        <div className="alert alert-warning">Customer record not found.</div>
        <Link to="/customers" className="btn btn-primary">Back to Customers</Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/customers">Customers</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{customer.customerName}</li>
        </ol>
      </nav>

      {/* Header Profile Banner */}
      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center">
            <div className="kpi-icon bg-primary bg-opacity-10 text-primary me-3 fs-3" style={{ width: '60px', height: '60px' }}>
              <i className="bi bi-building"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h3 className="fw-bold mb-0">{customer.customerName}</h3>
                <span className="badge bg-light text-dark font-monospace">{customer.customerCode}</span>
                <span className={`badge ${customer.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                  {customer.status}
                </span>
              </div>
              <div className="text-muted mt-1">
                <span className="me-3"><i className="bi bi-briefcase me-1"></i>{customer.companyName || 'No Company'}</span>
                <span className="me-3"><i className="bi bi-envelope me-1"></i>{customer.email}</span>
                <span className="me-3"><i className="bi bi-telephone me-1"></i>{customer.phone}</span>
                {customer.city && <span><i className="bi bi-geo-alt me-1"></i>{customer.city}, {customer.state}</span>}
              </div>
            </div>
          </div>
          <div className="text-end">
            <small className="text-muted d-block">Assigned Representative:</small>
            <div className="fw-semibold text-primary">{customer.assignedTo?.name || 'Unassigned'}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation for 360 View */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-header bg-white border-bottom p-0">
          <ul className="nav nav-tabs border-0 px-3 pt-2">
            <li className="nav-item">
              <button
                className={`nav-link border-0 pb-3 fw-semibold ${activeTab === 'opportunities' ? 'active border-bottom border-primary border-3 text-primary' : 'text-muted'}`}
                onClick={() => setActiveTab('opportunities')}
              >
                <i className="bi bi-briefcase me-2"></i>Opportunities ({customer.opportunities?.length || 0})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 pb-3 fw-semibold ${activeTab === 'followups' ? 'active border-bottom border-primary border-3 text-primary' : 'text-muted'}`}
                onClick={() => setActiveTab('followups')}
              >
                <i className="bi bi-calendar-check me-2"></i>Follow-Ups ({customer.followUps?.length || 0})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 pb-3 fw-semibold ${activeTab === 'activities' ? 'active border-bottom border-primary border-3 text-primary' : 'text-muted'}`}
                onClick={() => setActiveTab('activities')}
              >
                <i className="bi bi-clock-history me-2"></i>Activity History ({customer.activities?.length || 0})
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">
          {/* TAB 1: Opportunities */}
          {activeTab === 'opportunities' && (
            <div>
              {customer.opportunities?.length === 0 ? (
                <div className="text-center py-4 text-muted">No opportunities linked to this customer yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Opportunity Name</th>
                        <th>Amount ($)</th>
                        <th>Stage</th>
                        <th>Probability</th>
                        <th>Weighted Value</th>
                        <th>Expected Close</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.opportunities.map((opp) => (
                        <tr key={opp._id}>
                          <td className="fw-semibold">{opp.opportunityName}</td>
                          <td className="fw-bold">${opp.amount.toLocaleString()}</td>
                          <td><span className="badge bg-primary">{opp.stage}</span></td>
                          <td>{opp.probability}%</td>
                          <td className="text-teal" style={{ color: '#0D9488' }}>
                            ${((opp.amount * opp.probability) / 100).toLocaleString()}
                          </td>
                          <td><small>{new Date(opp.expectedCloseDate).toLocaleDateString()}</small></td>
                          <td>
                            <span className={`badge ${opp.status === 'Won' ? 'bg-success' : opp.status === 'Lost' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                              {opp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Follow-Ups */}
          {activeTab === 'followups' && (
            <div>
              {customer.followUps?.length === 0 ? (
                <div className="text-center py-4 text-muted">No follow-ups recorded for this customer.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {customer.followUps.map((f) => (
                    <div key={f._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-secondary">{f.followUpType}</span>
                          <span className="fw-semibold">{f.subject}</span>
                          {new Date(f.followUpDate) < new Date() && f.status === 'Planned' && (
                            <span className="badge bg-danger badge-pulse">OVERDUE</span>
                          )}
                        </div>
                        {f.remarks && <small className="text-muted d-block mt-1">{f.remarks}</small>}
                      </div>
                      <div className="text-end">
                        <span className={`badge ${f.status === 'Completed' ? 'bg-success' : 'bg-info'}`}>{f.status}</span>
                        <small className="text-muted d-block mt-1">{new Date(f.followUpDate).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Activities */}
          {activeTab === 'activities' && (
            <div>
              {customer.activities?.length === 0 ? (
                <div className="text-center py-4 text-muted">No sales activities logged yet.</div>
              ) : (
                <div className="timeline">
                  {customer.activities.map((a) => (
                    <div key={a._id} className="border-bottom py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-dark">{a.activityType}</span>
                          <span className="fw-semibold">{a.subject}</span>
                        </div>
                        <small className="text-muted">{new Date(a.activityDate).toLocaleString()}</small>
                      </div>
                      {a.description && <p className="text-muted small mt-2 mb-0">{a.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
