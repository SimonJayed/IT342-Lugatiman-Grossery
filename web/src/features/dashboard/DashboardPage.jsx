import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/AppLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [expiringSoon, setExpiringSoon] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [comparisonRes, expiringRes] = await Promise.all([
                    api.get('/dashboard/comparison'),
                    api.get('/groceries/expiring-soon')
                ]);

                if (comparisonRes.data.success) {
                    setDashboardData(comparisonRes.data.data);
                }
                if (expiringRes.data.success) {
                    setExpiringSoon(expiringRes.data.data);
                }
            } catch (error) {
                addToast('Failed to load dashboard data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const totalExpected = dashboardData?.items?.reduce((sum, item) => sum + item.expected, 0) || 0;
    const totalActual = dashboardData?.items?.reduce((sum, item) => sum + (item.actual || 0), 0) || 0;
    const totalVariance = totalActual - totalExpected;

    const expiredItems = expiringSoon.filter(item => {
        if (!item.expirationDate) return false;
        return new Date(item.expirationDate) < new Date();
    });
    
    const soonExpiring = expiringSoon.filter(item => {
        if (!item.expirationDate) return false;
        const diff = new Date(item.expirationDate) - new Date();
        return diff > 0 && diff < (3 * 24 * 60 * 60 * 1000); // 3 days
    });

    return (
        <AppLayout>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Your grocery overview for the selected month</p>
            </div>

            <div className="month-selector-row">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Viewing period:</label>
                <div className="month-selector">
                    {dashboardData?.month || 'Current'} {dashboardData?.year || ''}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card accent">
                    <div className="stat-label">TOTAL EXPECTED</div>
                    <div className="stat-value">{totalExpected.toFixed(1)}</div>
                    <div className="stat-sub">units/month</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">MONTHLY VARIANCE</div>
                    <div className="stat-value" style={{ color: totalVariance > 0 ? 'var(--expired)' : 'var(--primary-dark)' }}>
                        {totalVariance > 0 ? '+' : ''}{totalVariance.toFixed(1)}
                    </div>
                    <div className="stat-sub">Units relative to goal</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">EXPIRING SOON</div>
                    <div className="stat-value" style={{ color: '#e8a838' }}>{soonExpiring.length}</div>
                    <div className="stat-sub">Within next 3 days</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">EXPIRED ITEMS</div>
                    <div className="stat-value" style={{ color: 'var(--expired)' }}>{expiredItems.length}</div>
                    <div className="stat-sub">Action required</div>
                </div>
            </div>

            <div className="dash-grid">
                <div className="card">
                    <div className="chart-title">EXPECTED VS ACTUAL CONSUMPTION</div>
                    <div className="chart-bars">
                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>Loading chart...</p>
                        ) : !dashboardData?.items || dashboardData.items.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No data to display. Start logging consumption!</p>
                        ) : (
                            dashboardData.items.map((item, idx) => {
                                const maxVal = Math.max(item.expected, item.actual || 0);
                                const expectedWidth = (item.expected / maxVal) * 100;
                                const actualWidth = ((item.actual || 0) / maxVal) * 100;
                                const isOver = (item.actual || 0) > item.expected;

                                return (
                                    <div key={idx} style={{ marginBottom: '15px' }}>
                                        <div className="chart-item-label">
                                            <span>{item.name}</span>
                                            <span>{item.actual || 0} / {item.expected} units</span>
                                        </div>
                                        <div className="bar-track">
                                            <div 
                                                className={`bar-fill ${isOver ? 'over' : 'actual'}`} 
                                                style={{ width: `${actualWidth}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="bar-legend">
                        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--primary-light)' }}></span>Expected</div>
                        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--primary)' }}></span>Actual</div>
                        <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--expired)' }}></span>Over budget</div>
                    </div>
                </div>

                <div className="card">
                    <div className="chart-title">⚠️ ALERTS</div>
                    {soonExpiring.length > 0 && (
                        <div className="alert alert-warning">
                            <div className="alert-title">Expiring Soon ({soonExpiring.length})</div>
                            {soonExpiring.map(item => `${item.itemName} — expires on ${item.expirationDate}`).join(', ')}
                        </div>
                    )}
                    {expiredItems.length > 0 && (
                        <div className="alert alert-danger">
                            <div className="alert-title">Expired ({expiredItems.length})</div>
                            {expiredItems.map(item => `${item.itemName} — expired on ${item.expirationDate}`).join(', ')}
                        </div>
                    )}
                    
                    {totalVariance > 0 && (
                        <div style={{ marginTop: '12px' }}>
                            <div className="alert" style={{ background: '#f5faf2', borderLeft: '4px solid var(--primary)', color: 'var(--muted)' }}>
                                <div className="alert-title" style={{ color: '#2d4a22' }}>💡 Suggestion</div>
                                You've exceeded expected consumption for some items. Consider updating your plan.
                            </div>
                        </div>
                    )}
                    
                    {soonExpiring.length === 0 && expiredItems.length === 0 && totalVariance <= 0 && (
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                            Everything looks good! No alerts at this time.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default DashboardPage;
