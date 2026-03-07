import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { addToast } = useToast();

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
            </form>

            <div className="auth-switch">
                Don't have an account? <Link to="/register">Sign up for free</Link>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;
