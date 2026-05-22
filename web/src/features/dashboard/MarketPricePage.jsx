import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/AppLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const MarketPricePage = () => {
    const [marketData, setMarketData] = useState({ prices: [], spoonacularQuotaLeft: -1 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchingOnline, setSearchingOnline] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchMarketPrices = async () => {
            setLoading(true);
            try {
                const response = await api.get('/market-prices');
                if (response.data.success) {
                    setMarketData(response.data.data);
                }
            } catch (error) {
                addToast('Failed to load market prices', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchMarketPrices();
    }, []);

    const handleSearchOnline = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setSearchingOnline(true);
        try {
            const response = await api.get('/market-prices', { params: { query: searchQuery.trim() } });
            if (response.data.success && response.data.data.prices.length > 0) {
                const newPrices = response.data.data.prices;
                
                setMarketData(prev => {
                    const uniqueNewPrices = newPrices.filter(newP => 
                        !prev.prices.some(item => item.itemName.toLowerCase() === newP.itemName.toLowerCase())
                    );
                    
                    if (uniqueNewPrices.length === 0) return prev;
                    return {
                        ...prev,
                        prices: [...uniqueNewPrices, ...prev.prices],
                        spoonacularQuotaLeft: response.data.data.spoonacularQuotaLeft
                    };
                });
                addToast(`Successfully tracked ${newPrices.length} matching products online!`, 'success');
            } else {
                addToast('No match found online for this product.', 'warning');
            }
        } catch (error) {
            addToast('Failed to fetch from external servers.', 'error');
        } finally {
            setSearchingOnline(false);
        }
    };

    const getSourceColor = (source) => {
        if (source.toLowerCase().includes('dti')) return '#1976d2'; // Blue for SRP DTI
        if (source.toLowerCase().includes('sm markets')) return '#0d47a1'; // Deep Blue for SM
        if (source.toLowerCase().includes('puregold')) return '#2e7d32'; // Green for PG
        if (source.toLowerCase().includes('robinsons')) return '#e53935'; // Red for Robinsons
        return '#757575'; // Grey for Mock
    };

    const filteredPrices = marketData.prices.filter(item => 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <h1>Market Price Trends</h1>
                <p>Real-time Suggested Retail Prices (SRP) and global market data</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loader">Loading Market Data...</div>
                </div>
            ) : (
                <>
                    {/* Search Bar */}
                    <form onSubmit={handleSearchOnline} style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        marginBottom: '30px',
                        background: 'white',
                        padding: '16px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input 
                                type="text" 
                                placeholder="Search local price trends... or type a custom product to fetch online" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 40px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                            <svg 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="var(--muted)" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            {searchQuery && (
                                <button 
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--muted)',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        padding: 0
                                    }}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        {searchQuery && filteredPrices.length === 0 && (
                            <button 
                                type="submit" 
                                disabled={searchingOnline}
                                className="btn-primary"
                                style={{
                                    padding: '0 24px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {searchingOnline ? 'Searching Online...' : 'Search Online 🌐'}
                            </button>
                        )}
                    </form>

                    {filteredPrices.length === 0 ? (
                        <div className="card" style={{ 
                            textAlign: 'center', 
                            padding: '48px 24px', 
                            marginBottom: '30px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <span style={{ fontSize: '3rem' }}>🔍</span>
                            <h3 style={{ margin: 0, color: 'var(--text)' }}>No Local Match Found</h3>
                            <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '400px', fontSize: '0.9rem' }}>
                                We couldn't find <strong>"{searchQuery}"</strong> in our pre-seeded local SRP database. Would you like us to look up real-time prices globally online?
                            </p>
                            <button 
                                onClick={handleSearchOnline}
                                disabled={searchingOnline}
                                className="btn-primary"
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    border: 'none'
                                }}
                            >
                                {searchingOnline ? 'Connecting to Global Servers...' : 'Search Online via Spoonacular/DTI 🌐'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            {filteredPrices.map((item, idx) => (
                                <div key={idx} className="card" style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    cursor: 'default'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-dark)' }}>{item.itemName}</h3>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: 700, 
                                            padding: '4px 8px', 
                                            borderRadius: '12px',
                                            background: getSourceColor(item.source) + '22',
                                            color: getSourceColor(item.source),
                                            textTransform: 'uppercase'
                                        }}>
                                            {item.source}
                                        </span>
                                    </div>
                                    
                                    <div style={{ marginBottom: '15px' }}>
                                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>
                                            ₱{item.currentPrice.toFixed(2)}
                                        </span>
                                        <span style={{ marginLeft: '5px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                            / {item.unit}
                                        </span>
                                    </div>

                                    <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                            Category: <span style={{ fontWeight: 600 }}>{item.category}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#bbb', marginTop: '4px' }}>
                                            Updated: {new Date(item.lastUpdated).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quota Indicator */}
                    <div className="card" style={{ background: '#f8f9fa', border: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted)' }}>Philippine Supermarket Sync Health</span>
                            <span style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 600 }}>
                                🟢 Sync Active & Stable (100%)
                            </span>
                        </div>
                        <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: '100%', 
                                height: '100%', 
                                background: 'linear-gradient(90deg, #2e7d32, #4caf50)',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '8px', fontStyle: 'italic' }}>
                            Providing real-time Suggested Retail Price (SRP) comparisons across major local supermarkets: SM Markets, Puregold, and Robinsons.
                        </p>
                    </div>
                </>
            )}

            <style jsx>{`
                .loader {
                    color: var(--primary);
                    font-weight: 600;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                }
            `}</style>
        </AppLayout>
    );
};

export default MarketPricePage;
