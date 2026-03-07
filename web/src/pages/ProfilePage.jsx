import React, { useState } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    console.log("ProfilePage User Data:", user);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false); // Clean up state (though component unmounts)
    };

    return (
        <AppLayout>
            <div className="page-content active">
                <div className="page-header">
                    <h1>Profile</h1>
                    <p>Your account information</p>
                </div>
                <div className="card profile-card">
                    <div className="profile-avatar">
                        {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="profile-field">
                        <label>First Name</label>
                        <p>{user?.firstName || 'User'}</p>
                    </div>
                    <div className="profile-field">
                        <label>Last Name</label>
                        <p>{user?.lastName || 'Name'}</p>
                    </div>
                    <div className="profile-field">
                        <label>Email Address</label>
                        <p>{user?.email || 'user@example.com'}</p>
                    </div>
                    <div className="profile-field">
                        <label>Account Created</label>
                        <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'February 23, 2026'}</p>
                    </div>
                    <div className="profile-divider"></div>
                    <button className="btn-logout" onClick={() => setShowLogoutModal(true)}>Sign Out</button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title="Log Out"
                message="Are you sure you want to log out?"
                confirmText="Log Out"
                isDanger={true}
            />
        </AppLayout>
    );
};

export default ProfilePage;
