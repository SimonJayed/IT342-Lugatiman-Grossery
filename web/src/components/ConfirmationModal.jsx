import React from 'react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    onDiscard,
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel", 
    discardText = "Discard",
    isDanger = false,
    showCancel = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {showCancel && (
                            <button className="btn-secondary" onClick={onClose}>{cancelText}</button>
                        )}
                        {onDiscard && (
                            <button className="btn-secondary" style={{ color: 'var(--expired)', borderColor: '#fca5a5' }} onClick={onDiscard}>
                                {discardText}
                            </button>
                        )}
                        <button
                            className={`btn-primary ${isDanger ? 'btn-danger' : ''}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
