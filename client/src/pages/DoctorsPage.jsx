import { useCallback, useEffect, useState } from 'react';
import { doctorsService } from '../services/doctorsService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import { Alert, LoadingState } from '../components/common/StateFeedback';
import DoctorFormModal from '../components/doctors/DoctorFormModal';
import DoctorDetailModal from '../components/doctors/DoctorDetailModal';

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailDoctor, setDetailDoctor] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await doctorsService.getAll({ search, active: activeFilter });
            setDoctors(data);
        } catch (err) {
            setError(err.message || 'Failed to load doctors.');
        } finally {
            setLoading(false);
        }
    }, [search, activeFilter]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleOpenCreate = () => {
        setEditingDoctor(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (doctor) => {
        setEditingDoctor(doctor);
        setFormOpen(true);
    };

    const handleViewDetails = async (doctor) => {
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const fullDoctor = await doctorsService.getById(doctor.id);
            setDetailDoctor(fullDoctor);
        } catch (err) {
            setDetailOpen(false);
            setError(err.message || 'Failed to load doctor details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSaveDoctor = async (formData) => {
        setSaving(true);
        try {
            if (editingDoctor) {
                await doctorsService.update(editingDoctor.id, formData);
                setSuccess(`Updated ${formData.name} successfully.`);
            } else {
                await doctorsService.create(formData);
                setSuccess(`Added ${formData.name} successfully.`);
            }
            setFormOpen(false);
            await fetchDoctors();
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setSaving(true);
        try {
            await doctorsService.remove(deleteTarget.id);
            setSuccess(`Deleted ${deleteTarget.name} successfully.`);
            setDeleteTarget(null);
            await fetchDoctors();
        } catch (err) {
            setDeleteTarget(null);
            setError(err.message || 'Failed to delete doctor.');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'specialization', header: 'Specialization' },
        {
            key: 'contact',
            header: 'Contact',
            render: (row) => (
                <div>
                    <div>{row.phone}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{row.email}</small>
                </div>
            ),
        },
        { key: 'availability', header: 'Availability' },
        {
            key: 'is_active',
            header: 'Status',
            render: (row) => <Badge>{row.is_active ? 'Active' : 'Inactive'}</Badge>,
        },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Doctors</h2>
                    <p className="page-subtitle">Manage clinic dentists, specializations, and schedules</p>
                </div>
                <Button onClick={handleOpenCreate}>+ Add Doctor</Button>
            </div>

            <Alert type="success" message={success} onDismiss={() => setSuccess('')} />
            <Alert type="error" message={error} onDismiss={() => setError('')} />

            <div className="filters-bar">
                <input
                    className="input"
                    type="search"
                    placeholder="Search by name or specialization..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="select"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
            </div>

            {loading ? (
                <LoadingState message="Loading doctors..." />
            ) : doctors.length === 0 ? (
                <EmptyState
                    icon="🩺"
                    title="No doctors found"
                    description="Try adjusting your search/filter or add a new doctor."
                    action={<Button onClick={handleOpenCreate}>+ Add Doctor</Button>}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={doctors}
                    keyExtractor={(row) => row.id}
                    renderActions={(row) => (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => handleViewDetails(row)}>
                                View
                            </Button>
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

            <DoctorFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSaveDoctor}
                initialData={editingDoctor}
                loading={saving}
            />

            <DoctorDetailModal
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                doctor={detailDoctor}
                loading={detailLoading}
            />

            <ConfirmModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Doctor"
                message={
                    deleteTarget
                        ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`
                        : ''
                }
                loading={saving}
            />
        </div>
    );
}