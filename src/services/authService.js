import api from './api';

export const authService = {
    login: async (email, password) => {
        console.log(email, password);
        const response = await api.post('/auth/login', { email, password });
        console.log(response.data);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await api.post('/user/create', userData);
        return response.data;
    },
};
