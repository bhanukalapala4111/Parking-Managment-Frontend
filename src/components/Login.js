import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assets/login-bg.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const data = await authService.login(email, password);

            const userData = {
                id: data.id || data.userId || data.user?.id,
                userName: data.userName || data.user?.userName,
                email: email,
                role: data.role || data.user?.role,
            };

            login(userData, data.token);
            toast.success(`Welcome back, ${data.userName || 'User'}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper login-page" style={{ backgroundImage: `url(${loginBg})` }}>
            <div className="auth-card glass-card">
                <div className="text-center mb-lg">
                    <h1 className="card-title" style={{ fontSize: 'var(--font-size-3xl)' }}>
                        🅿️ Parking Manager
                    </h1>
                    <p className="text-secondary mt-sm">Sign in to manage your parking</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? (
                            <span className="flex-center gap-sm">
                                <span className="spinner"></span>
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="text-center mt-md">
                    <p className="text-secondary">
                        Need help? Contact your administrator
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
