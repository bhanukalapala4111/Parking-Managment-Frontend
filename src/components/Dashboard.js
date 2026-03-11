import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { companyService } from '../services/companyService';
import AdminPanel from './AdminPanel';
import EmployeePanel from './EmployeePanel';
import CompanyPanel from './CompanyPanel';

const Dashboard = () => {
    const { user, logout, isAdmin, isCompanyAdmin } = useAuth();
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        const fetchCompanyName = async () => {
            const companyId = user?.companyId || (typeof user?.company === 'object' ? user?.company?.id : user?.company);
            if (isCompanyAdmin() && companyId) {
                try {
                    const data = await companyService.getCompanyById(companyId);
                    setCompanyName(data.companyName);
                } catch (error) {
                    console.error('Error fetching company name:', error);
                }
            }
        };
        fetchCompanyName();
    }, [user, isCompanyAdmin]);

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
                    {isCompanyAdmin() && companyName ? (
                        <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '0.25rem', color: 'var(--primary)' }}>
                            🏢 {companyName}
                        </h1>
                    ) : (
                        <h1 className="card-title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '0.25rem' }}>
                            🅿️ Parking Management System
                        </h1>
                    )}
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
