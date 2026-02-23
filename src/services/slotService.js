import api from './api';

export const slotService = {
    bookSlot: async (userId) => {
        const response = await api.post(`/slot/book/${userId}`);
        return response.data;
    },

    releaseSlot: async (slotId) => {
        const response = await api.patch(`/slot/update/${slotId}`);
        return response.data;
    },

    // Placeholder - returns mock data since endpoint doesn't exist
    getUserBookings: async (userId) => {
        const response = await api.get(`/slot/user/${userId}`);
        return response.data.map(slot => ({
            id: slot.id,
            floorNumber: slot.parkingFloor.floorNumber,
            slotNumber: slot.slotNumber,
            bookedAt: slot.createdOn,
            status: slot.status
        }));
    },

    getBookingHistory: async (userId) => {
        const id = userId || 1;
        const response = await api.get(`/user/${id}/history`);
        console.log('slotService: Raw history data from API:', response.data);
        return response.data.map(record => ({
            id: record.id,
            slotId: record.slotId,
            floorNumber: record.floorNumber,
            slotNumber: record.slotNumber,
            bookedAt: record.bookingDate,
            status: 'COMPLETED' // History records are typically completed/past bookings
        }));
    },
};
