import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/AppLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [expiringSoon, setExpiringSoon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissedAlerts, setDismissedAlerts] = useState(() => {
        try {
            const saved = localStorage.getItem('dismissed_alerts');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const { addToast } = useToast();

    const fetchDashboardData = async (showLoading = false) => {
        if (showLoading) setLoading(true);
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
            if (showLoading) addToast('Failed to load dashboard data', 'error');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(true);
        const intervalId = setInterval(() => {
            fetchDashboardData(false);
        }, 3000);
        return () => clearInterval(intervalId);
    }, []);

    const handleDismissAlert = (itemId) => {
        const updated = [...dismissedAlerts, itemId];
        setDismissedAlerts(updated);
        localStorage.setItem('dismissed_alerts', JSON.stringify(updated));
        addToast('Alert dismissed', 'success');
    };

    const handleQuickAdjustment = async (item, amount) => {
        if (amount < 0 && (item.actual || 0) <= 0) {
            return;
        }

        // 1. Snapshot previous state for rollback on error
        const previousData = { ...dashboardData };
        
        // 2. Perform optimistic update locally for instant visual feedback
        const updatedItems = (dashboardData?.items || []).map(i => {
            if (i.id === item.id) {
                const newActual = Math.max(0, (i.actual || 0) + amount);
                const newVariance = newActual - i.expected;
                return {
                    ...i,
                    actual: newActual,
                    variance: newVariance
                };
            }
            return i;
        });

        setDashboardData(prev => prev ? { ...prev, items: updatedItems } : prev);

        const currentMonth = dashboardData?.month || new Date().toLocaleString('en-US', { month: 'long' });
        const currentYear = dashboardData?.year || new Date().getFullYear();
        
        try {
            const response = await api.post(`/groceries/${item.id}/consumption`, {
                actualConsumption: amount,
                incremental: true,
                month: currentMonth,
                year: currentYear
            });
            
            if (response.data.success) {
                const toastMsg = amount > 0 
                    ? `Logged +1 unit consumed for ${item.name}`
                    : `Reduced consumption by 1 unit for ${item.name}`;
                addToast(toastMsg, 'success');
            } else {
                // Rollback if server rejects
                setDashboardData(previousData);
                addToast('Failed to adjust consumption', 'error');
            }
        } catch (err) {
            // Rollback on network failures
            setDashboardData(previousData);
            addToast('Failed to adjust consumption', 'error');
        }
    };

    const getGroupedSummary = () => {
        if (!dashboardData?.items) return [];
        const groups = {};
        dashboardData.items.forEach(item => {
            const u = item.unit || 'units';
            if (!groups[u]) {
                groups[u] = { expected: 0, actual: 0, variance: 0 };
            }
            groups[u].expected += item.expected;
            groups[u].actual += (item.actual || 0);
            groups[u].variance += item.variance;
        });
        return Object.keys(groups).map(key => ({
            unit: key,
            expected: groups[key].expected,
            actual: groups[key].actual,
            variance: groups[key].variance
        }));
    };

    const totalExpected = dashboardData?.items?.reduce((sum, item) => sum + item.expected, 0) || 0;
    const totalActual = dashboardData?.items?.reduce((sum, item) => sum + (item.actual || 0), 0) || 0;
    const totalVariance = totalActual - totalExpected;

    const expiredItems = expiringSoon.filter(item => {
        if (!item.expirationDate || dismissedAlerts.includes(item.id)) return false;
        return new Date(item.expirationDate) < new Date();
    });
    
    const soonExpiring = expiringSoon.filter(item => {
        if (!item.expirationDate || dismissedAlerts.includes(item.id)) return false;
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
                    
                    <div className="kpi-dropdown">
                        <div className="kpi-dropdown-title">
                            <span>Expected By Unit</span>
                            <span>Total</span>
                        </div>
                        {getGroupedSummary().length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>No expected items.</div>
                        ) : (
                            getGroupedSummary().map((g, idx) => (
                                <div key={idx} className="kpi-dropdown-item" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>
                                    <span className="kpi-dropdown-item-name" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>⚖️ Total {g.unit}</span>
                                    <span className="kpi-dropdown-item-val" style={{ color: 'var(--primary-dark)' }}>{g.expected.toFixed(1)} {g.unit}</span>
                                </div>
                            ))
                        )}
                        <div className="kpi-dropdown-title" style={{ marginTop: '12px', borderBottom: '1px dashed #ccc' }}>
                            <span>Item Breakdown</span>
                            <span>Limit</span>
                        </div>
                        {!dashboardData?.items || dashboardData.items.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>No expected items yet.</div>
                        ) : (
                            dashboardData.items.map((item, idx) => (
                                <div key={idx} className="kpi-dropdown-item">
                                    <span className="kpi-dropdown-item-name">📦 {item.name}</span>
                                    <span className="kpi-dropdown-item-val">{item.expected.toFixed(1)} {item.unit || 'units'}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">MONTHLY VARIANCE</div>
                    <div className="stat-value" style={{ color: totalVariance > 0 ? 'var(--expired)' : 'var(--primary-dark)' }}>
                        {totalVariance > 0 ? '+' : ''}{totalVariance.toFixed(1)}
                    </div>
                    <div className="stat-sub">Units relative to goal</div>
                    
                    <div className="kpi-dropdown">
                        <div className="kpi-dropdown-title">
                            <span>Variance By Unit</span>
                            <span>Diff</span>
                        </div>
                        {getGroupedSummary().length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>No variance data.</div>
                        ) : (
                            getGroupedSummary().map((g, idx) => (
                                <div key={idx} className="kpi-dropdown-item" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>
                                    <span className="kpi-dropdown-item-name" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>⚖️ Total {g.unit}</span>
                                    <span 
                                        className="kpi-dropdown-item-val" 
                                        style={{ color: g.variance > 0 ? 'var(--expired)' : '#2e7d32' }}
                                    >
                                        {g.variance > 0 ? `+${g.variance.toFixed(1)}` : g.variance.toFixed(1)} {g.unit}
                                    </span>
                                </div>
                            ))
                        )}
                        <div className="kpi-dropdown-title" style={{ marginTop: '12px', borderBottom: '1px dashed #ccc' }}>
                            <span>Item Breakdown</span>
                            <span>Diff</span>
                        </div>
                        {!dashboardData?.items || dashboardData.items.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>No items variance data.</div>
                        ) : (
                            dashboardData.items.map((item, idx) => {
                                const varVal = (item.actual || 0) - item.expected;
                                return (
                                    <div key={idx} className="kpi-dropdown-item">
                                        <span className="kpi-dropdown-item-name">📦 {item.name}</span>
                                        <span 
                                            className="kpi-dropdown-item-val" 
                                            style={{ color: varVal > 0 ? 'var(--expired)' : '#2e7d32' }}
                                        >
                                            {varVal > 0 ? `+${varVal.toFixed(1)}` : varVal.toFixed(1)} {item.unit || 'units'}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">EXPIRING SOON</div>
                    <div className="stat-value" style={{ color: '#e8a838' }}>{soonExpiring.length}</div>
                    <div className="stat-sub">Within next 3 days</div>
                    
                    <div className="kpi-dropdown">
                        <div className="kpi-dropdown-title">
                            <span>Expiring Soon</span>
                            <span>Expires On</span>
                        </div>
                        {soonExpiring.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>No items expiring soon! 🎉</div>
                        ) : (
                            soonExpiring.map((item, idx) => (
                                <div key={idx} className="kpi-dropdown-item">
                                    <span className="kpi-dropdown-item-name">🍎 {item.itemName}</span>
                                    <span className="kpi-dropdown-item-val" style={{ color: '#e8a838', fontSize: '0.75rem' }}>{item.expirationDate}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">EXPIRED ITEMS</div>
                    <div className="stat-value" style={{ color: 'var(--expired)' }}>{expiredItems.length}</div>
                    <div className="stat-sub">Action required</div>
                    
                    <div className="kpi-dropdown">
                        <div className="kpi-dropdown-title">
                            <span>Expired Items</span>
                            <span>Expired On</span>
                        </div>
                        {expiredItems.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>No expired items. Awesome!</div>
                        ) : (
                            expiredItems.map((item, idx) => (
                                <div key={idx} className="kpi-dropdown-item">
                                    <span className="kpi-dropdown-item-name">🥀 {item.itemName}</span>
                                    <span className="kpi-dropdown-item-val" style={{ color: 'var(--expired)', fontSize: '0.75rem' }}>{item.expirationDate}</span>
                                </div>
                            ))
                        )}
                    </div>
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
                                        <div className="chart-item-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{item.name}</span>
                                                <div style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    background: 'var(--primary-xlight)', 
                                                    borderRadius: '20px', 
                                                    padding: '2px 6px', 
                                                    border: '1px solid rgba(156,201,127,0.15)',
                                                    gap: '6px'
                                                }}>
                                                    <button 
                                                        onClick={() => handleQuickAdjustment(item, -1.0)}
                                                        title="Quick Log -1 Unit"
                                                        disabled={(item.actual || 0) <= 0}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: (item.actual || 0) <= 0 ? 'var(--muted)' : 'var(--primary-dark)',
                                                            cursor: (item.actual || 0) <= 0 ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 'bold',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '16px',
                                                            height: '16px',
                                                            opacity: (item.actual || 0) <= 0 ? 0.35 : 1,
                                                            transition: 'all 0.15s'
                                                        }}
                                                        className="quick-log-btn-minus"
                                                    >
                                                        −
                                                    </button>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', opacity: 0.4 }}>|</span>
                                                    <button 
                                                        onClick={() => handleQuickAdjustment(item, 1.0)}
                                                        title="Quick Log +1 Unit"
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--primary-dark)',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 'bold',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '16px',
                                                            height: '16px',
                                                            transition: 'all 0.15s'
                                                        }}
                                                        className="quick-log-btn-plus"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <span>{item.actual || 0} / {item.expected} {item.unit || 'units'}</span>
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
                        <div className="alert alert-warning" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="alert-title" style={{ margin: 0 }}>Expiring Soon ({soonExpiring.length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {soonExpiring.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                        <span>⏰ {item.itemName} — expires on {item.expirationDate}</span>
                                        <button 
                                            onClick={() => handleDismissAlert(item.id)}
                                            style={{
                                                background: 'rgba(232, 168, 56, 0.1)',
                                                border: '1px solid rgba(232, 168, 56, 0.3)',
                                                color: '#e8a838',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.65rem',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            🔕 Dismiss
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {expiredItems.length > 0 && (
                        <div className="alert alert-danger" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                            <div className="alert-title" style={{ margin: 0 }}>Expired ({expiredItems.length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {expiredItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                        <span>🥀 {item.itemName} — expired on {item.expirationDate}</span>
                                        <button 
                                            onClick={() => handleDismissAlert(item.id)}
                                            style={{
                                                background: 'rgba(229, 57, 53, 0.1)',
                                                border: '1px solid rgba(229, 57, 53, 0.3)',
                                                color: 'var(--expired)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.65rem',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            🔕 Dismiss
                                        </button>
                                    </div>
                                ))}
                            </div>
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
            <style jsx>{`
                .stat-card {
                    position: relative;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                    z-index: 1010;
                }
                .kpi-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: white;
                    border-radius: 14px;
                    box-shadow: 0 12px 35px rgba(0,0,0,0.12);
                    border: 1px solid rgba(0,0,0,0.08);
                    padding: 16px;
                    z-index: 1000;
                    display: none;
                    max-height: 250px;
                    overflow-y: auto;
                    text-align: left;
                    animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .stat-card:hover .kpi-dropdown {
                    display: block;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .kpi-dropdown-title {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--muted);
                    text-transform: uppercase;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 8px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                }
                .kpi-dropdown-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.82rem;
                    padding: 8px 0;
                    border-bottom: 1px dashed #f0f0f0;
                }
                .kpi-dropdown-item:last-child {
                    border-bottom: none;
                }
                .kpi-dropdown-item-name {
                    font-weight: 600;
                    color: var(--text);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 65%;
                }
                .kpi-dropdown-item-val {
                    font-weight: 700;
                    color: var(--primary-dark);
                }
            `}</style>
        </AppLayout>
    );
};

export default DashboardPage;
