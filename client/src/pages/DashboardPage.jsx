import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorsService } from '../services/doctorsService';
import { appointmentsService } from '../services/appointmentsService';
import Badge from '../components/common/Badge';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import { Alert, LoadingState } from '../components/common/StateFeedback';

export default function DashboardPage() {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError('');
                const [doctorsData, appointmentsData] = await Promise.all([
                    doctorsService.getAll(),
                    appointmentsService.getAll(),
                ]);
                setDoctors(doctorsData);
                setAppointments(appointmentsData);
            } catch (err) {
                setError(err.message || 'Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        }
        loadDashboard();
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const activeDoctorsCount = doctors.filter((d) => d.is_active).length;
    const todaysAppointments = appointments.filter((a) => a.appointment_date === today);
    const upcomingAppointments = appointments.filter(
        (a) => a.appointment_date >= today && a.status !== 'cancelled' && a.status !== 'completed'
    );
    const pendingAppointments = appointments.filter((a) => a.status === 'pending');

    const columns = [
        { key: 'patient_name', header: 'Patient' },
        { key: 'doctor_name', header: 'Doctor' },
        { key: 'appointment_date', header: 'Date' },
        { key: 'appointment_time', header: 'Time' },
        { key: 'reason', header: 'Reason' },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <Badge>{row.status}</Badge>,
        },
    ];

    if (loading) return <LoadingState message="Loading clinic dashboard..." />;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Clinic Dashboard</h2>
                    <p className="page-subtitle">Overview of doctors and scheduled appointments</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/doctors" className="btn btn-secondary btn-md" style={{ textDecoration: 'none' }}>
                        Manage Doctors
                    </Link>
                    <Link to="/appointments" className="btn btn-primary btn-md" style={{ textDecoration: 'none' }}>
                        Manage Appointments
                    </Link>
                </div>
            </div>

            <Alert type="error" message={error} onDismiss={() => setError('')} />

            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-label">Total Doctors</p>
                    <p className="stat-value">{doctors.length}</p>
                    <p className="page-subtitle">{activeDoctorsCount} active</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Upcoming Appointments</p>
                    <p className="stat-value">{upcomingAppointments.length}</p>
                    <p className="page-subtitle">Scheduled from today onward</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Today&apos;s Appointments</p>
                    <p className="stat-value">{todaysAppointments.length}</p>
                    <p className="page-subtitle">{today}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Pending Status</p>
                    <p className="stat-value">{pendingAppointments.length}</p>
                    <p className="page-subtitle">Awaiting confirmation</p>
                </div>
            </div>

            <div className="card">
                <div className="page-header" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Upcoming Appointments</h3>
                    <Link to="/appointments" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                        View all →
                    </Link>
                </div>

                {upcomingAppointments.length === 0 ? (
                    <EmptyState
                        icon="📅"
                        title="No upcoming appointments"
                        description="Schedule a new appointment to see it appear here."
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={upcomingAppointments.slice(0, 6)}
                        keyExtractor={(row) => row.id}
                    />
                )}
            </div>
        </div>
    );
}