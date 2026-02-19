import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { slotService } from '../services/slotService';
import { useAuth } from '../context/AuthContext';

const EmployeePanel = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);

    // Book Slot Form
    const [userId, setUserId] = useState('');

    // Release Slot Form
    const [slotId, setSlotId] = useState('');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await slotService.getUserBookings(user?.id || 1);
            setBookings(data);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        }
    };

    const handleBookSlot = async (e) => {
        e.preventDefault();
        if (!userId) {
            toast.error('Please enter user ID');
            return;
        }

        setLoading(true);
        try {
            const slotId = await slotService.bookSlot(userId);
            toast.success(`Slot booked successfully! Slot ID: ${slotId}`);
            setUserId('');
            loadBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to book slot');
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseSlot = async (e) => {
        e.preventDefault();
        if (!slotId) {
            toast.error('Please enter slot ID');
            return;
        }

        setLoading(true);
        try {
            await slotService.releaseSlot(slotId);
            toast.success('Slot released successfully!');
            setSlotId('');
            loadBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to release slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="grid grid-2 mb-lg">
                {/* Book Slot */}
                <div className="glass-card card">
                    <div className="card-header">
                        <h3 className="card-title">🅿️ Book Parking Slot</h3>
                    </div>
                    <form onSubmit={handleBookSlot}>
                        <div className="input-group">
                            <label className="input-label">User ID</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Enter your user ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="btn btn-success w-full" disabled={loading}>
                            {loading ? 'Booking...' : 'Book Slot'}
                        </button>
                    </form>
                </div>

                {/* Release Slot */}
                <div className="glass-card card">
                    <div className="card-header">
                        <h3 className="card-title">🚗 Release Parking Slot</h3>
                    </div>
                    <form onSubmit={handleReleaseSlot}>
                        <div className="input-group">
                            <label className="input-label">Slot ID</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Enter slot ID to release"
                                value={slotId}
                                onChange={(e) => setSlotId(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="btn btn-danger w-full" disabled={loading}>
                            {loading ? 'Releasing...' : 'Release Slot'}
                        </button>
                    </form>
                </div>
            </div>

            {/* My Bookings */}
            <div className="glass-card card">
                <div className="card-header">
                    <h3 className="card-title">📋 My Active Bookings</h3>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Slot ID</th>
                                <th>Floor</th>
                                <th>Slot Number</th>
                                <th>Booked At</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.id}</td>
                                        <td>Floor {booking.floorNumber}</td>
                                        <td>{booking.slotNumber}</td>
                                        <td>{new Date(booking.bookedAt).toLocaleString()}</td>
                                        <td>
                                            <span className="badge badge-employee">{booking.status}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted">
                                        No active bookings
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeePanel;
