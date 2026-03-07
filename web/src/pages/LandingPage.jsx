import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="landing active" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <nav className="landing-nav">
                <div className="landing-logo">Gross<span>ery</span></div>
                <div className="landing-nav-links">
                    <Link to="/login" className="btn-outline">
                        Log in
                    </Link>
                    <Link to="/register" className="btn-solid">
                        Get started
                    </Link>
                </div>
            </nav>
            <div className="hero">
                <div className="hero-inner">
                    <div className="hero-tag">🌿 Smarter Grocery Planning</div>
                    <h1>Track what you buy.<br /><em>Reduce what you waste.</em></h1>
                    <p>Plan your monthly grocery consumption, log actual usage, and get clear analytics — all in one clean, simple dashboard.</p>
                    <div className="hero-btns">
                        <Link to="/register" className="hero-btn-main">
                            Start for free
                        </Link>
                        <Link to="/login" className="hero-btn-sec">
                            Sign in
                        </Link>
                    </div>
                    <div className="features">
                        <div className="feat"><div className="feat-icon">📊</div><div className="feat-title">Analytics</div><div className="feat-desc">Expected vs actual comparison</div></div>
                        <div className="feat"><div className="feat-icon">⏰</div><div className="feat-title">Expiry Alerts</div><div className="feat-desc">Never waste expired stock</div></div>
                        <div className="feat"><div className="feat-icon">🛒</div><div className="feat-title">Item Lists</div><div className="feat-desc">Manage all grocery items</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
