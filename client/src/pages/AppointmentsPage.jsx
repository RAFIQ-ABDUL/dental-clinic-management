import { useCallback, useEffect, useState } from 'react';
import { appointmentsService } from '../services/appointmentsService';
import { doctorsService } from '../services/doctorsService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import { Alert, LoadingState } from '../components/common/StateFeedback';
import AppointmentFormModal from '../components/appointments/AppointmentFormModal';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [doctorFilter, setDoctorFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await appointmentsService.getAll({
                search,
                status: statusFilter,
                doctor_id: doctorFilter,
                date: dateFilter,
            });
            setAppointments(data);
        } catch (err) {
            setError(err.message || 'Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, doctorFilter, dateFilter]);

    useEffect(() => {
        doctorsService.getAll().then(setDoctors).catch(() => { });
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleOpenCreate = () => {
        setEditingAppointment(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (appointment) => {
        setEditingAppointment(appointment);
        setFormOpen(true);
    };

    const handleSaveAppointment = async (formData) => {
        setSaving(true);
        try {
            if (editingAppointment) {
                await appointmentsService.update(editingAppointment.id, formData);
                setSuccess(`Updated appointment for ${formData.patient_name}.`);
            } else {
                await appointmentsService.create(formData);
                setSuccess(`Booked appointment for ${formData.patient_name}.`);
            }
            setFormOpen(false);
            await fetchAppointments();
        } finally {
            setSaving(false);
        }
    };

    const handleQuickStatusChange = async (appointment, newStatus) => {
        try {
            setError('');
            await appointmentsService.update(appointment.id, {
                patient_name: appointment.patient_name,
                patient_contact: appointment.patient_contact,
                doctor_id: appointment.doctor_id,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                reason: appointment.reason,
                status: newStatus,
            });
            setSuccess(`Status updated to "${newStatus}" for ${appointment.patient_name}.`);
            await fetchAppointments();
        } catch (err) {
            setError(err.message || 'Failed to update status.');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setSaving(true);
        try {
            await appointmentsService.remove(deleteTarget.id);
            setSuccess(`Deleted appointment for ${deleteTarget.patient_name}.`);
            setDeleteTarget(null);
            await fetchAppointments();
        } catch (err) {
            setDeleteTarget(null);
            setError(err.message || 'Failed to delete appointment.');
        } finally {
            setSaving(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setDoctorFilter('');
        setDateFilter('');
    };

    const columns = [
        {
            key: 'patient_name',
            header: 'Patient',
            render: (row) => (
                <div>
                    <div>{row.patient_name}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{row.patient_contact}</small>
                </div>
            ),
        },
        {
            key: 'doctor_name',
            header: 'Doctor',
            render: (row) => (
                <div>
                    <div>{row.doctor_name}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{row.doctor_specialization}</small>
                </div>
            ),
        },
        { key: 'appointment_date', header: 'Date' },
        { key: 'appointment_time', header: 'Time' },
        { key: 'reason', header: 'Reason' },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Badge>{row.status}</Badge>
                    <select
                        aria-label={`Change status for ${row.patient_name}`}
                        className="select"
                        style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                        value={row.status}
                        onChange={(e) => handleQuickStatusChange(row, e.target.value)}
                    >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                    </select>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Appointments</h2>
                    <p className="page-subtitle">Schedule, filter, update status, and manage clinic visits</p>
                </div>
                <Button onClick={handleOpenCreate}>+ Book Appointment</Button>
            </div>

            <Alert type="success" message={success} onDismiss={() => setSuccess('')} />
            <Alert type="error" message={error} onDismiss={() => setError('')} />

            <div className="filters-bar">
                <input
                    className="input"
                    type="search"
                    placeholder="Search patient, doctor, or reason..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    className="select"
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                >
                    <option value="">All Doctors</option>
                    {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                            {doc.name}
                        </option>
                    ))}
                </select>
                <input
                    className="input"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
                {(search || statusFilter || doctorFilter || dateFilter) && (
                    <Button variant="secondary" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                )}
            </div>

            {loading ? (
                <LoadingState message="Loading appointments..." />
            ) : appointments.length === 0 ? (
                <EmptyState
                    icon="📅"
                    title="No appointments found"
                    description="Try clearing filters or book a new appointment."
                    action={<Button onClick={handleOpenCreate}>+ Book Appointment</Button>}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={appointments}
                    keyExtractor={(row) => row.id}
                    renderActions={(row) => (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(row)}>
                                Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
                                Delete
                            </Button>
                        </>
                    )}
                />
            )}

            <AppointmentFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSaveAppointment}
                initialData={editingAppointment}
                doctors={doctors}
                loading={saving}
            />

            <ConfirmModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Appointment"
                message={
                    deleteTarget
                        ? `Are you sure you want to delete the appointment for ${deleteTarget.patient_name} on ${deleteTarget.appointment_date}?`
                        : ''
                }
                loading={saving}
            />
        </div>
    );
}