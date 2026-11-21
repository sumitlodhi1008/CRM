import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('pipeline');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (reportType) => {
    try {
      setLoading(true);
      if (reportType === 'pipeline') {
        const res = await api.get('/reports/pipeline');
        setReportData(res.data);
      } else if (reportType === 'customers') {
        const res = await api.get('/customers?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'leads') {
        const res = await api.get('/leads?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'opportunities') {
        const res = await api.get('/opportunities?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'followups') {
        const res = await api.get('/followups?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'activities') {
        const res = await api.get('/activities?limit=100');
        setReportData(res.data.data);
      } else if (reportType === 'conversion') {
        const [lRes, oRes] = await Promise.all([
          api.get('/leads?limit=200'),
          api.get('/opportunities?limit=200')
        ]);
        const allLeads = lRes.data.data;
        const convertedCount = allLeads.filter(l => l.status === 'Converted').length;
        const totalLeads = allLeads.length;
        const convRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : 0;

        const allOpps = oRes.data.data;
        const wonCount = allOpps.filter(o => o.status === 'Won').length;
        const lostCount = allOpps.filter(o => o.status === 'Lost').length;
        const totalOpps = allOpps.length;
        const winRate = (wonCount + lostCount) > 0 ? ((wonCount / (wonCount + lostCount)) * 100).toFixed(1) : 0;

        setReportData({
          totalLeads,
          convertedCount,
          convRate,
          totalOpps,
          wonCount,
          lostCount,
          winRate
        });
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport]);

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReport === 'customers') {
      csvContent += 'Customer Code,Name,Company,Email,Phone,Status,Created Date\n';
      reportData.forEach(c => {
        csvContent += `"${c.customerCode}","${c.customerName}","${c.companyName || ''}","${c.email}","${c.phone}","${c.status}","${new Date(c.createdAt).toLocaleDateString()}"\n`;
      });
    } else if (activeReport === 'leads') {
      csvContent += 'Lead Code,Name,Company,Source,Expected Value,Status,Priority\n';
      reportData.forEach(l => {
        csvContent += `"${l.leadCode}","${l.leadName}","${l.companyName || ''}","${l.source}","${l.expectedValue}","${l.status}","${l.priority}"\n`;
      });
    } else if (activeReport === 'opportunities') {
      csvContent += 'Deal Name,Amount,Stage,Probability,Weighted Value,Expected Close Date,Status\n';
      reportData.forEach(o => {
        const weighted = (o.amount * o.probability) / 100;
        csvContent += `"${o.opportunityName}","${o.amount}","${o.stage}","${o.probability}","${weighted}","${new Date(o.expectedCloseDate).toLocaleDateString()}","${o.status}"\n`;
      });
    } else if (activeReport === 'pipeline') {
      csvContent += 'Stage,Deal Count,Total Pipeline Amount ($),Weighted Amount ($)\n';
      reportData.stageSummary?.forEach(s => {
        csvContent += `"${s._id}","${s.totalDeals}","${s.totalAmount}","${s.weightedAmount}"\n`;
      });
    } else {
      csvContent += JSON.stringify(reportData);
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AcxiomCRM_${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Analytical Reports Engine</h2>
          <p className="text-muted small mb-0">Cross-cutting business intelligence, pipeline forecasting, and sales performance reports.</p>
        </div>
        <button className="btn btn-outline-success d-flex align-items-center" onClick={exportToCSV}>
          <i className="bi bi-file-earmark-excel me-2"></i> Export Report to CSV
        </button>
      </div>

      {/* 8 Report Switcher Tabs */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '10px' }}>
        <div className="d-flex flex-wrap gap-2">
          {[
            { id: 'pipeline', label: '1. Pipeline Report', icon: 'bi-bar-chart' },
            { id: 'customers', label: '2. Customer Report', icon: 'bi-building' },
            { id: 'leads', label: '3. Lead Report', icon: 'bi-funnel' },
            { id: 'opportunities', label: '4. Opportunity Report', icon: 'bi-briefcase' },
            { id: 'followups', label: '5. Follow-Up Report', icon: 'bi-calendar-check' },
            { id: 'conversion', label: '6. Sales & Conversion Report', icon: 'bi-arrow-repeat' },
            { id: 'activities', label: '7. User Activity Report', icon: 'bi-clock-history' }
          ].map(r => (
            <button
              key={r.id}
              className={`btn btn-sm ${activeReport === r.id ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveReport(r.id)}
            >
              <i className={`bi ${r.icon} me-1`}></i> {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content Stage */}
      <div className="crm-table-card shadow-sm p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted">Compiling report data...</div>
          </div>
        ) : (
          <div>
            {/* 1. PIPELINE REPORT */}
            {activeReport === 'pipeline' && reportData && (
              <div>
                <h5 className="fw-bold mb-3">Stage-Wise Pipeline Breakdown</h5>
                <div className="table-responsive mb-4">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Pipeline Stage</th>
                        <th>Deals Count</th>
                        <th>Unweighted Pipeline Value ($)</th>
                        <th>Weighted Forecast Value ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.stageSummary?.map(s => (
                        <tr key={s._id}>
                          <td><span className="badge bg-primary">{s._id}</span></td>
                          <td className="fw-semibold">{s.totalDeals}</td>
                          <td className="fw-bold">${s.totalAmount?.toLocaleString()}</td>
                          <td className="fw-bold text-teal" style={{ color: '#0D9488' }}>
                            ${Math.round(s.weightedAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h5 className="fw-bold mb-3 mt-4">Owner-Wise Pipeline Allocation</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Sales Representative</th>
                        <th>Deals Count</th>
                        <th>Total Pipeline Value ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.ownerSummary?.map(o => (
                        <tr key={o.ownerId || 'unassigned'}>
                          <td className="fw-semibold">{o.ownerName || 'Unassigned'}</td>
                          <td>{o.totalDeals}</td>
                          <td className="fw-bold">${o.totalAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. CUSTOMER REPORT */}
            {activeReport === 'customers' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Customer Code</th>
                      <th>Customer Name</th>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(c => (
                      <tr key={c._id}>
                        <td><span className="badge bg-light text-dark font-monospace">{c.customerCode}</span></td>
                        <td className="fw-semibold">{c.customerName}</td>
                        <td>{c.companyName || '—'}</td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td><span className={`badge ${c.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{c.status}</span></td>
                        <td><small>{new Date(c.createdAt).toLocaleDateString()}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. LEAD REPORT */}
            {activeReport === 'leads' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Lead Code</th>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Source</th>
                      <th>Expected Value</th>
                      <th>Status</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(l => (
                      <tr key={l._id}>
                        <td><span className="badge bg-light text-dark font-monospace">{l.leadCode}</span></td>
                        <td className="fw-semibold">{l.leadName}</td>
                        <td>{l.companyName || '—'}</td>
                        <td>{l.source}</td>
                        <td className="fw-bold">${l.expectedValue?.toLocaleString()}</td>
                        <td><span className="badge bg-primary">{l.status}</span></td>
                        <td><span className="badge bg-info">{l.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. OPPORTUNITY REPORT */}
            {activeReport === 'opportunities' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Opportunity Name</th>
                      <th>Customer</th>
                      <th>Amount ($)</th>
                      <th>Stage</th>
                      <th>Probability</th>
                      <th>Weighted Value ($)</th>
                      <th>Expected Close Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(o => (
                      <tr key={o._id}>
                        <td className="fw-semibold">{o.opportunityName}</td>
                        <td>{o.customerId?.customerName || '—'}</td>
                        <td className="fw-bold">${o.amount?.toLocaleString()}</td>
                        <td><span className="badge bg-primary">{o.stage}</span></td>
                        <td>{o.probability}%</td>
                        <td className="fw-bold text-teal" style={{ color: '#0D9488' }}>
                          ${((o.amount * o.probability) / 100).toLocaleString()}
                        </td>
                        <td><small>{new Date(o.expectedCloseDate).toLocaleDateString()}</small></td>
                        <td><span className="badge bg-secondary">{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. FOLLOW-UP REPORT */}
            {activeReport === 'followups' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Scheduled Date</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Remarks</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(f => (
                      <tr key={f._id}>
                        <td>{new Date(f.followUpDate).toLocaleString()}</td>
                        <td><span className="badge bg-light text-dark border">{f.followUpType}</span></td>
                        <td className="fw-semibold">{f.subject}</td>
                        <td><small className="text-muted">{f.remarks || '—'}</small></td>
                        <td>{f.assignedTo?.name || 'Unassigned'}</td>
                        <td><span className="badge bg-info">{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. CONVERSION & WIN/LOSS REPORT */}
            {activeReport === 'conversion' && reportData && (
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div className="card p-4 border bg-light h-100">
                    <h5 className="fw-bold text-primary mb-3">Lead-to-Customer Conversion Efficiency</h5>
                    <div className="display-4 fw-bold text-success mb-2">{reportData.convRate}%</div>
                    <p className="text-muted">
                      <strong>{reportData.convertedCount}</strong> leads successfully converted out of <strong>{reportData.totalLeads}</strong> total captured prospects.
                    </p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card p-4 border bg-light h-100">
                    <h5 className="fw-bold text-primary mb-3">Opportunity Win Ratio (Win vs. Loss)</h5>
                    <div className="display-4 fw-bold text-primary mb-2">{reportData.winRate}%</div>
                    <p className="text-muted">
                      <strong>{reportData.wonCount}</strong> deals Closed-Won vs. <strong>{reportData.lostCount}</strong> deals Closed-Lost.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. ACTIVITY REPORT */}
            {activeReport === 'activities' && Array.isArray(reportData) && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Activity Date</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Description</th>
                      <th>Logged By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(a => (
                      <tr key={a._id}>
                        <td>{new Date(a.activityDate).toLocaleString()}</td>
                        <td><span className="badge bg-dark">{a.activityType}</span></td>
                        <td className="fw-semibold">{a.subject}</td>
                        <td><small className="text-muted">{a.description || '—'}</small></td>
                        <td>{a.assignedTo?.name || 'User'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
