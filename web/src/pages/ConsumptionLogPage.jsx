import React, { useState, useEffect } from 'react';
import { useBlocker, useLocation } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import Button from '../components/Button';
import ConfirmationModal from '../components/ConfirmationModal';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const ConsumptionLogPage = () => {
    const [items, setItems] = useState([]);
    const [consumptionData, setConsumptionData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const location = useLocation();
    const { addToast } = useToast();

    // Browser-level alert for refresh/tab close
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // React Router blocker for internal navigation
    const blocker = useBlocker(
        ({ nextLocation }) => isDirty && !nextLocation.pathname.includes(location.pathname)
    );

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = [2024, 2025, 2026];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch comparison data for the selected month/year
                const response = await api.get(`/dashboard/comparison?month=${selectedMonth}&year=${selectedYear}`);
                if (response.data.success) {
                    const data = response.data.data;
                    setItems(data.items.map(item => ({
                        id: item.id || data.items.indexOf(item), // Fallback if no ID, but better to have it
                        itemName: item.name,
                        expectedMonthlyConsumption: item.expected,
                        actual: item.actual,
                        unit: '' // Unit might be missing from dashboard DTO, but items fetch has it. 
                    })));

                    // Fetch full items list to get units and IDs correctly
                    const itemsRes = await api.get('/groceries');
                    if (itemsRes.data.success) {
                        const fullItems = itemsRes.data.data;
                        const initialData = {};
                        
                        fullItems.forEach(item => {
                            // Find corresponding data from dashboard comparison using ID
                            const compItem = data.items.find(ci => ci.id === item.id);
                            // Default to 0.0 if no actual exists
                            initialData[item.id] = compItem ? compItem.actual : 0.0;
                        });
                        
                        setItems(fullItems);
                        setConsumptionData(initialData);
                    }
                }
            } catch (error) {
                addToast('Failed to fetch data', 'error');
            } finally {
                setLoading(false);
                setIsDirty(false); // Reset dirty state on load
            }
        };
        fetchData();
    }, [selectedMonth, selectedYear]);

    const handleInputChange = (id, value) => {
        setConsumptionData(prev => ({ ...prev, [id]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        const logs = Object.entries(consumptionData)
            .filter(([_, value]) => value !== '')
            .map(([id, value]) => ({
                id: parseInt(id),
                actualConsumption: parseFloat(value)
            }));

        if (logs.length === 0) {
            addToast('No consumption values entered', 'info');
            return;
        }

        setSaving(true);
        try {
            // Log each item sequentially or via Promise.all
            const promises = logs.map(log => 
                api.post(`/groceries/${log.id}/consumption`, {
                    month: selectedMonth,
                    year: selectedYear,
                    actualConsumption: log.actualConsumption
                })
            );

            await Promise.all(promises);
            addToast('Consumption logs saved successfully!', 'success');
            setIsDirty(false); // Reset dirty state
        } catch (error) {
            addToast('Error saving some logs', 'error');
        } finally {
            setSaving(false);
        }
    };

    const calculateVariance = (expected, actual) => {
        const val = actual === '' ? expected : parseFloat(actual);
        const variance = val - expected;
        return variance.toFixed(1);
    };

    const getStatus = (expected, actual) => {
        if (actual === '') return null;
        const diff = parseFloat(actual) - expected;
        if (diff > 0) return { label: 'OVER', class: 'badge-danger', style: { background: '#fdf0ee', color: 'var(--expired)' } };
        if (diff < 0) return { label: 'UNDER', class: 'badge-warning', style: { background: '#fef8ec', color: '#7a5a1a' } };
        return { label: 'BALANCED', class: 'badge-success', style: { background: 'var(--primary-xlight)', color: 'var(--primary-dark)' } };
    };

    return (
        <AppLayout>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Consumption Log</h1>
                        <p>Log your actual monthly consumption for each item</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? 'Saving...' : 'Save Log'}
                    </Button>
                </div>
            </div>

            <div className="month-selector-row" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Month:</span>
                    <select 
                        className="month-selector" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Year:</span>
                    <select 
                        className="month-selector" 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: '0', marginTop: '20px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ITEM</th>
                                <th>EXPECTED</th>
                                <th style={{ width: '150px' }}>ACTUAL</th>
                                <th>VARIANCE</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading items...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No items found. Add items first in Grocery Items page.</td></tr>
                            ) : (
                                items.map(item => {
                                    const status = getStatus(item.expectedMonthlyConsumption, consumptionData[item.id]);
                                    return (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                                            <td>{item.expectedMonthlyConsumption} {item.unit}</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    className="input-field" 
                                                    style={{ margin: 0, padding: '6px 10px' }}
                                                    value={consumptionData[item.id] ?? ''}
                                                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                                                />
                                            </td>
                                            <td style={{ fontWeight: 600, color: status ? (parseFloat(calculateVariance(item.expectedMonthlyConsumption, consumptionData[item.id])) > 0 ? 'var(--expired)' : 'var(--primary-dark)') : 'inherit' }}>
                                                {calculateVariance(item.expectedMonthlyConsumption, consumptionData[item.id])} {status ? item.unit : ''}
                                            </td>
                                            <td>
                                                {status && (
                                                    <span className="badge" style={status.style}>
                                                        {status.label}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={blocker.state === 'blocked'}
                onClose={() => blocker.reset()}
                onDiscard={() => blocker.proceed()}
                onConfirm={async () => {
                    await handleSave();
                    blocker.proceed();
                }}
                title="Unsaved Changes"
                message="You have unsaved changes. Would you like to save them before leaving?"
                confirmText="Save"
                discardText="Discard Changes"
                showCancel={false}
                isDanger={false}
            />
        </AppLayout>
    );
};

export default ConsumptionLogPage;
