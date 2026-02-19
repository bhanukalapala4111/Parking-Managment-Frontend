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
        // TODO: Replace with actual API call when endpoint is available
        // const response = await api.get(`/slot/user/${userId}`);
        // return response.data;

        return [
            { id: 101, floorNumber: 1, slotNumber: 'A-15', bookedAt: '2026-02-18T10:30:00', status: 'ACTIVE' },
            { id: 102, floorNumber: 2, slotNumber: 'B-23', bookedAt: '2026-02-17T14:20:00', status: 'ACTIVE' },
        ];
    },
};
