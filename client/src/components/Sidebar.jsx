import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { isAdmin, isManager } = useAuth();

  return (
    <div className="crm-sidebar py-3 d-none d-md-block">
      <div className="text-uppercase text-muted px-4 mb-2 small fw-bold">CRM Core</div>
      <ul className="nav flex-column mb-3">
        <li className="nav-item">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-speedometer2"></i> Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-building"></i> Customers
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/leads" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-funnel"></i> Leads
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/opportunities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-briefcase"></i> Opportunities
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/followups" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-calendar-check"></i> Follow-Ups
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/activities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-clock-history"></i> Activities
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-bar-chart-line"></i> Reports
          </NavLink>
        </li>
      </ul>

      {(isAdmin || isManager) && (
        <>
          <div className="text-uppercase text-muted px-4 mb-2 small fw-bold">Governance</div>
          <ul className="nav flex-column">
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-people"></i> User Management
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink to="/audit" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-journal-text"></i> Audit Logs
              </NavLink>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
