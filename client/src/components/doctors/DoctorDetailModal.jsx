import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { LoadingState } from '../common/StateFeedback';

export default function DoctorDetailModal({ isOpen, onClose, doctor, loading }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={doctor ? doctor.name : 'Doctor Details'}
            footer={
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            }
        >
            {loading ? (
                <LoadingState message="Loading doctor details..." />
            ) : doctor ? (
                <div className="form-grid">
                    <div>
                        <strong>Specialization:</strong> {doctor.specialization}
                    </div>
                    <div>
                        <strong>Status:</strong>{' '}
                        <Badge>{doctor.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div>
                        <strong>Phone:</strong> {doctor.phone}
                    </div>
                    <div>
                        <strong>Email:</strong> {doctor.email}
                    </div>
                    <div>
                        <strong>Availability:</strong> {doctor.availability}
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem' }}>
                            Scheduled Appointments ({doctor.appointments?.length || 0})
                        </h4>
                        {!doctor.appointments || doctor.appointments.length === 0 ? (
                            <p className="page-subtitle">No appointments assigned to this doctor yet.</p>
                        ) : (
                            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                {doctor.appointments.map((appt) => (
                                    <li key={appt.id} style={{ marginBottom: '0.4rem' }}>
                                        <strong>{appt.appointment_date} {appt.appointment_time}</strong> — {appt.patient_name} ({appt.reason}){' '}
                                        <Badge>{appt.status}</Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}