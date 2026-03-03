import api from './api';

export const userService = {
    // Placeholder - returns mock data since endpoint doesn't exist
    getAllUsers: async () => {
        const response = await api.get('/user/all');
        return response.data.map(item => ({
            id: item.user.id,
            userName: item.user.userName,
            email: item.user.email,
            company: item.user.companyId, // User model uses companyId
            role: item.user.role
        }));
    },
    updateUser: async (id, userData) => {
        const response = await api.patch(`/user/update/${id}`, userData);
        return response.data;
    },
};
