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
        console.log('slotService: Raw bookings response:', response.data);
        return response.data.map(slot => {
            // Log each slot to see its specific structure
            console.log(`slotService: Mapping slot ${slot.id}`, slot);
            return {
                id: slot.id,
                floorNumber: slot.parkingFloor?.floorNumber || 'N/A',
                slotNumber: slot.slotNumber,
                bookedAt: slot.createdOn,
                status: slot.status,
                // Try all possible user ID locations
                bookedByUserId: slot.user?.id || slot.user?.userId || slot.userId || slot.bookedByUserId
            };
        });
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
            status: 'COMPLETED',
            bookedByUserId: record.userId // Capture owner ID
        }));
    },
    getSlotsByCompany: async (companyId) => {
        const response = await api.get(`/slot/company/${companyId}`);
        console.log('slotService: Company slots response:', response.data);
        return response.data.map(item => {
            const slot = item.slot || item; // Robust handle for nested/flat
            return {
                id: slot.id,
                floorNumber: slot.parkingFloor?.floorNumber || slot.floorNumber || 'N/A',
                slotNumber: slot.slotNumber,
                status: slot.status,
                bookedByUserId: slot.occupantUserId || slot.userId || slot.bookedByUserId,
                vehicleType: slot.vehicleType || 'N/A'
            };
        });
    },
};
