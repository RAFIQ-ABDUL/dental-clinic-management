import pool from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

function validateDoctorInput(body) {
    const { name, specialization, phone, email, availability } = body;
    const missing = [];

    if (!name?.trim()) missing.push('name');
    if (!specialization?.trim()) missing.push('specialization');
    if (!phone?.trim()) missing.push('phone');
    if (!email?.trim()) missing.push('email');
    if (!availability?.trim()) missing.push('availability');

    if (missing.length > 0) {
        throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        throw new AppError('Please provide a valid email address.', 400);
    }
}

export async function getDoctors(req, res, next) {
    try {
        const { search, active } = req.query;
        const conditions = [];
        const params = [];

        if (search?.trim()) {
            params.push(`%${search.trim()}%`);
            conditions.push(`(name ILIKE $${params.length} OR specialization ILIKE $${params.length})`);
        }

        if (active === 'true' || active === 'false') {
            params.push(active === 'true');
            conditions.push(`is_active = $${params.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const result = await pool.query(
            `SELECT id, name, specialization, phone, email, availability, is_active, created_at, updated_at
       FROM doctors
       ${whereClause}
       ORDER BY id ASC`,
            params
        );

        res.json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
}

export async function getDoctorById(req, res, next) {
    try {
        const { id } = req.params;
        const doctorResult = await pool.query(
            `SELECT id, name, specialization, phone, email, availability, is_active, created_at, updated_at
       FROM doctors WHERE id = $1`,
            [id]
        );

        if (doctorResult.rows.length === 0) {
            throw new AppError('Doctor not found.', 404);
        }

        const appointmentsResult = await pool.query(
            `SELECT id, patient_name, patient_contact,
              TO_CHAR(appointment_date, 'YYYY-MM-DD') AS appointment_date,
              TO_CHAR(appointment_time, 'HH24:MI') AS appointment_time,
              reason, status
       FROM appointments
       WHERE doctor_id = $1
       ORDER BY appointment_date ASC, appointment_time ASC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...doctorResult.rows[0],
                appointments: appointmentsResult.rows,
            },
        });
    } catch (err) {
        next(err);
    }
}

export async function createDoctor(req, res, next) {
    try {
        validateDoctorInput(req.body);
        const { name, specialization, phone, email, availability, is_active = true } = req.body;

        const result = await pool.query(
            `INSERT INTO doctors (name, specialization, phone, email, availability, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, specialization, phone, email, availability, is_active, created_at, updated_at`,
            [name.trim(), specialization.trim(), phone.trim(), email.trim().toLowerCase(), availability.trim(), Boolean(is_active)]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
}

export async function updateDoctor(req, res, next) {
    try {
        validateDoctorInput(req.body);
        const { id } = req.params;
        const { name, specialization, phone, email, availability, is_active = true } = req.body;

        const result = await pool.query(
            `UPDATE doctors
       SET name = $1,
           specialization = $2,
           phone = $3,
           email = $4,
           availability = $5,
           is_active = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, specialization, phone, email, availability, is_active, created_at, updated_at`,
            [name.trim(), specialization.trim(), phone.trim(), email.trim().toLowerCase(), availability.trim(), Boolean(is_active), id]
        );

        if (result.rows.length === 0) {
            throw new AppError('Doctor not found.', 404);
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
}

export async function deleteDoctor(req, res, next) {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM doctors WHERE id = $1 RETURNING id, name`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new AppError('Doctor not found.', 404);
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err);
    }
}
