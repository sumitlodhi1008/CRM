import React, { useState, useEffect } from 'react';
import api from '../api/client';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [entityName, setEntityName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Snapshot Diff Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      let url = `/audit?page=${page}&limit=15`;
      if (action) url += `&action=${action}`;
      if (entityName) url += `&entityName=${entityName}`;

      const res = await api.get(url);
      setLogs(res.data.data);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, action, entityName]);

  const getActionBadge = (act) => {
    switch (act) {
      case 'Create': return <span className="badge bg-success">Create</span>;
      case 'Update': return <span className="badge bg-primary">Update</span>;
      case 'Delete': return <span className="badge bg-danger">Delete</span>;
      case 'Login': return <span className="badge bg-info text-dark">Login</span>;
      case 'Logout': return <span className="badge bg-secondary">Logout</span>;
      case 'FailedLogin': return <span className="badge bg-warning text-dark">Failed Login</span>;
      case 'Lockout': return <span className="badge bg-danger badge-pulse">Lockout</span>;
      default: return <span className="badge bg-light text-dark">{act}</span>;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">System Security & Business Audit Trail</h2>
          <p className="text-muted small mb-0">Immutable, append-only ledger tracking all authentication, data mutations, and administrative events.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '10px' }}>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <select className="form-select" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
              <option value="">All Action Types</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
              <option value="FailedLogin">Failed Login</option>
              <option value="Lockout">Lockout</option>
            </select>
          </div>
          <div className="col-12 col-md-4">
            <select className="form-select" value={entityName} onChange={(e) => { setEntityName(e.target.value); setPage(1); }}>
              <option value="">All Entities / Modules</option>
              <option value="Customer">Customer</option>
              <option value="Lead">Lead</option>
              <option value="Opportunity">Opportunity</option>
              <option value="FollowUp">FollowUp</option>
              <option value="Activity">Activity</option>
              <option value="User">User</option>
              <option value="Authentication">Authentication</option>
            </select>
          </div>
          <div className="col-12 col-md-4">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => { setAction(''); setEntityName(''); setPage(1); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="crm-table-card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table crm-table table-hover mb-0">
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Action</th>
                <th>Entity Module</th>
                <th>User / Initiator</th>
                <th>IP Address</th>
                <th>Details</th>
                <th className="text-end">Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No audit entries found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <small className="font-monospace">
                        {new Date(log.createdAt).toLocaleString()}
                      </small>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td><span className="badge bg-light text-dark border">{log.entityName}</span></td>
                    <td>
                      {log.userId ? (
                        <div>
                          <div className="fw-semibold small">{log.userId.name}</div>
                          <small className="text-muted">{log.userId.email}</small>
                        </div>
                      ) : (
                        <small className="text-muted">System / Anonymous</small>
                      )}
                    </td>
                    <td><small className="font-monospace text-muted">{log.ipAddress || '127.0.0.1'}</small></td>
                    <td><small className="text-dark">{log.details || '—'}</small></td>
                    <td className="text-end">
                      {(log.oldValue || log.newValue) && (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <i className="bi bi-file-earmark-code me-1"></i> Diff
                        </button>
                      )}
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

      {/* Snapshot Diff Modal */}
      {selectedLog && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title font-monospace">Audit Snapshot: {selectedLog.action} on {selectedLog.entityName}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedLog(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  {selectedLog.oldValue && (
                    <div className="col-12 col-md-6">
                      <h6 className="fw-bold text-danger"><i className="bi bi-dash-circle me-1"></i> Pre-Change (Old Value)</h6>
                      <pre className="bg-light p-3 border rounded small font-monospace" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {JSON.stringify(selectedLog.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newValue && (
                    <div className={`col-12 ${selectedLog.oldValue ? 'col-md-6' : 'col-12'}`}>
                      <h6 className="fw-bold text-success"><i className="bi bi-plus-circle me-1"></i> Post-Change (New Value)</h6>
                      <pre className="bg-light p-3 border rounded small font-monospace" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {JSON.stringify(selectedLog.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
