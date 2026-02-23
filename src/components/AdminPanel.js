import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { parkingService } from '../services/parkingService';
import { userService } from '../services/userService';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('create');
    const [activeSubTab, setActiveSubTab] = useState('users');
    const [activeCreateTab, setActiveCreateTab] = useState('user');
    const [loading, setLoading] = useState(false);

    // Create User Form
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('EMPLOYEE');

    // Create Company Form
    const [companyName, setCompanyName] = useState('');
    const [totalCapacity, setTotalCapacity] = useState('');

    // Add Floor Form
    const [floorNumber, setFloorNumber] = useState('');
    const [floorCapacity, setFloorCapacity] = useState('');
    const [availableCapacity, setAvailableCapacity] = useState('');

    // View Data
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [floors, setFloors] = useState([]);

    useEffect(() => {
        if (activeTab === 'view') {
            loadViewData();
        }
    }, [activeTab]);

    const loadViewData = async () => {
        setLoading(true);
        try {
            const [usersData, companiesData, floorsData] = await Promise.all([
                userService.getAllUsers(),
                companyService.getAllCompanies(),
                parkingService.getAllFloors(),
            ]);
            setUsers(usersData);
            setCompanies(companiesData);
            setFloors(floorsData);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!userName || !email || !password || !company) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await authService.createUser({ userName, email, password, company, role });
            toast.success('User created successfully!');
            setUserName('');
            setEmail('');
            setPassword('');
            setCompany('');
            setRole('EMPLOYEE');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        if (!companyName || !totalCapacity) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await companyService.createCompany({ companyName, totalCapacity: Number(totalCapacity) });
            toast.success('Company created successfully!');
            setCompanyName('');
            setTotalCapacity('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create company');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFloor = async (e) => {
        e.preventDefault();
        if (!floorNumber || !floorCapacity || !availableCapacity) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await parkingService.addFloor({
                floorNumber: Number(floorNumber),
                floorCapacity: Number(floorCapacity),
                availableCapacity: Number(availableCapacity),
            });
            toast.success('Floor added successfully!');
            setFloorNumber('');
            setFloorCapacity('');
            setAvailableCapacity('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add floor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-panel">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    Create Resources
                </button>
                <button
                    className={`tab ${activeTab === 'view' ? 'active' : ''}`}
                    onClick={() => setActiveTab('view')}
                >
                    View All
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="create-section">
                    <div className="sub-tabs">
                        <button
                            className={`sub-tab ${activeCreateTab === 'user' ? 'active' : ''}`}
                            onClick={() => setActiveCreateTab('user')}
                        >
                            User
                        </button>
                        <button
                            className={`sub-tab ${activeCreateTab === 'company' ? 'active' : ''}`}
                            onClick={() => setActiveCreateTab('company')}
                        >
                            Company
                        </button>
                        <button
                            className={`sub-tab ${activeCreateTab === 'floor' ? 'active' : ''}`}
                            onClick={() => setActiveCreateTab('floor')}
                        >
                            Floor
                        </button>
                    </div>

                    {/* Create User Row */}
                    {activeCreateTab === 'user' && (
                        <div className="create-row">
                            <div className="resource-info">
                                <h3>👤 User Management</h3>
                                <p>Register new employees or administrators into the system. Each user must be assigned to an existing company to manage their specific parking permissions.</p>
                            </div>
                            <div className="resource-form">
                                <div className="glass-card card">
                                    <div className="card-header">
                                        <h4 className="card-title" style={{ fontSize: 'var(--font-size-lg)' }}>Create User</h4>
                                    </div>
                                    <form onSubmit={handleCreateUser}>
                                        <div className="grid grid-2">
                                            <div className="input-group">
                                                <label className="input-label">User Name</label>
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    placeholder="Enter user name"
                                                    value={userName}
                                                    onChange={(e) => setUserName(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="input-field"
                                                    placeholder="Enter email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-2">
                                            <div className="input-group">
                                                <label className="input-label">Password</label>
                                                <input
                                                    type="password"
                                                    className="input-field"
                                                    placeholder="Enter password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Company</label>
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    placeholder="Enter company name"
                                                    value={company}
                                                    onChange={(e) => setCompany(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Role</label>
                                            <select
                                                className="input-field"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="EMPLOYEE">EMPLOYEE</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                            {loading ? 'Creating...' : 'Create User'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create Company Row - Reversed */}
                    {activeCreateTab === 'company' && (
                        <div className="create-row reverse">
                            <div className="resource-info">
                                <h3>🏢 Company Setup</h3>
                                <p>Add new corporate entities. Defining a company allows you to allocate specific parking resources and group users for easier management and billing.</p>
                            </div>
                            <div className="resource-form">
                                <div className="glass-card card">
                                    <div className="card-header">
                                        <h4 className="card-title" style={{ fontSize: 'var(--font-size-lg)' }}>Create Company</h4>
                                    </div>
                                    <form onSubmit={handleCreateCompany}>
                                        <div className="input-group">
                                            <label className="input-label">Company Name</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Enter company name"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Total Capacity</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                placeholder="Enter total capacity"
                                                value={totalCapacity}
                                                onChange={(e) => setTotalCapacity(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                            {loading ? 'Creating...' : 'Create Company'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Floor Row */}
                    {activeCreateTab === 'floor' && (
                        <div className="create-row">
                            <div className="resource-info">
                                <h3>🏗️ Infrastructure (Floors)</h3>
                                <p>Configure the physical parking space. Adding floors allows the system to organize slots and provide accurate navigation instructions to users.</p>
                            </div>
                            <div className="resource-form">
                                <div className="glass-card card">
                                    <div className="card-header">
                                        <h4 className="card-title" style={{ fontSize: 'var(--font-size-lg)' }}>Add Parking Floor</h4>
                                    </div>
                                    <form onSubmit={handleAddFloor}>
                                        <div className="grid grid-3">
                                            <div className="input-group">
                                                <label className="input-label">Floor #</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={floorNumber}
                                                    onChange={(e) => setFloorNumber(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Capacity</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={floorCapacity}
                                                    onChange={(e) => setFloorCapacity(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Available</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={availableCapacity}
                                                    onChange={(e) => setAvailableCapacity(e.target.value)}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                            {loading ? 'Adding...' : 'Add Floor'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'view' && (
                <div className="view-section">
                    <div className="sub-tabs">
                        <button
                            className={`sub-tab ${activeSubTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`sub-tab ${activeSubTab === 'companies' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('companies')}
                        >
                            Companies
                        </button>
                        <button
                            className={`sub-tab ${activeSubTab === 'floors' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('floors')}
                        >
                            Floors
                        </button>
                    </div>

                    {loading && (
                        <div className="flex-center mt-lg">
                            <span className="spinner"></span>
                        </div>
                    )}

                    {!loading && activeSubTab === 'users' && (
                        <div className="glass-card card">
                            <div className="card-header">
                                <h3 className="card-title">👥 All Users</h3>
                            </div>
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Company</th>
                                            <th>Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.userName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.company}</td>
                                                <td>
                                                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-employee'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!loading && activeSubTab === 'companies' && (
                        <div className="glass-card card">
                            <div className="card-header">
                                <h3 className="card-title">🏢 All Companies</h3>
                            </div>
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Company Name</th>
                                            <th>Total Capacity</th>
                                            <th>Available</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map((comp) => (
                                            <tr key={comp.id}>
                                                <td>{comp.id}</td>
                                                <td>{comp.companyName}</td>
                                                <td>{comp.totalCapacity}</td>
                                                <td>{comp.availableCapacity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!loading && activeSubTab === 'floors' && (
                        <div className="glass-card card">
                            <div className="card-header">
                                <h3 className="card-title">🏗️ All Parking Floors</h3>
                            </div>
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Floor Number</th>
                                            <th>Total Capacity</th>
                                            <th>Available</th>
                                            <th>Occupancy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {floors.map((floor) => (
                                            <tr key={floor.id}>
                                                <td>{floor.id}</td>
                                                <td>Floor {floor.floorNumber}</td>
                                                <td>{floor.floorCapacity}</td>
                                                <td>{floor.availableCapacity}</td>
                                                <td>
                                                    {Math.round(((floor.floorCapacity - floor.availableCapacity) / floor.floorCapacity) * 100)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
