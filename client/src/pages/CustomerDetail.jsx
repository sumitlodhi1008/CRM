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
    <div className="container-fluid p-3">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb small mb-1">
          <li className="breadcrumb-item"><Link to="/customers" className="text-decoration-none text-primary">Customers</Link></li>
          <li className="breadcrumb-item active fw-semibold" aria-current="page">{customer.customerName}</li>
        </ol>
      </nav>

      {/* Header Profile Card */}
      <div className="crm-card p-3 mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center">
            <div className="kpi-icon-wrap me-3" style={{ width: '40px', height: '40px', fontSize: '1.15rem' }}>
              <i className="bi bi-building"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="crm-page-title mb-0">{customer.customerName}</h2>
                <span className="badge-pill badge-secondary-soft font-monospace">{customer.customerCode}</span>
                <span className={`badge-pill ${customer.status === 'Active' ? 'badge-primary-soft' : 'badge-secondary-soft'}`}>
                  {customer.status}
                </span>
              </div>
              <div className="crm-subtext mt-1 d-flex flex-wrap gap-3">
                <span>{customer.companyName || 'Individual'}</span>
                <span>{customer.email}</span>
                <span>{customer.phone}</span>
                {customer.city && <span>{customer.city}, {customer.state}</span>}
              </div>
            </div>
          </div>
          <div className="text-end">
            <small className="crm-subtext d-block">Assigned Representative:</small>
            <div className="fw-bold text-primary" style={{ fontSize: '0.875rem' }}>{customer.assignedTo?.name || 'Unassigned'}</div>
          </div>
        </div>
      </div>

      {/* 360 Tabs - Segmented Style */}
      <div className="crm-card p-2 mb-3">
        <div className="crm-segmented-control d-flex flex-nowrap overflow-x-auto w-100">
          {[
            { id: 'opportunities', label: `Opportunities (${customer.opportunities?.length || 0})` },
            { id: 'followups', label: `Follow-Ups (${customer.followUps?.length || 0})` },
            { id: 'activities', label: `Activities (${customer.activities?.length || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`crm-segment-btn flex-shrink-0 ${activeTab === tab.id ? 'active-primary' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="crm-card p-3">
        <div>
          {activeTab === 'opportunities' && (
            <div>
              {customer.opportunities?.length === 0 ? (
                <div className="text-center py-4 text-muted">No opportunities registered.</div>
              ) : (
                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Deal Name</th>
                        <th>Amount ($)</th>
                        <th>Stage</th>
                        <th>Probability</th>
                        <th>Weighted Forecast</th>
                        <th>Expected Close</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.opportunities.map((opp) => (
                        <tr key={opp._id}>
                          <td className="fw-semibold">{opp.opportunityName}</td>
                          <td className="fw-bold">${opp.amount.toLocaleString()}</td>
                          <td><span className="badge-pill badge-primary-soft">{opp.stage}</span></td>
                          <td>{opp.probability}%</td>
                          <td className="fw-bold text-primary">
                            ${((opp.amount * opp.probability) / 100).toLocaleString()}
                          </td>
                          <td><small className="text-secondary">{new Date(opp.expectedCloseDate).toLocaleDateString()}</small></td>
                          <td>
                            <span className={`badge-pill ${opp.status === 'Won' ? 'badge-success-soft' : opp.status === 'Lost' ? 'badge-danger-soft' : 'badge-warning-soft'}`}>
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

          {activeTab === 'followups' && (
            <div>
              {customer.followUps?.length === 0 ? (
                <div className="text-center py-4 text-muted">No follow-ups recorded.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {customer.followUps.map((f) => (
                    <div key={f._id} className="list-group-item d-flex justify-content-between align-items-center py-3 border-bottom">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge-pill badge-secondary-soft">{f.followUpType}</span>
                          <span className="fw-semibold text-dark">{f.subject}</span>
                          {new Date(f.followUpDate) < new Date() && f.status === 'Planned' && (
                            <span className="badge-pill badge-danger-soft">OVERDUE</span>
                          )}
                        </div>
                        {f.remarks && <small className="text-muted d-block mt-1">{f.remarks}</small>}
                      </div>
                      <div className="text-end">
                        <span className={`badge-pill ${f.status === 'Completed' ? 'badge-success-soft' : 'badge-primary-soft'}`}>{f.status}</span>
                        <small className="text-muted d-block mt-1">{new Date(f.followUpDate).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div>
              {customer.activities?.length === 0 ? (
                <div className="text-center py-4 text-muted">No activities logged.</div>
              ) : (
                customer.activities.map((a) => (
                  <div key={a._id} className="border-bottom py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge-pill badge-secondary-soft">{a.activityType}</span>
                        <span className="fw-semibold text-dark">{a.subject}</span>
                      </div>
                      <small className="text-muted">{new Date(a.activityDate).toLocaleString()}</small>
                    </div>
                    {a.description && <p className="text-secondary small mt-2 mb-0">{a.description}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
