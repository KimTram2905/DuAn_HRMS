import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const forgotPassword = async (email) => {
        return await api.post('/auth/forgot-password', { email });
    };

    const resetPassword = async (token, newPassword, confirmPassword) => {
        return await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, forgotPassword, resetPassword, loading }}>
            {children}
        </AuthContext.Provider>
    );
};