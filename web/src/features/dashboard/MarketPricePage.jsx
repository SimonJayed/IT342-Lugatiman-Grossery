import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layouts/AppLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

const MarketPricePage = () => {
    const [marketData, setMarketData] = useState({ prices: [], spoonacularQuotaLeft: -1 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchingOnline, setSearchingOnline] = useState(false);
    const { addToast } = useToast();

    // Price submission form states
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [brand, setBrand] = useState('');
    const [variant, setVariant] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('unit');
    const [category, setCategory] = useState('Grocery Item');
    const [netContent, setNetContent] = useState('');
    const [packaging, setPackaging] = useState('Can');
    const [storeName, setStoreName] = useState('');
    const [storeLocation, setStoreLocation] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);

    // Modal view states
    const [viewingReceiptUrl, setViewingReceiptUrl] = useState(null);

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

    useEffect(() => {
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
                        !prev.prices.some(item => item.itemName.toLowerCase() === newP.itemName.toLowerCase() && item.storeName === newP.storeName)
                    );
                    return {
                        ...prev,
                        prices: [...uniqueNewPrices, ...prev.prices],
                        spoonacularQuotaLeft: response.data.data.spoonacularQuotaLeft
                    };
                });
                addToast(`Found ${newPrices.length} matching prices locally!`, 'success');
            } else {
                addToast('No community matched price cards found.', 'warning');
            }
        } catch (error) {
            addToast('Failed to query price database.', 'error');
        } finally {
            setSearchingOnline(false);
        }
    };

    const handleSubmitPrice = async (e) => {
        e.preventDefault();
        if (!brand.trim() || !price || !storeName.trim() || !storeLocation.trim()) {
            addToast('Please fill in all required fields.', 'warning');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        // Construct clean standardized name: Brand [+ Variant] [+ (NetContent)] dynamically
        let fullItemName = brand.trim();
        if (variant.trim()) {
            fullItemName += ` ${variant.trim()}`;
        }
        if (netContent.trim()) {
            fullItemName += ` (${netContent.trim()})`;
        }
        
        formData.append('itemName', fullItemName);
        formData.append('price', parseFloat(price));
        formData.append('unit', unit);
        formData.append('category', category);
        formData.append('brand', brand.trim());
        formData.append('variant', variant.trim());
        formData.append('netContent', netContent.trim());
        formData.append('packaging', packaging);
        formData.append('storeName', storeName.trim());
        formData.append('storeLocation', storeLocation.trim());
        
        if (receiptFile) {
            formData.append('receipt', receiptFile);
        }

        try {
            const response = await api.post('/market-prices', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                addToast('Community price card submitted successfully!', 'success');
                setShowModal(false);
                // Clear inputs
                setBrand('');
                setVariant('');
                setPrice('');
                setNetContent('');
                setStoreName('');
                setStoreLocation('');
                setReceiptFile(null);
                // Refresh list
                fetchMarketPrices();
            }
        } catch (error) {
            addToast('Failed to submit community price card.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getSourceColor = (source) => {
        if (source.toLowerCase().includes('dti')) return '#1976d2';
        return '#689f38'; // Green for crowdsourced community card
    };

    const filteredPrices = marketData.prices.filter(item => 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storeLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            {/* Header Layout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div className="page-header" style={{ margin: 0 }}>
                    <h1 style={{ margin: 0 }}>Community Price Tracker</h1>
                    <p style={{ margin: '4px 0 0 0' }}>Crowdsourced grocery prices and supermarket comparisons</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: 'var(--primary)',
                        color: 'white',
                        boxShadow: '0 4px 10px rgba(156,201,127,0.3)'
                    }}
                >
                    Submit Local Price Card 🏷️
                </button>
            </div>

            {/* Structured Community Disclaimer */}
            <div style={{
                background: '#fcfdfb',
                border: '1px solid rgba(156, 201, 127, 0.25)',
                padding: '16px 20px',
                borderRadius: '16px',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'start',
                gap: '12px'
            }}>
                <span style={{ fontSize: '1.4rem', marginTop: '-2px' }}>💡</span>
                <div>
                    <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '0.9rem', fontWeight: 700 }}>Community Notice & Disclaimer</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                        All listed price cards are contributed by the Grossery community. To ensure maximum credibility, look for the green <strong>🧾 Verified Price</strong> badge which contains a physical store receipt photo. Unverified prices should be assessed manually for credibility.
                    </p>
                </div>
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
                                placeholder="Search by product, brand, store, or city location..." 
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
                            <span style={{ fontSize: '3rem' }}>🏪</span>
                            <h3 style={{ margin: 0, color: 'var(--text)' }}>No Price Records Found</h3>
                            <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '400px', fontSize: '0.9rem' }}>
                                We don't have any community price cards matching <strong>"{searchQuery || 'your query'}"</strong> yet. Be the first to track a local price card!
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                                <button 
                                    onClick={() => setShowModal(true)}
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
                                    Submit Price Card 🏷️
                                </button>
                                <Link 
                                    to="/items"
                                    className="btn-secondary"
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        display: 'inline-block',
                                        border: '1px solid var(--border)',
                                        textAlign: 'center'
                                    }}
                                >
                                    Go to Pantry Manager ➕
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            {filteredPrices.map((item, idx) => (
                                <div key={idx} className="card" style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    cursor: 'default',
                                    border: '1px solid var(--border)',
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-dark)' }}>{item.itemName}</h3>
                                        <span style={{ 
                                            fontSize: '0.65rem', 
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
                                    
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>
                                            ₱{item.currentPrice.toFixed(2)}
                                        </span>
                                        <span style={{ marginLeft: '5px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                            / {item.unit}
                                        </span>
                                    </div>

                                    {/* Granular Product Attribute Badges */}
                                    {((item.brand && item.brand !== 'N/A') || 
                                      (item.variant && item.variant !== 'N/A') || 
                                      (item.netContent && item.netContent !== 'N/A') || 
                                      (item.packaging && item.packaging !== 'N/A')) ? (
                                        <div style={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: '6px', 
                                            marginBottom: '15px',
                                            background: '#fcfdfb',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            border: '1px dashed rgba(156, 201, 127, 0.3)'
                                        }}>
                                            {item.brand && item.brand !== 'N/A' && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', background: 'rgba(156, 201, 127, 0.08)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                                    🏷️ {item.brand}
                                                </span>
                                            )}
                                            {item.variant && item.variant !== 'N/A' && (
                                                <span style={{ fontSize: '0.7rem', color: '#558b2f', background: '#f1f8e9', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                                                    ✨ {item.variant}
                                                </span>
                                            )}
                                            {item.netContent && item.netContent !== 'N/A' && (
                                                <span style={{ fontSize: '0.7rem', color: '#37474f', background: '#eceff1', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                                                    ⚖️ {item.netContent}
                                                </span>
                                            )}
                                            {item.packaging && item.packaging !== 'N/A' && (
                                                <span style={{ fontSize: '0.7rem', color: '#ef6c00', background: '#fff3e0', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                                                    📦 {item.packaging}
                                                </span>
                                            )}
                                        </div>
                                    ) : null}

                                    {/* Store Name & Location Badge */}
                                    {((item.storeName && item.storeName.trim()) || (item.storeLocation && item.storeLocation.trim())) ? (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: '#fcfcfc',
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            border: '1px solid #f0f0f0',
                                            fontSize: '0.8rem',
                                            color: '#333',
                                            marginBottom: '15px'
                                        }}>
                                            <span>🏪</span>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.storeName && <strong>{item.storeName}</strong>}
                                                {item.storeLocation && <span style={{ color: 'var(--muted)', marginLeft: '4px' }}>({item.storeLocation})</span>}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Trust Badges: Verified vs Unverified */}
                                    <div style={{ marginBottom: '15px' }}>
                                        {item.receiptPath ? (
                                            <button 
                                                onClick={() => setViewingReceiptUrl(item.receiptPath)}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: '#e8f5e9',
                                                    color: '#2e7d32',
                                                    border: '1px solid #c8e6c9',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                                title="Click to view verified store receipt"
                                                className="trust-badge-verified"
                                            >
                                                🟢 🧾 Verified Price (View Receipt)
                                            </button>
                                        ) : (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                background: '#fff8e1',
                                                color: '#f57f17',
                                                border: '1px solid #ffe082',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                ⚠️ Unverified Price (No Receipt)
                                            </span>
                                        )}
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

                        {/* Bottom Escape Hatch */}
                        {filteredPrices.length > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(156, 201, 127, 0.04)',
                                border: '1px dashed var(--primary)',
                                padding: '16px 24px',
                                borderRadius: '16px',
                                marginTop: '10px',
                                marginBottom: '30px',
                                gap: '16px'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: 600 }}>Didn't find your exact product, brand, or flavor?</h4>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                                        You can manually add custom items to your personal pantry inventory.
                                    </p>
                                </div>
                                <Link 
                                    to="/items"
                                    className="btn-primary"
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: '10px', 
                                        fontSize: '0.85rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'center',
                                        fontWeight: 600
                                    }}
                                >
                                    Add Custom Item ➕
                                </Link>
                            </div>
                        )}
                        </>
                    )}

                    {/* Supermarket Sync Health Block */}
                    <div className="card" style={{ background: '#f8f9fa', border: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted)' }}>Crowdsourced Tracker Health</span>
                            <span style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 600 }}>
                                🟢 Platform Active & Community Synced (100%)
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
                            Encouraging grocery budgeting transparency across regions by allowing verified community receipt-backed price sharing.
                        </p>
                    </div>
                </>
            )}

            {/* 🏷️ Submission Modal Form Overlay */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '550px' }}>
                        <div className="modal-header">
                            <h3>Submit Local Price Card</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmitPrice}>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Brand Name *</label>
                                        <input 
                                            type="text" 
                                            className="input-field"
                                            placeholder="e.g., Milo, Century" 
                                            value={brand}
                                            onChange={(e) => setBrand(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Product / Variant</label>
                                        <input 
                                            type="text" 
                                            className="input-field"
                                            placeholder="e.g., Active-Go, Tuna Flakes" 
                                            value={variant}
                                            onChange={(e) => setVariant(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Size / Net Weight</label>
                                        <input 
                                            type="text" 
                                            className="input-field"
                                            placeholder="e.g., 300g, 500ml" 
                                            value={netContent}
                                            onChange={(e) => setNetContent(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Packaging</label>
                                        <select 
                                            value={packaging}
                                            onChange={(e) => setPackaging(e.target.value)}
                                            className="input-field"
                                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        >
                                            <option value="Can">Can</option>
                                            <option value="Pack">Pack</option>
                                            <option value="Bottle">Bottle</option>
                                            <option value="Sachet">Sachet</option>
                                            <option value="Box">Box</option>
                                            <option value="Bar Soap">Bar Soap</option>
                                            <option value="Tube">Tube</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Price Paid (PHP) *</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="input-field"
                                            placeholder="e.g., 118.00" 
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Unit Metric</label>
                                        <input 
                                            type="text" 
                                            className="input-field"
                                            placeholder="e.g., unit, pack, sachet" 
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Store Name *</label>
                                        <input 
                                            type="text" 
                                            className="input-field"
                                            placeholder="e.g., Puregold Banilad" 
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>City / Location *</label>
                                        <input 
                                            type="text" 
                                            className="input-field"
                                            placeholder="e.g., Cebu City, Mandaue" 
                                            value={storeLocation}
                                            onChange={(e) => setStoreLocation(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Product Category</label>
                                    <select 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="input-field"
                                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    >
                                        <option value="Grocery Item">Grocery Item</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Personal Care">Personal Care</option>
                                        <option value="Noodles & Pasta">Noodles & Pasta</option>
                                        <option value="Canned Goods">Canned Goods</option>
                                        <option value="Dairy Products">Dairy Products</option>
                                        <option value="Bakery">Bakery</option>
                                        <option value="Fresh Produce">Fresh Produce</option>
                                        <option value="Snacks & Sweets">Snacks & Sweets</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Attach Store Receipt (Optional Image)</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setReceiptFile(e.target.files[0])}
                                        className="input-field"
                                        style={{ padding: '8px' }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer" style={{ marginTop: '20px' }}>
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="btn-primary"
                                    style={{ border: 'none' }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Price 🏷️'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🧾 Receipt Image Viewer Modal */}
            {viewingReceiptUrl && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1100,
                    padding: '20px',
                    backdropFilter: 'blur(6px)'
                }}>
                    <div style={{
                        position: 'relative',
                        background: 'white',
                        padding: '16px',
                        borderRadius: '20px',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        <button 
                            onClick={() => setViewingReceiptUrl(null)}
                            style={{
                                position: 'absolute',
                                top: '-15px',
                                right: '-15px',
                                background: '#e53935',
                                color: 'white',
                                border: 'none',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}
                        >
                            &times;
                        </button>
                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary-dark)' }}>Verified Purchase Receipt Proof</h4>
                        <div style={{ overflow: 'auto', maxWidth: '100%', maxHeight: '70vh' }}>
                            <img 
                                src={`http://localhost:8080${viewingReceiptUrl}`} 
                                alt="Store purchase receipt proof" 
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/400x500?text=Receipt+Image+Unavailable';
                                }}
                            />
                        </div>
                    </div>
                </div>
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
                .card {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                }
                .card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
                }
                .trust-badge-verified:hover {
                    background: #c8e6c9 !important;
                    box-shadow: 0 2px 6px rgba(46,125,50,0.15);
                }
            `}</style>
        </AppLayout>
    );
};

export default MarketPricePage;
