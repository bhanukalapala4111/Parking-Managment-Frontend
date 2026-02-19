import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { parkingService } from '../services/parkingService';
import { userService } from '../services/userService';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('create');
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
        <div>
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
                <div className="grid grid-2">
                    {/* Create User */}
                    <div className="glass-card card">
                        <div className="card-header">
                            <h3 className="card-title">👤 Create User</h3>
                        </div>
                        <form onSubmit={handleCreateUser}>
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

                    {/* Create Company */}
                    <div className="glass-card card">
                        <div className="card-header">
                            <h3 className="card-title">🏢 Create Company</h3>
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

                    {/* Add Floor */}
                    <div className="glass-card card">
                        <div className="card-header">
                            <h3 className="card-title">🏗️ Add Parking Floor</h3>
                        </div>
                        <form onSubmit={handleAddFloor}>
                            <div className="input-group">
                                <label className="input-label">Floor Number</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Enter floor number"
                                    value={floorNumber}
                                    onChange={(e) => setFloorNumber(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Floor Capacity</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Enter floor capacity"
                                    value={floorCapacity}
                                    onChange={(e) => setFloorCapacity(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Available Capacity</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Enter available capacity"
                                    value={availableCapacity}
                                    onChange={(e) => setAvailableCapacity(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Floor'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'view' && (
                <div className="grid" style={{ gap: 'var(--spacing-lg)' }}>
                    {/* Users Table */}
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

                    {/* Companies Table */}
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((comp) => (
                                        <tr key={comp.id}>
                                            <td>{comp.id}</td>
                                            <td>{comp.companyName}</td>
                                            <td>{comp.totalCapacity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Floors Table */}
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
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
