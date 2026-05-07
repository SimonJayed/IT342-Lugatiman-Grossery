import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import Button from '../components/Button';
import GroceryModal from '../components/GroceryModal';
import ConfirmationModal from '../components/ConfirmationModal';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const GroceryItemsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
    const { addToast } = useToast();

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await api.get('/groceries');
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            addToast('Failed to fetch items', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAddClick = () => {
        setEditItem(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (item) => {
        setEditItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await api.delete(`/groceries/${itemToDelete.id}`);
            if (response.data.success) {
                addToast('Item deleted', 'success');
                fetchItems();
            }
        } catch (error) {
            addToast('Failed to delete item', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(items.map(item => item.categoryName).filter(Boolean))];

    return (
        <AppLayout>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Grocery Items</h1>
                        <p>Manage your grocery list and set expected consumption</p>
                    </div>
                    <Button onClick={handleAddClick}>Add Item</Button>
                </div>
            </div>

            <div className="card" style={{ padding: '0', marginTop: '20px' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>🔍</span>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Search items..." 
                            style={{ paddingLeft: '35px', margin: 0 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="input-field" 
                        style={{ width: '200px', margin: 0 }}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
                    </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ITEM NAME</th>
                                <th>CATEGORY</th>
                                <th>EXPECTED / MONTH</th>
                                <th>UNIT</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading items...</td></tr>
                            ) : filteredItems.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No items found</td></tr>
                            ) : (
                                filteredItems.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--primary-xlight)', color: 'var(--primary-dark)' }}>
                                                {item.categoryName || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td>{item.expectedMonthlyConsumption}</td>
                                        <td>{item.unit}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-icon" onClick={() => handleEditClick(item)} title="Edit">✏️</button>
                                            <button className="btn-icon danger" onClick={() => handleDeleteClick(item)} title="Delete">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <GroceryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onItemSaved={fetchItems}
                editItem={editItem}
            />

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Item"
                message={`Are you sure you want to delete "${itemToDelete?.itemName}"?`}
                confirmText="Delete"
                isDanger={true}
            />
        </AppLayout>
    );
};

export default GroceryItemsPage;
