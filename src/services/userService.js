import api from './api';

export const userService = {
    // Placeholder - returns mock data since endpoint doesn't exist
    getAllUsers: async () => {
        const response = await api.get('/user/all');
        return response.data.map(item => {
            const u = item.user || item;
            return {
                id: u.id,
                userName: u.userName,
                email: u.email,
                company: u.companyId,
                role: u.role
            };
        });
    },
    updateUser: async (id, userData) => {
        const response = await api.patch(`/user/update/${id}`, userData);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.delete(`/user/delete/${id}`);
        return response.data;
    },
    getUsersByCompany: async (companyId) => {
        const response = await api.get(`/user/company/${companyId}`);
        return response.data.map(item => {
            const u = item.user || item;
            return {
                id: u.id,
                userName: u.userName,
                email: u.email,
                company: u.companyId,
                role: u.role
            };
        });
    },
};
