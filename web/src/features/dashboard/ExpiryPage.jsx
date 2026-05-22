import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/AppLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const ExpiryPage = () => {
    const [groceries, setGroceries] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchGroceries = async () => {
        setLoading(true);
        try {
            const response = await api.get('/groceries');
            if (response.data.success) {
                setGroceries(response.data.data);
            }
        } catch (error) {
            addToast('Failed to load expiry inventory data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroceries();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const response = await api.delete(`/groceries/${id}`);
            if (response.data.success) {
                addToast(`Successfully removed ${name} from inventory.`, 'success');
                fetchGroceries();
            }
        } catch (error) {
            addToast('Failed to remove item.', 'error');
        }
    };

    const getDaysRemaining = (expirationDate) => {
        if (!expirationDate) return null;
        const expiry = new Date(expirationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);
        
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const expiredItems = groceries.filter(item => {
        const days = getDaysRemaining(item.expirationDate);
        return days !== null && days < 0;
    });

    const expiringSoonItems = groceries.filter(item => {
        const days = getDaysRemaining(item.expirationDate);
        return days !== null && days >= 0 && days <= 3;
    });

    const freshItems = groceries.filter(item => {
        const days = getDaysRemaining(item.expirationDate);
        return days !== null && days > 3;
    });

    const noExpiryItems = groceries.filter(item => !item.expirationDate);

    return (
        <AppLayout>
            <div className="page-header">
                <h1>Expiry Dashboard</h1>
                <p>Track expiration statuses and consume items before they go bad.</p>
            </div>

            {/* Quick Summary Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--expired, #d32f2f)' }}>
                    <div className="stat-label" style={{ color: 'var(--expired, #d32f2f)' }}>Expired</div>
                    <div className="stat-value">{expiredItems.length}</div>
                    <div className="stat-sub">Requires immediate removal</div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #ef6c00' }}>
                    <div className="stat-label" style={{ color: '#ef6c00' }}>Expiring Soon</div>
                    <div className="stat-value">{expiringSoonItems.length}</div>
                    <div className="stat-sub">Consume within 3 days</div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary, #2e7d32)' }}>
                    <div className="stat-label" style={{ color: 'var(--primary, #2e7d32)' }}>Fresh & Safe</div>
                    <div className="stat-value">{freshItems.length}</div>
                    <div className="stat-sub">More than 3 days left</div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--muted, #757575)' }}>
                    <div className="stat-label" style={{ color: 'var(--muted, #757575)' }}>No Expiry Set</div>
                    <div className="stat-value">{noExpiryItems.length}</div>
                    <div className="stat-sub">Stable pantry items</div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--muted)' }}>
                    <h3>Loading inventory statuses...</h3>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    
                    {/* Column 1: Expired */}
                    <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', minHeight: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔴</span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d32f2f', margin: 0 }}>Expired ({expiredItems.length})</h3>
                        </div>
                        {expiredItems.length === 0 ? (
                            <p style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' }}>No expired items. Great job! 🙌</p>
                        ) : (
                            expiredItems.map(item => (
                                <div key={item.id} style={{ padding: '12px', background: '#ffebee', borderRadius: '8px', marginBottom: '10px', position: 'relative' }}>
                                    <div style={{ fontWeight: 600, color: '#c62828', fontSize: '0.95rem' }}>{item.itemName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#c62828', marginTop: '2px' }}>
                                        Expired on: {item.expirationDate} ({Math.abs(getDaysRemaining(item.expirationDate))} days ago)
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.itemName)}
                                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 'bold' }}
                                        title="Discard item"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Column 2: Expiring Soon */}
                    <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', minHeight: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef6c00', margin: 0 }}>Expiring Soon ({expiringSoonItems.length})</h3>
                        </div>
                        {expiringSoonItems.length === 0 ? (
                            <p style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' }}>No items expiring soon.</p>
                        ) : (
                            expiringSoonItems.map(item => {
                                const days = getDaysRemaining(item.expirationDate);
                                return (
                                    <div key={item.id} style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px', marginBottom: '10px', position: 'relative' }}>
                                        <div style={{ fontWeight: 600, color: '#e65100', fontSize: '0.95rem' }}>{item.itemName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#e65100', marginTop: '2px' }}>
                                            Expires: {item.expirationDate} ({days === 0 ? 'Expires TODAY!' : `Expires in ${days} days`})
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(item.id, item.itemName)}
                                            style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#e65100', cursor: 'pointer' }}
                                            title="Consume/Discard"
                                        >
                                            ✔️
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Column 3: Fresh */}
                    <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', minHeight: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🟢</span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2e7d32', margin: 0 }}>Safe & Fresh ({freshItems.length})</h3>
                        </div>
                        {freshItems.length === 0 ? (
                            <p style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' }}>No safe/tracked items.</p>
                        ) : (
                            freshItems.map(item => (
                                <div key={item.id} style={{ padding: '12px', background: '#e8f5e9', borderRadius: '8px', marginBottom: '10px' }}>
                                    <div style={{ fontWeight: 600, color: '#1b5e20', fontSize: '0.95rem' }}>{item.itemName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#1b5e20', marginTop: '2px' }}>
                                        Expires: {item.expirationDate} ({getDaysRemaining(item.expirationDate)} days left)
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            )}
        </AppLayout>
    );
};

export default ExpiryPage;
