import api from './api';

export const parkingService = {
    addFloor: async (floorData) => {
        const response = await api.post('/parking/addFloor', floorData);
        return response.data;
    },

    // Placeholder - returns mock data since endpoint doesn't exist
    getAllFloors: async () => {
        const response = await api.get('/parking/floors');
        return response.data.map(item => ({
            id: item.parkingFloor.id,
            floorNumber: item.parkingFloor.floorNumber,
            floorCapacity: item.parkingFloor.floorCapacity,
            availableCapacity: item.parkingFloor.availableCapacity,
            slots: item.parkingFloor.slots
        }));
    },
};
