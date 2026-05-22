import { createContext, useState, useEffect, useContext } from 'react';
import api from '../../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const authData = response.data.data;
            if (authData && authData.accessToken) {
                localStorage.setItem("user", JSON.stringify(authData));
                setUser(authData);
            }
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    };

    const register = async (firstName, lastName, email, password) => {
        try {
            await api.post('/auth/register', { firstName, lastName, email, password });
            return { success: true };
        } catch (error) {
            console.error("Registration failed:", error);
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const loginWithToken = async (token) => {
        try {
            // Save token temporarily to make the /me call
            const tempUser = { accessToken: token, tokenType: 'Bearer' };
            localStorage.setItem("user", JSON.stringify(tempUser));
            
            // Fetch real user data using the /me endpoint
            const response = await api.get('/user/me');
            if (response.data.success) {
                const userData = {
                    ...response.data.data,
                    accessToken: token,
                    tokenType: 'Bearer'
                };
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            localStorage.removeItem("user");
            return { success: false };
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    const checkAuth = async () => {
        setLoading(true);
        try {
            // 1. Check for token in URL (Google OAuth Redirect)
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            
            if (token) {
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
                await loginWithToken(token);
            } else {
                // 2. Check Local Storage
                const storedUser = JSON.parse(localStorage.getItem("user"));
                if (storedUser && storedUser.accessToken) {
                    setUser(storedUser);
                } else {
                    setUser(null);
                }
            }
        } catch (error) {
            console.error("Failed to check auth", error);
            setUser(null);
            localStorage.removeItem("user");
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
