import React from 'react';
import AppLayout from '../components/layouts/AppLayout';

const DashboardPage = () => {
    // Static data for charts/stats to match prototype
    return (
        <AppLayout>
            <div className="page-content active">
                <div className="page-header">
                    <h1>Dashboard</h1>
                    <p>Your grocery overview for the selected month</p>
                </div>
                <div className="month-selector-row">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Viewing month:</label>
                    <select className="month-selector" id="dash-month" defaultValue="2026-02">
                        <option value="2026-02">February 2026</option>
                        <option value="2026-01">January 2026</option>
                        <option value="2025-12">December 2025</option>
                    </select>
                </div>

                <div className="stats-grid">
                    <div className="stat-card accent">
                        <div className="stat-label">Total Expected</div>
                        <div className="stat-value">47.5</div>
                        <div className="stat-sub">units/month</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Actual</div>
                        <div className="stat-value" style={{ color: '#2d4a22' }}>52.0</div>
                        <div className="stat-sub" style={{ color: '#cc705d', fontWeight: 600 }}>▲ 4.5 over</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Expiring Soon</div>
                        <div className="stat-value" style={{ color: 'var(--sidebar)' }}>2</div>
                        <div className="stat-sub">Within 7 days</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Expired</div>
                        <div className="stat-value" style={{ color: 'var(--sidebar)' }}>1</div>
                        <div className="stat-sub">Remove now</div>
                    </div>
                </div>

                <div className="dash-grid">
                    <div className="card">
                        <div className="chart-title">Expected vs Actual Consumption</div>
                        <div className="chart-bars" id="chart-bars" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                            {/* Placeholder for Chart - Prototype uses JS to render, here we just keep layout */}
                            [Chart Visualization Placeholder]
                        </div>
                        <div className="bar-legend" style={{ marginTop: '18px' }}>
                            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--primary-light)' }}></span>Expected</div>
                            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--primary)' }}></span>Actual</div>
                            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--expired)' }}></span>Over budget</div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="chart-title">⚠️ Alerts</div>
                        <div className="alert alert-warning">
                            <div className="alert-title">Expiring Soon (2)</div>
                            Bread — expires in 3 days<br />Milk — expires in 5 days
                        </div>
                        <div className="alert alert-danger">
                            <div className="alert-title">Expired (1)</div>
                            Yogurt — expired 2 days ago
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <div className="alert" style={{ background: 'var(--primary-xlight)', borderLeft: '4px solid var(--primary)', color: 'var(--muted)' }}>
                                <div className="alert-title" style={{ color: '#2d4a22' }}>💡 Suggestion</div>
                                Eggs — you've exceeded expected by 20% for 2 months. Consider updating your plan.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default DashboardPage;
