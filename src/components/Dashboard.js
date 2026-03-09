import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminPanel from './AdminPanel';
import EmployeePanel from './EmployeePanel';
import CompanyPanel from './CompanyPanel';

const Dashboard = () => {
    const { user, logout, isAdmin, isCompanyAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const renderPanel = () => {
        if (isAdmin()) return <AdminPanel />;
        if (isCompanyAdmin()) return <CompanyPanel />;
        return <EmployeePanel />;
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
                        <span className={`badge ${isAdmin() ? 'badge-admin' : isCompanyAdmin() ? 'badge-primary' : 'badge-employee'} ml-sm`} style={{ marginLeft: '0.5rem' }}>
                            {user?.role}
                        </span>
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="dashboard-content">
                {renderPanel()}
            </div>
        </div>
    );
};

export default Dashboard;
