import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../auth/AuthContext';

const GroceryModal = ({ isOpen, onClose, onItemSaved, editItem = null }) => {
    const { user } = useAuth();
    const isAdmin = user && user.role === 'ROLE_ADMIN';

    const [formData, setFormData] = useState({
        itemName: '',
        categoryName: '',
        unit: '',
        expectedMonthlyConsumption: '',
        expirationDate: ''
    });
    const [existingCategories, setExistingCategories] = useState([]);
    const [showCatManager, setShowCatManager] = useState(false);
    const [loading, setLoading] = useState(false);
    const [receiptFile, setReceiptFile] = useState(null);
    const { addToast } = useToast();

    const standardUnits = ['kg', 'g', 'liters', 'ml', 'loaves', 'pcs', 'packs', 'bottles', 'cans'];

    useEffect(() => {
        if (isOpen) {
            fetchExistingCategories();
            setShowCatManager(false); // Reset to hidden by default
            setReceiptFile(null); // Clear selected file
            // Reset input element value manually if it exists
            const fileInput = document.getElementById('grocery-receipt-input');
            if (fileInput) fileInput.value = '';
        }
        
        if (editItem) {
            setFormData({
                itemName: editItem.itemName || '',
                categoryName: editItem.categoryName || '',
                unit: editItem.unit || '',
                expectedMonthlyConsumption: editItem.expectedMonthlyConsumption || '',
                expirationDate: editItem.expirationDate || ''
            });
        } else {
            setFormData({
                itemName: '',
                categoryName: '',
                unit: '',
                expectedMonthlyConsumption: '',
                expirationDate: ''
            });
        }
    }, [editItem, isOpen]);

    const fetchExistingCategories = async () => {
        try {
            const response = await api.get('/groceries/categories');
            if (response.data.success) {
                setExistingCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleDeleteCategory = async (catName) => {
        if (!window.confirm(`Are you sure you want to delete the category "${catName}"? Items using this category will become "Uncategorized".`)) {
            return;
        }

        try {
            const response = await api.delete(`/groceries/categories/${encodeURIComponent(catName)}`);
            if (response.data.success) {
                addToast(`Category "${catName}" deleted`, 'success');
                fetchExistingCategories();
                // If the current input has this category, clear it
                if (formData.categoryName === catName) {
                    setFormData(prev => ({ ...prev, categoryName: '' }));
                }
            }
        } catch (error) {
            addToast('Failed to delete category', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setReceiptFile(e.target.files[0] || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                expectedMonthlyConsumption: parseFloat(formData.expectedMonthlyConsumption),
                categoryName: formData.categoryName // Flat field to match backend GroceryDto
            };

            let response;
            if (editItem) {
                response = await api.put(`/groceries/${editItem.id}`, payload);
            } else {
                response = await api.post('/groceries', payload);
            }

            if (response.data.success) {
                const savedItem = response.data.data;
                
                // If receipt file is selected, upload it
                if (receiptFile && savedItem && savedItem.id) {
                    const uploadData = new FormData();
                    uploadData.append('file', receiptFile);
                    try {
                        await api.post(`/groceries/${savedItem.id}/receipts`, uploadData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });
                        addToast(editItem ? 'Item updated & receipt uploaded!' : 'Item added & receipt uploaded!', 'success');
                    } catch (uploadError) {
                        console.error('Failed to upload receipt:', uploadError);
                        addToast(editItem ? 'Item updated, but receipt upload failed' : 'Item added, but receipt upload failed', 'warning');
                    }
                } else {
                    addToast(editItem ? 'Item updated successfully!' : 'Item added successfully!', 'success');
                }
                
                onItemSaved();
                onClose();
            } else {
                addToast(response.data.message || 'Something went wrong', 'error');
            }
        } catch (error) {
            addToast(error.response?.data?.message || 'Server error', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>{editItem ? 'Edit Grocery Item' : 'Add New Item'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <Input
                            label="ITEM NAME"
                            name="itemName"
                            value={formData.itemName}
                            onChange={handleChange}
                            placeholder="e.g. Chicken"
                            required
                        />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', margin: 0 }}>CATEGORY</label>
                            {isAdmin && (
                                <button 
                                    type="button" 
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                                    onClick={() => setShowCatManager(!showCatManager)}
                                >
                                    {showCatManager ? 'Hide Manager' : 'Manage Categories'}
                                </button>
                            )}
                        </div>

                        {isAdmin ? (
                            <>
                                <Input
                                    name="categoryName"
                                    value={formData.categoryName}
                                    onChange={handleChange}
                                    placeholder="e.g. Meat"
                                    list="category-list"
                                    required
                                />
                                <datalist id="category-list">
                                    {existingCategories.map(cat => <option key={cat} value={cat} />)}
                                </datalist>
                            </>
                        ) : (
                            <select
                                name="categoryName"
                                value={formData.categoryName}
                                onChange={handleChange}
                                className="input-field"
                                style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                required
                            >
                                <option value="">-- Select Category --</option>
                                {existingCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        )}

                        {isAdmin && showCatManager && (
                            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #eee' }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '8px', color: '#666' }}>Existing Categories (Click 🗑️ to remove):</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {existingCategories.length === 0 ? (
                                        <span style={{ fontSize: '0.7rem', color: '#999' }}>No categories yet.</span>
                                    ) : (
                                        existingCategories.map(cat => (
                                            <div key={cat} style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                {cat}
                                                <span 
                                                    style={{ cursor: 'pointer', color: 'var(--expired)', fontWeight: 'bold' }} 
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    title="Delete Category"
                                                >
                                                    🗑️
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <p style={{ fontSize: '0.65rem', color: '#999', marginTop: '8px' }}>Note: Deleting a category will set items using it to "Uncategorized".</p>
                            </div>
                        )}

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px' }}>UNIT</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="input-field"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                required
                            >
                                <option value="">-- Select Unit --</option>
                                {standardUnits.map(u => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="EXPECTED MONTHLY CONSUMPTION"
                            name="expectedMonthlyConsumption"
                            type="number"
                            step="0.1"
                            value={formData.expectedMonthlyConsumption}
                            onChange={handleChange}
                            placeholder="e.g. 3"
                            required
                        />
                        <Input
                            label="EXPIRATION DATE (OPTIONAL)"
                            name="expirationDate"
                            type="date"
                            value={formData.expirationDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px' }}>RECEIPT IMAGE (OPTIONAL)</label>
                            <input 
                                id="grocery-receipt-input"
                                type="file" 
                                className="input-field" 
                                style={{ padding: '8px' }} 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>Choose a receipt image to upload for proof or price credibility.</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GroceryModal;
