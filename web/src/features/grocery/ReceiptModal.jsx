import React, { useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

const ReceiptModal = ({ isOpen, onClose, item, onReceiptUploaded }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { addToast } = useToast();

    if (!isOpen || !item) return null;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            addToast('Please select a receipt image file to upload.', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`/groceries/${item.id}/receipts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                addToast('Receipt uploaded successfully!', 'success');
                setFile(null);
                // Clear the file input
                const fileInput = document.getElementById('receipt-file-input');
                if (fileInput) fileInput.value = '';
                
                onReceiptUploaded();
            }
        } catch (error) {
            addToast('Failed to upload receipt. Please check file type & size.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const backendUrl = 'http://localhost:8080';

    return (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '500px', maxWidth: '90%', padding: '24px', zIndex: 1000, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>🧾 Receipts: {item.itemName}</h3>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--muted)' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>Upload New Receipt Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                            id="receipt-file-input"
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ flex: 1, fontSize: '0.9rem' }}
                        />
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </form>

                {/* Receipt Gallery */}
                <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text)' }}>Uploaded Receipts ({item.receiptPaths?.length || 0})</h4>
                    
                    {!item.receiptPaths || item.receiptPaths.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', background: '#f9f9f9', borderRadius: '8px', color: 'var(--muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            No receipts uploaded for this item yet.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxHeight: '200px', overflowY: 'auto', padding: '2px' }}>
                            {item.receiptPaths.map((path, idx) => {
                                const fullUrl = path.startsWith('http') ? path : `${backendUrl}${path}`;
                                return (
                                    <div key={idx} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd', height: '90px', background: '#f5f5f5' }}>
                                        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                                            <img 
                                                src={fullUrl} 
                                                alt={`Receipt ${idx + 1}`} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150?text=Receipt';
                                                }}
                                            />
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <Button onClick={onClose} style={{ background: '#eee', color: '#333' }}>Close</Button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
