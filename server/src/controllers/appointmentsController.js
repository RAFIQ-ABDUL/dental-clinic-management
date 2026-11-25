import pool from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

function validateAppointmentInput(body) {
    const { patient_name, patient_contact, doctor_id, appointment_date, appointment_time, reason, status } = body;
    const missing = [];

    if (!patient_name?.trim()) missing.push('patient_name');
    if (!patient_contact?.trim()) missing.push('patient_contact');
    if (!doctor_id) missing.push('doctor_id');
    if (!appointment_date) missing.push('appointment_date');
    if (!appointment_time) missing.push('appointment_time');
    if (!reason?.trim()) missing.push('reason');

    if (missing.length > 0) {
        throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    }

    if (status && !VALID_STATUSES.includes(status)) {
        throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
}

async function ensureDoctorValid(doctorId) {
    const docResult = await pool.query(
        `SELECT id, name, is_active FROM doctors WHERE id = $1`,
        [doctorId]
    );

    if (docResult.rows.length === 0) {
        throw new AppError('Selected doctor does not exist.', 400);
    }

    if (!docResult.rows[0].is_active) {
        throw new AppError(`Dr. ${docResult.rows[0].name.replace(/^Dr\.\s*/i, '')} is currently inactive and unavailable for booking.`, 400);
    }
}

async function ensureNoOverlap({ doctorId, date, time, status, excludeId = null }) {
    if (status === 'cancelled') return;

    const params = [doctorId, date, time];
    let excludeClause = '';
    if (excludeId) {
        params.push(excludeId);
        excludeClause = `AND id != $${params.length}`;
    }

    // Prevent booking within 30 minutes of another active appointment for the same doctor
    const overlapResult = await pool.query(
        `SELECT id, TO_CHAR(appointment_time, 'HH24:MI') AS appointment_time
     FROM appointments
     WHERE doctor_id = $1
       AND appointment_date = $2
       AND status != 'cancelled'
       AND ABS(EXTRACT(EPOCH FROM (appointment_time - $3::time))) < 1800
       ${excludeClause}
     LIMIT 1`,
        params
    );

    if (overlapResult.rows.length > 0) {
        throw new AppError(
            `This doctor already has an appointment at ${overlapResult.rows[0].appointment_time} on ${date}. Please choose a time at least 30 minutes apart.`,
            409
        );
    }
}

export async function getAppointments(req, res, next) {
    try {
        const { status, doctor_id, date, search } = req.query;
        const conditions = [];
        const params = [];

        if (status && VALID_STATUSES.includes(status)) {
            params.push(status);
            conditions.push(`a.status = $${params.length}`);
        }

        if (doctor_id) {
            params.push(doctor_id);
            conditions.push(`a.doctor_id = $${params.length}`);
        }

        if (date) {
            params.push(date);
            conditions.push(`a.appointment_date = $${params.length}`);
        }

        if (search?.trim()) {
            params.push(`%${search.trim()}%`);
            conditions.push(
                `(a.patient_name ILIKE $${params.length} OR a.reason ILIKE $${params.length} OR d.name ILIKE $${params.length})`
            );
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const result = await pool.query(
            `SELECT a.id,
              a.patient_name,
              a.patient_contact,
              a.doctor_id,
              d.name AS doctor_name,
              d.specialization AS doctor_specialization,
              TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS appointment_date,
              TO_CHAR(a.appointment_time, 'HH24:MI') AS appointment_time,
              a.reason,
              a.status,
              a.created_at,
              a.updated_at
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       ${whereClause}
       ORDER BY a.appointment_date ASC, a.appointment_time ASC`,
            params
        );

        res.json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
}

export async function getAppointmentById(req, res, next) {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT a.id,
              a.patient_name,
              a.patient_contact,
              a.doctor_id,
              d.name AS doctor_name,
              d.specialization AS doctor_specialization,
              TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS appointment_date,
              TO_CHAR(a.appointment_time, 'HH24:MI') AS appointment_time,
              a.reason,
              a.status,
              a.created_at,
              a.updated_at
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new AppError('Appointment not found.', 404);
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
}

export async function createAppointment(req, res, next) {
    try {
        validateAppointmentInput(req.body);
        const {
            patient_name,
            patient_contact,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status = 'pending',
        } = req.body;

        await ensureDoctorValid(doctor_id);
        await ensureNoOverlap({ doctorId: doctor_id, date: appointment_date, time: appointment_time, status });

        const insertResult = await pool.query(
            `INSERT INTO appointments (patient_name, patient_contact, doctor_id, appointment_date, appointment_time, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
            [patient_name.trim(), patient_contact.trim(), doctor_id, appointment_date, appointment_time, reason.trim(), status]
        );

        const created = await pool.query(
            `SELECT a.id,
              a.patient_name,
              a.patient_contact,
              a.doctor_id,
              d.name AS doctor_name,
              d.specialization AS doctor_specialization,
              TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS appointment_date,
              TO_CHAR(a.appointment_time, 'HH24:MI') AS appointment_time,
              a.reason,
              a.status,
              a.created_at,
              a.updated_at
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1`,
            [insertResult.rows[0].id]
        );

        res.status(201).json({ success: true, data: created.rows[0] });
    } catch (err) {
        next(err);
    }
}

export async function updateAppointment(req, res, next) {
    try {
        validateAppointmentInput(req.body);
        const { id } = req.params;
        const {
            patient_name,
            patient_contact,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status = 'pending',
        } = req.body;

        const existing = await pool.query(`SELECT id FROM appointments WHERE id = $1`, [id]);
        if (existing.rows.length === 0) {
            throw new AppError('Appointment not found.', 404);
        }

        await ensureDoctorValid(doctor_id);
        await ensureNoOverlap({ doctorId: doctor_id, date: appointment_date, time: appointment_time, status, excludeId: id });

        await pool.query(
            `UPDATE appointments
       SET patient_name = $1,
           patient_contact = $2,
           doctor_id = $3,
           appointment_date = $4,
           appointment_time = $5,
           reason = $6,
           status = $7,
           updated_at = NOW()
       WHERE id = $8`,
            [patient_name.trim(), patient_contact.trim(), doctor_id, appointment_date, appointment_time, reason.trim(), status, id]
        );

        const updated = await pool.query(
            `SELECT a.id,
              a.patient_name,
              a.patient_contact,
              a.doctor_id,
              d.name AS doctor_name,
              d.specialization AS doctor_specialization,
              TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS appointment_date,
              TO_CHAR(a.appointment_time, 'HH24:MI') AS appointment_time,
              a.reason,
              a.status,
              a.created_at,
              a.updated_at
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1`,
            [id]
        );

        res.json({ success: true, data: updated.rows[0] });
    } catch (err) {
        next(err);
    }
}

export async function deleteAppointment(req, res, next) {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM appointments WHERE id = $1 RETURNING id, patient_name`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new AppError('Appointment not found.', 404);
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
}