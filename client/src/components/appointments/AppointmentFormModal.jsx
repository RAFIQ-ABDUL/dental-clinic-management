import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormField from '../common/FormField';
import { Alert } from '../common/StateFeedback';

const INITIAL_FORM = {
    patient_name: '',
    patient_contact: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    status: 'pending',
};

export default function AppointmentFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    doctors,
    loading,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm(
                initialData
                    ? {
                        patient_name: initialData.patient_name || '',
                        patient_contact: initialData.patient_contact || '',
                        doctor_id: String(initialData.doctor_id || ''),
                        appointment_date: initialData.appointment_date || '',
                        appointment_time: initialData.appointment_time || '',
                        reason: initialData.reason || '',
                        status: initialData.status || 'pending',
                    }
                    : INITIAL_FORM
            );
            setFieldErrors({});
            setSubmitError('');
        }
    }, [isOpen, initialData]);

    const validate = () => {
        const errors = {};
        if (!form.patient_name.trim()) errors.patient_name = 'Patient name is required.';
        if (!form.patient_contact.trim()) errors.patient_contact = 'Patient contact is required.';
        if (!form.doctor_id) errors.doctor_id = 'Please select a doctor.';
        if (!form.appointment_date) errors.appointment_date = 'Appointment date is required.';
        if (!form.appointment_time) errors.appointment_time = 'Appointment time is required.';
        if (!form.reason.trim()) errors.reason = 'Visit reason is required.';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setSubmitError('');
            await onSubmit({
                ...form,
                doctor_id: Number(form.doctor_id),
            });
        } catch (err) {
            setSubmitError(err.message || 'Failed to save appointment.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Appointment' : 'Schedule Appointment'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" form="appointment-form" loading={loading}>
                        {initialData ? 'Save Changes' : 'Book Appointment'}
                    </Button>
                </>
            }
        >
            <Alert type="error" message={submitError} onDismiss={() => setSubmitError('')} />
            <form id="appointment-form" onSubmit={handleSubmit} className="form-grid" noValidate>
                <div className="form-row-2">
                    <FormField label="Patient Name" htmlFor="appt-patient" required error={fieldErrors.patient_name}>
                        <input
                            id="appt-patient"
                            className="input"
                            placeholder="e.g. Amina Khalid"
                            value={form.patient_name}
                            onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                        />
                    </FormField>

                    <FormField label="Patient Contact" htmlFor="appt-contact" required error={fieldErrors.patient_contact}>
                        <input
                            id="appt-contact"
                            className="input"
                            placeholder="Phone or email"
                            value={form.patient_contact}
                            onChange={(e) => setForm({ ...form, patient_contact: e.target.value })}
                        />
                    </FormField>
                </div>

                <FormField label="Doctor" htmlFor="appt-doctor" required error={fieldErrors.doctor_id}>
                    <select
                        id="appt-doctor"
                        className="select"
                        value={form.doctor_id}
                        onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                    >
                        <option value="">Select a doctor...</option>
                        {doctors.map((doc) => (
                            <option key={doc.id} value={doc.id} disabled={!doc.is_active}>
                                {doc.name} — {doc.specialization} {!doc.is_active ? '(Inactive)' : ''}
                            </option>
                        ))}
                    </select>
                </FormField>

                <div className="form-row-2">
                    <FormField label="Date" htmlFor="appt-date" required error={fieldErrors.appointment_date}>
                        <input
                            id="appt-date"
                            type="date"
                            className="input"
                            value={form.appointment_date}
                            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                        />
                    </FormField>

                    <FormField label="Time" htmlFor="appt-time" required error={fieldErrors.appointment_time}>
                        <input
                            id="appt-time"
                            type="time"
                            className="input"
                            value={form.appointment_time}
                            onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                        />
                    </FormField>
                </div>

                <FormField label="Reason for Visit" htmlFor="appt-reason" required error={fieldErrors.reason}>
                    <textarea
                        id="appt-reason"
                        rows={3}
                        className="textarea"
                        placeholder="e.g. Routine dental cleaning & checkup"
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    />
                </FormField>

                <FormField label="Status" htmlFor="appt-status">
                    <select
                        id="appt-status"
                        className="select"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </FormField>
            </form>
        </Modal>
    );
}