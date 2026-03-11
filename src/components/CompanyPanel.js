import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';
import { slotService } from '../services/slotService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { companyService } from '../services/companyService';
import noResultsImg from '../assets/no-results.png';

const CompanyPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [slots, setSlots] = useState([]);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        role: 'EMPLOYEE'
    });
    const [editingUserId, setEditingUserId] = useState(null);

    const companyId = user?.companyId || (typeof user?.company === 'object' ? user?.company?.id : user?.company);

    const loadData = useCallback(async () => {
        if (!companyId) {
            console.log('CompanyPanel: No companyId found for user:', user);
            return;
        }

        console.log('CompanyPanel: Loading data for companyId:', companyId);
        setLoading(true);
        try {
            const [usersData, slotsData, compData] = await Promise.all([
                userService.getUsersByCompany(companyId),
                slotService.getSlotsByCompany(companyId),
                companyService.getCompanyById(companyId)
            ]);
            console.log('CompanyPanel: Received users:', usersData.length, usersData);
            console.log('CompanyPanel: Received slots:', slotsData.length, slotsData);
            setUsers(usersData);
            setSlots(slotsData);
            setCompanyDetails(compData);
        } catch (error) {
            console.error('CompanyPanel: Error loading data:', error);
            toast.error('Failed to load company data');
        } finally {
            setLoading(false);
        }
    }, [companyId, user]);

    useEffect(() => {
        if (companyId) {
            loadData();
        }
    }, [companyId, loadData]);

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setFormData({ userName: '', email: '', password: '', role: 'EMPLOYEE' });
        setShowUserModal(true);
    };

    const handleOpenEditModal = (userToEdit) => {
        setIsEditing(true);
        setEditingUserId(userToEdit.id);
        setFormData({
            userName: userToEdit.userName,
            email: userToEdit.email,
            password: '', // Don't show password
            role: userToEdit.role
        });
        setShowUserModal(true);
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                await userService.updateUser(editingUserId, {
                    userName: formData.userName,
                    email: formData.email,
                    role: formData.role,
                    company: companyDetails?.companyName
                });
                toast.success('User updated successfully');
            } else {
                await authService.createUser({
                    ...formData,
                    company: companyDetails?.companyName // Use fetched string companyName
                });
                toast.success('User created successfully');
            }
            setShowUserModal(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        setLoading(true);
        try {
            await userService.deleteUser(editingUserId);
            toast.success('User deleted successfully');
            setShowUserModal(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseSlot = async (slotId) => {
        if (!window.confirm('Are you sure you want to release this slot?')) return;
        setLoading(true);
        try {
            await slotService.releaseSlot(slotId);
            toast.success('Slot released successfully');
            loadData();
        } catch (error) {
            toast.error('Failed to release slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="company-panel">
            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <span className="stat-label">Company Users</span>
                    <span className="stat-value">{users?.length || 0}</span>
                </div>
                <div className="glass-card stat-card" style={{ borderColor: 'var(--secondary)' }}>
                    <span className="stat-label">Total Slots</span>
                    <span className="stat-value">{companyDetails?.totalCapacity || 0}</span>
                </div>
                <div className="glass-card stat-card" style={{ borderColor: 'var(--success)' }}>
                    <span className="stat-label">Available Slots</span>
                    <span className="stat-value">{companyDetails?.availableCapacity || 0}</span>
                </div>
                <div className="glass-card stat-card" style={{ borderColor: 'var(--danger)' }}>
                    <span className="stat-label">Occupied</span>
                    <span className="stat-value">{(companyDetails?.totalCapacity || 0) - (companyDetails?.availableCapacity || 0)}</span>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
                <button
                    className={`tab ${activeTab === 'slots' ? 'active' : ''}`}
                    onClick={() => setActiveTab('slots')}
                >
                    Company Slots
                </button>
            </div>

            <div className="view-section">
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {activeTab === 'users' && (
                        <button className="btn btn-primary ml-md" onClick={handleOpenCreateModal}>
                            + Create User
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="flex-center mt-lg">
                        <span className="spinner"></span>
                    </div>
                )}

                {!loading && activeTab === 'users' && (
                    <div className="glass-card card">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u =>
                                        u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).length > 0 ? (
                                        users.filter(u =>
                                            u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(u => (
                                            <tr key={u.id}>
                                                <td>{u.userName}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-employee'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn-icon" onClick={() => handleOpenEditModal(u)}>✏️</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                <div className="illustration-container">
                                                    <img src={noResultsImg} alt="No results" className="empty-state-img" />
                                                    <p>No users found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'slots' && (
                    <div className="glass-card card">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Floor</th>
                                        <th>Slot #</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slots.filter(s =>
                                        String(s.slotNumber).includes(searchTerm) ||
                                        String(s.floorNumber).includes(searchTerm)
                                    ).length > 0 ? (
                                        slots.filter(s =>
                                            String(s.slotNumber).includes(searchTerm) ||
                                            String(s.floorNumber).includes(searchTerm)
                                        ).map(s => (
                                            <tr key={s.id}>
                                                <td>Floor {s.floorNumber}</td>
                                                <td>{s.slotNumber}</td>
                                                <td>
                                                    <span className={`badge ${s.status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {(s.status === 'BOOKED' || s.status === 'OCCUPIED') && (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleReleaseSlot(s.id)}
                                                        >
                                                            Release
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                <div className="illustration-container">
                                                    <img src={noResultsImg} alt="No results" className="empty-state-img" />
                                                    <p>No slots found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="modal-overlay">
                    <div className="glass-card card modal-content">
                        <div className="modal-header">
                            <h3 className="card-title">{isEditing ? 'Edit User' : 'Create User'}</h3>
                            <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitUser}>
                            <div className="input-group">
                                <label className="input-label">User Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.userName}
                                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            {!isEditing && (
                                <div className="input-group">
                                    <label className="input-label">Password</label>
                                    <input
                                        type="password"
                                        className="input-field"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <div className="input-group">
                                <label className="input-label">Role</label>
                                <select
                                    className="input-field"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="EMPLOYEE">EMPLOYEE</option>
                                    <option value="COMPANY_ADMIN">COMPANY_ADMIN</option>
                                </select>
                            </div>
                            <div className="flex gap-md mt-lg">
                                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save User'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleDeleteUser}
                                        disabled={loading}
                                        style={{ backgroundColor: 'var(--danger)', color: 'white' }}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyPanel;
