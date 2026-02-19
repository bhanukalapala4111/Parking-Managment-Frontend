import api from './api';

export const companyService = {
    createCompany: async (companyData) => {
        const response = await api.post('/company/create', companyData);
        return response.data;
    },

    // Placeholder - returns mock data since endpoint doesn't exist
    getAllCompanies: async () => {

        const response = await api.get('/company/all')
        console.log(response.data);
        return response.data.map((item) => {
            return {
                id: item.company.id,
                companyName: item.company.companyName,
                totalCapacity: item.company.totalCapacity,
                availableCapacity: item.company.availableCapacity
            }
        });
    },
};
