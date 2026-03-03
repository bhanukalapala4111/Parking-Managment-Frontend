import api from './api';

export const slotService = {
    bookSlot: async (userId, vehicleType) => {
        const response = await api.post(`/slot/book/${userId}?vehicleType=${vehicleType}`);
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
        if (!userId) return [];
        const response = await api.get(`/user/${userId}/history`);
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
