import { apiRequest } from './api';

export const appointmentsService = {
    getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.search) query.set('search', params.search);
        if (params.status) query.set('status', params.status);
        if (params.doctor_id) query.set('doctor_id', params.doctor_id);
        if (params.date) query.set('date', params.date);
        const qs = query.toString();
        return apiRequest(`/appointments${qs ? `?${qs}` : ''}`);
    },
    getById(id) {
        return apiRequest(`/appointments/${id}`);
    },
    create(data) {
        return apiRequest('/appointments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    update(id, data) {
        return apiRequest(`/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    remove(id) {
        return apiRequest(`/appointments/${id}`, {
            method: 'DELETE',
        });
    },
};