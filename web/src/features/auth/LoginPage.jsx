import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from './AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const { addToast } = useToast();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    // Load saved email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Persist user info if rememberMe is checked
            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
            } else {
                localStorage.removeItem('remembered_email');
            }

            addToast("Login successful!", "success");
            navigate("/dashboard");
        } else {
            addToast(result.message, "error");
        }
        setLoading(false);
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Please enter your details to sign in"
            illustration="login"
        >
            <form onSubmit={handleLogin} noValidate>

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div className="auth-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <label className="remember-me" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ width: 'auto', margin: 0 }}
                        />
                        Remember me
                    </label>
                    <a href="#" style={{ fontSize: '0.85rem', color: 'var(--muted)', textDecoration: 'none' }}>Forgot password?</a>
                </div>

                <Button fullWidth type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    <span style={{ margin: '0 10px' }}>or continue with</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>

                <a 
                    href="http://localhost:8080/oauth2/authorization/google" 
                    className="btn-secondary" 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '10px', 
                        width: '100%', 
                        textDecoration: 'none',
                        padding: '10px'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184L12.048 13.56c-.802.537-1.826.854-3.048.854-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                        <path fill="#FBBC05" d="M3.964 10.703c-.18-.537-.282-1.11-.282-1.703s.102-1.166.282-1.703V4.965H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.035l3.007-2.332z"/>
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.965L3.964 7.298c.708-2.127 2.692-3.718 5.036-3.718z"/>
                    </svg>
                    Google
                </a>
            </form>

            <div className="auth-switch">
                Don't have an account? <Link to="/register">Sign up for free</Link>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;
