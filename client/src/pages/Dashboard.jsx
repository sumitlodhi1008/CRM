import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [timeRange, setTimeRange] = useState('ThisMonth');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/dashboard?timeRange=${timeRange}`);
      setKpis(res.data.kpis);
      setCharts(res.data.charts);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  if (loading && !kpis) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // 1. Lead Status Doughnut Chart Data
  const leadStatusData = {
    labels: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'],
    datasets: [
      {
        data: [
          charts?.leadStatus?.New || 0,
          charts?.leadStatus?.Contacted || 0,
          charts?.leadStatus?.Qualified || 0,
          charts?.leadStatus?.Unqualified || 0,
          charts?.leadStatus?.Converted || 0,
          charts?.leadStatus?.Lost || 0
        ],
        backgroundColor: [
          '#3B82F6', // Blue (New)
          '#F59E0B', // Amber (Contacted)
          '#10B981', // Emerald (Qualified)
          '#94A3B8', // Gray (Unqualified)
          '#6366F1', // Indigo (Converted)
          '#EF4444'  // Red (Lost)
        ],
        borderWidth: 2
      }
    ]
  };

  // 2. Opportunity Pipeline Bar Chart Data
  const pipelineData = {
    labels: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    datasets: [
      {
        label: 'Pipeline Monetary Value ($)',
        data: [
          charts?.opportunityPipeline?.Qualification?.amount || 0,
          charts?.opportunityPipeline?.Proposal?.amount || 0,
          charts?.opportunityPipeline?.Negotiation?.amount || 0,
          charts?.opportunityPipeline?.Won?.amount || 0,
          charts?.opportunityPipeline?.Lost?.amount || 0
        ],
        backgroundColor: '#1E3A8A'
      }
    ]
  };

  // 3. Monthly Sales Line/Bar Chart Data
  const monthlySalesData = {
    labels: charts?.monthlySales?.map(m => m.month) || [],
    datasets: [
      {
        label: 'Monthly Closed Won Revenue ($)',
        data: charts?.monthlySales?.map(m => m.totalSales) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  return (
    <div className="container-fluid p-4">
      {/* Header & Date Filter Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Executive Sales Dashboard</h2>
          <p className="text-muted small mb-0">
            Welcome back, <strong>{user?.name}</strong>. Here is your authorized pipeline performance summary.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted fw-semibold">Filter:</span>
          <div className="btn-group" role="group">
            {['Today', 'ThisWeek', 'ThisMonth'].map((range) => (
              <button
                key={range}
                type="button"
                className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setTimeRange(range)}
              >
                {range === 'Today' ? 'Today' : range === 'ThisWeek' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 8 Mandatory KPI Cards */}
      <div className="row g-3 mb-4">
        {/* Total Customers */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">TOTAL CUSTOMERS</div>
              <div className="fs-3 fw-bold text-dark">{kpis?.totalCustomers ?? 0}</div>
              <small className="text-success"><i className="bi bi-people-fill me-1"></i>Master Accounts</small>
            </div>
            <div className="kpi-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-building"></i>
            </div>
          </div>
        </div>

        {/* Total Leads */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">TOTAL LEADS</div>
              <div className="fs-3 fw-bold text-dark">{kpis?.totalLeads ?? 0}</div>
              <small className="text-info"><i className="bi bi-funnel-fill me-1"></i>Prospects Captured</small>
            </div>
            <div className="kpi-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-funnel"></i>
            </div>
          </div>
        </div>

        {/* Open Leads */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">OPEN LEADS</div>
              <div className="fs-3 fw-bold text-warning">{kpis?.openLeads ?? 0}</div>
              <small className="text-muted">In Active Funnel</small>
            </div>
            <div className="kpi-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
        </div>

        {/* Total Opportunities */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">OPPORTUNITIES</div>
              <div className="fs-3 fw-bold text-dark">{kpis?.totalOpportunities ?? 0}</div>
              <small className="text-muted">{kpis?.openOpportunities ?? 0} Currently Open</small>
            </div>
            <div className="kpi-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-briefcase"></i>
            </div>
          </div>
        </div>

        {/* Won Opportunities */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">WON DEALS</div>
              <div className="fs-3 fw-bold text-success">{kpis?.wonOpportunities ?? 0}</div>
              <small className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i>Closed-Won</small>
            </div>
            <div className="kpi-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-trophy"></i>
            </div>
          </div>
        </div>

        {/* Lost Opportunities */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">LOST DEALS</div>
              <div className="fs-3 fw-bold text-danger">{kpis?.lostOpportunities ?? 0}</div>
              <small className="text-muted">Closed-Lost</small>
            </div>
            <div className="kpi-icon bg-danger bg-opacity-10 text-danger">
              <i className="bi bi-x-circle"></i>
            </div>
          </div>
        </div>

        {/* Total Pipeline Value */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">TOTAL PIPELINE VALUE</div>
              <div className="fs-3 fw-bold text-dark">
                ${(kpis?.totalPipelineValue || 0).toLocaleString()}
              </div>
              <small className="text-primary fw-semibold">Unweighted Active Deals</small>
            </div>
            <div className="kpi-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-currency-dollar"></i>
            </div>
          </div>
        </div>

        {/* Weighted Pipeline Value */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">WEIGHTED PIPELINE</div>
              <div className="fs-3 fw-bold text-teal" style={{ color: '#0D9488' }}>
                ${(kpis?.totalWeightedPipeline || 0).toLocaleString()}
              </div>
              <small className="text-muted">Calculated: Amount × Prob / 100</small>
            </div>
            <div className="kpi-icon bg-teal bg-opacity-10" style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', color: '#0D9488' }}>
              <i className="bi bi-calculator"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Chart.js Analytics (Section 17.12) */}
      <div className="row g-4 mb-4">
        {/* Lead Status Distribution (Doughnut) */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '10px' }}>
            <h6 className="fw-bold mb-3"><i className="bi bi-pie-chart-fill me-2 text-primary"></i>Lead Status Breakdown</h6>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '260px' }}>
              <Doughnut data={leadStatusData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        {/* Opportunity Pipeline Stages (Bar) */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '10px' }}>
            <h6 className="fw-bold mb-3"><i className="bi bi-bar-chart-fill me-2 text-primary"></i>Opportunity Pipeline Stages ($)</h6>
            <div style={{ height: '260px' }}>
              <Bar data={pipelineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Monthly Sales Revenue Trend */}
        <div className="col-12">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '10px' }}>
            <h6 className="fw-bold mb-3"><i className="bi bi-graph-up me-2 text-success"></i>Monthly Closed-Won Sales Performance ({new Date().getFullYear()})</h6>
            <div style={{ height: '240px' }}>
              <Line data={monthlySalesData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
