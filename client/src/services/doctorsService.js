import { apiRequest } from './api';

export const doctorsService = {
    getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.search) query.set('search', params.search);
        if (params.active !== undefined && params.active !== '') query.set('active', params.active);
        const qs = query.toString();
        return apiRequest(`/doctors${qs ? `?${qs}` : ''}`);
    },
    getById(id) {
        return apiRequest(`/doctors/${id}`);
    },
    create(data) {
        return apiRequest('/doctors', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    update(id, data) {
        return apiRequest(`/doctors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    remove(id) {
        return apiRequest(`/doctors/${id}`, {
            method: 'DELETE',
        });
    },
};