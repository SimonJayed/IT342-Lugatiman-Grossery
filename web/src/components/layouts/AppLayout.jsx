import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../ConfirmationModal';

const AppLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setShowDropdown(false);
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">Gross<span>ery</span></div>

                <div className="sidebar-section">Main</div>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span> Dashboard
                </NavLink>
                <NavLink to="/items" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🛒</span> Grocery Items
                </NavLink>
                <NavLink to="/consumption" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📋</span> Consumption Log
                </NavLink>
                <NavLink to="/expiry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">⏰</span> Expiry Tracker
                </NavLink>

                <div className="sidebar-section">Account</div>
                <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">👤</span> Profile
                </NavLink>

                <div className="sidebar-footer">
                    <div className="sidebar-user" ref={dropdownRef} style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setShowDropdown(!showDropdown)}>
                        <div className="avatar">
                            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}</div>
                            <div className="sidebar-user-email">{user?.email || 'user@example.com'}</div>
                        </div>
                        <div style={{ color: 'rgba(232, 245, 224, 0.4)' }}>
                            {showDropdown ? '▲' : '▼'}
                        </div>

                        {showDropdown && (
                            <div className="dropdown-menu">
                                <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                                <div className="dropdown-item danger" onClick={(e) => {
                                    e.stopPropagation();
                                    handleLogoutClick();
                                }}>
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <div key={location.pathname} className="page-content">
                    {children}
                </div>
            </main>

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
                title="Log Out"
                message="Are you sure you want to log out?"
                confirmText="Log Out"
                isDanger={true}
            />
        </div>
    );
};

export default AppLayout;
