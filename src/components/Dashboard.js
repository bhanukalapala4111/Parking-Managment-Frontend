import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminPanel from './AdminPanel';
import EmployeePanel from './EmployeePanel';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="dashboard-layout">
            <div className="dashboard-header">
                <div>
                    <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '0.25rem' }}>
                        🅿️ Parking Management System
                    </h1>
                    <p className="text-secondary">
                        Welcome back, <strong>{user?.userName}</strong>
                        <span className={`badge ${isAdmin() ? 'badge-admin' : 'badge-employee'} ml-sm`} style={{ marginLeft: '0.5rem' }}>
                            {user?.role}
                        </span>
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="dashboard-content">
                {isAdmin() ? <AdminPanel /> : <EmployeePanel />}
            </div>
        </div>
    );
};

export default Dashboard;
