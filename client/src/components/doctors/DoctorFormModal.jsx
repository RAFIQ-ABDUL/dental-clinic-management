import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormField from '../common/FormField';
import { Alert } from '../common/StateFeedback';

const INITIAL_FORM = {
    name: '',
    specialization: '',
    phone: '',
    email: '',
    availability: '',
    is_active: true,
};

export default function DoctorFormModal({ isOpen, onClose, onSubmit, initialData, loading }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm(
                initialData
                    ? {
                        name: initialData.name || '',
                        specialization: initialData.specialization || '',
                        phone: initialData.phone || '',
                        email: initialData.email || '',
                        availability: initialData.availability || '',
                        is_active: initialData.is_active ?? true,
                    }
                    : INITIAL_FORM
            );
            setFieldErrors({});
            setSubmitError('');
        }
    }, [isOpen, initialData]);

    const validate = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Doctor name is required.';
        if (!form.specialization.trim()) errors.specialization = 'Specialization is required.';
        if (!form.phone.trim()) errors.phone = 'Phone number is required.';
        if (!form.email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errors.email = 'Enter a valid email address.';
        }
        if (!form.availability.trim()) errors.availability = 'Availability schedule is required.';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setSubmitError('');
            await onSubmit(form);
        } catch (err) {
            setSubmitError(err.message || 'Failed to save doctor.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Doctor' : 'Add New Doctor'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" form="doctor-form" loading={loading}>
                        {initialData ? 'Save Changes' : 'Create Doctor'}
                    </Button>
                </>
            }
        >
            <Alert type="error" message={submitError} onDismiss={() => setSubmitError('')} />
            <form id="doctor-form" onSubmit={handleSubmit} className="form-grid" noValidate>
                <FormField label="Full Name" htmlFor="doc-name" required error={fieldErrors.name}>
                    <input
                        id="doc-name"
                        className="input"
                        placeholder="e.g. Dr. Sarah Jenkins"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </FormField>

                <FormField label="Specialization" htmlFor="doc-spec" required error={fieldErrors.specialization}>
                    <input
                        id="doc-spec"
                        className="input"
                        placeholder="e.g. Orthodontics"
                        value={form.specialization}
                        onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    />
                </FormField>

                <div className="form-row-2">
                    <FormField label="Phone" htmlFor="doc-phone" required error={fieldErrors.phone}>
                        <input
                            id="doc-phone"
                            className="input"
                            placeholder="+1 (555) 201-4410"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </FormField>

                    <FormField label="Email" htmlFor="doc-email" required error={fieldErrors.email}>
                        <input
                            id="doc-email"
                            type="email"
                            className="input"
                            placeholder="doctor@brightsmile.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </FormField>
                </div>

                <FormField label="Availability" htmlFor="doc-avail" required error={fieldErrors.availability}>
                    <input
                        id="doc-avail"
                        className="input"
                        placeholder="e.g. Mon–Fri, 9:00 AM – 5:00 PM"
                        value={form.availability}
                        onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    />
                </FormField>

                <label className="checkbox-row">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <span>Active (available for new appointments)</span>
                </label>
            </form>
        </Modal>
    );
}