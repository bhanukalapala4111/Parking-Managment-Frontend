import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import { slotService } from '../services/slotService';
import { useAuth } from '../context/AuthContext';

const EmployeePanel = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [history, setHistory] = useState([]);

    // Book Slot Form
    const [userId, setUserId] = useState('');
    const [vehicleType, setVehicleType] = useState('CAR');

    // Section Toggles
    const [showActive, setShowActive] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    // QR Code Modal
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedBookingForQR, setSelectedBookingForQR] = useState(null);



    const loadBookings = useCallback(async (explicitId) => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const id = explicitId || user?.id || user?.userId || user?.user?.id || storedUser.id || storedUser.userId;

        if (!id) {
            console.warn('EmployeePanel: Cannot load bookings, no valid ID found');
            return;
        }

        try {
            const data = await slotService.getUserBookings(id);
            console.log('EmployeePanel: Data from service:', data);

            // Trusting API response as per user: "getuserbookings by user id give the active bookings for the user"
            setBookings(data || []);
        } catch (error) {
            console.error('EmployeePanel: Failed to load bookings:', error);
            toast.error('Failed to load active bookings');
        }
    }, [user]);

    const loadHistory = useCallback(async (explicitId) => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const id = explicitId || user?.id || user?.userId || user?.user?.id || storedUser.id || storedUser.userId;

        if (!id) {
            console.warn('EmployeePanel: Cannot load history, no valid ID found');
            return;
        }

        try {
            const data = await slotService.getBookingHistory(id);
            console.log('EmployeePanel: History data from service:', data);

            // Trusting API response directly
            setHistory(data || []);
        } catch (error) {
            console.error('EmployeePanel: Failed to load history:', error);
        }
    }, [user]);

    useEffect(() => {
        // Try all possible sources for the ID
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const id = user?.id || user?.userId || user?.user?.id || storedUser.id || storedUser.userId;

        if (id) {
            setUserId(id.toString());
            loadBookings(id);
            loadHistory(id);
        }
    }, [user, loadBookings, loadHistory]);

    const handleBookSlot = async (e) => {
        e.preventDefault();
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const idToBook = userId || user?.id || user?.userId || user?.user?.id || storedUser.id || storedUser.userId;

        console.log('EmployeePanel: handleBookSlot button pressed');
        console.log('EmployeePanel: State userId:', userId);
        console.log('EmployeePanel: Context user object:', user);
        console.log('EmployeePanel: localStorage user object:', storedUser);
        console.log('EmployeePanel: Calculated idToBook:', idToBook);

        if (!idToBook) {
            toast.error('User ID not found. Please try logging out and back in.');
            return;
        }

        // Restriction: Only one slot per employee
        if (bookings.length > 0) {
            toast.warning('You already have an active booking. Please release it before booking a new one.');
            return;
        }

        console.log('EmployeePanel: Calling bookSlot with ID:', idToBook);
        setLoading(true);
        try {
            const slotId = await slotService.bookSlot(idToBook, vehicleType);
            toast.success(`Slot booked successfully! Slot ID: ${slotId}`);
            loadBookings();
            loadHistory();
        } catch (error) {
            console.error('EmployeePanel: Booking failed:', error);
            toast.error(error.response?.data?.message || 'Failed to book slot');
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseSlot = async (targetSlotId) => {
        if (!targetSlotId) {
            toast.error('Invalid slot ID');
            return;
        }

        if (!window.confirm(`Are you sure you want to release slot ID ${targetSlotId}?`)) {
            return;
        }

        setLoading(true);
        try {
            await slotService.releaseSlot(targetSlotId);
            toast.success('Slot released successfully!');
            loadBookings();
            loadHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to release slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <span className="stat-label">Active Bookings</span>
                    <span className="stat-value">{bookings.length}</span>
                </div>
                <div className="glass-card stat-card" style={{ borderColor: 'var(--secondary)' }}>
                    <span className="stat-label">Total History</span>
                    <span className="stat-value">{history.length}</span>
                </div>
            </div>

            <div className="mb-lg" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                {/* Book Slot - Reduced width and left aligned */}
                <div className="glass-card card" style={{ maxWidth: '400px', width: '100%', margin: '0' }}>
                    <div className="card-header">
                        <h3 className="card-title">🅿️ Book Parking Slot</h3>
                    </div>
                    <form onSubmit={handleBookSlot}>
                        <div className="input-group">
                            <label className="input-label">Select Vehicle Type</label>
                            <select
                                className="input-field"
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                disabled={loading}
                            >
                                <option value="CAR">🚗 Four Wheeler (Car)</option>
                                <option value="BIKE">🏍️ Two Wheeler (Bike)</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-success w-full" disabled={loading}>
                            {loading ? 'Booking...' : 'Book Slot'}
                        </button>
                    </form>
                </div>
            </div>

            {/* My Bookings */}
            <div className={`glass-card card mb-lg collapsible-section ${showActive ? 'is-expanded' : ''}`}>
                <div
                    className="card-header clickable-header"
                    onClick={() => setShowActive(!showActive)}
                >
                    <h3 className="card-title">
                        📋 My Active Bookings
                        <span className="toggle-icon">{showActive ? '🔼' : '🔽'}</span>
                    </h3>
                </div>
                {showActive && (
                    <div className="table-wrapper">
                        {bookings.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Slot ID</th>
                                        <th>Floor</th>
                                        <th>Slot Number</th>
                                        <th>Booked At</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td>{booking.id}</td>
                                            <td>Floor {booking.floorNumber}</td>
                                            <td>
                                                <span
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: 'var(--primary)',
                                                        textDecoration: 'underline',
                                                        fontWeight: 'bold'
                                                    }}
                                                    onClick={() => {
                                                        setSelectedBookingForQR(booking);
                                                        setShowQRModal(true);
                                                    }}
                                                    title="View QR Pass"
                                                >
                                                    {booking.slotNumber} 📱
                                                </span>
                                            </td>
                                            <td>{new Date(booking.bookedAt).toLocaleString()}</td>
                                            <td>
                                                <span className="badge badge-employee">{booking.status}</span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleReleaseSlot(booking.slotId || booking.id)}
                                                    disabled={loading}
                                                >
                                                    Release
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="illustration-container">
                                <p className="illustration-text">You don't have any active bookings right now.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={`glass-card card collapsible-section ${showHistory ? 'is-expanded' : ''}`}>
                <div
                    className="card-header clickable-header"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <h3 className="card-title">
                        🕰️ Booking History
                        <span className="toggle-icon">{showHistory ? '🔼' : '🔽'}</span>
                    </h3>
                </div>
                {showHistory && (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Slot ID</th>
                                    <th>Floor</th>
                                    <th>Slot Number</th>
                                    <th>Booking Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? (
                                    history.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.slotId}</td>
                                            <td>Floor {record.floorNumber}</td>
                                            <td>{record.slotNumber}</td>
                                            <td>{new Date(record.bookedAt).toLocaleString()}</td>
                                            <td>
                                                <span className="badge badge-admin">{record.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">
                                            No history found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* QR Code Modal for specific booking */}
            {showQRModal && selectedBookingForQR && (
                <div className="modal-overlay">
                    <div className="glass-card card modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h3 className="card-title">Entry Pass QR</h3>
                            <button className="close-btn" onClick={() => setShowQRModal(false)}>×</button>
                        </div>
                        <div className="flex-col flex-center p-md">
                            <p className="mb-md text-muted">Show this QR code at the gate to verify your booking.</p>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block' }}>
                                <QRCode
                                    value={JSON.stringify({
                                        type: 'PARKING_PASS',
                                        bookingId: selectedBookingForQR.id,
                                        slotId: selectedBookingForQR.slotId,
                                        slotNumber: selectedBookingForQR.slotNumber,
                                        floorNumber: selectedBookingForQR.floorNumber,
                                        userId: userId,
                                        bookedAt: selectedBookingForQR.bookedAt,
                                        status: selectedBookingForQR.status
                                    })}
                                    size={200}
                                    fgColor="var(--primary)"
                                />
                            </div>
                            <div className="mt-md">
                                <p><strong>Slot:</strong> Floor {selectedBookingForQR.floorNumber} - Slot {selectedBookingForQR.slotNumber}</p>
                                <p><strong>Booking Time:</strong> {new Date(selectedBookingForQR.bookedAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeePanel;
