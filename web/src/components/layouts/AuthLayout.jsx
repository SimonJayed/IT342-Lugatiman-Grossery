import React from 'react';
import { useLocation } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, illustration }) => {
    const location = useLocation();
    return (
        <div className="auth-wrap">
            <div className="auth-panel">
                <div className="auth-floats">
                    <div className="auth-float"></div>
                    <div className="auth-float"></div>
                    <div className="auth-float"></div>
                </div>
                <div className="auth-panel-logo">Gross<span>ery</span></div>
                <div className="auth-panel-tagline">Plan smarter. Waste less. Live fresher.</div>
            </div>
            <div className="auth-form-side">
                <div className="auth-card" key={location.pathname}>
                    {title && <h2>{title}</h2>}
                    {subtitle && <p>{subtitle}</p>}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
