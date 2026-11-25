import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const formatDateOffset = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
};

async function seed() {
    const client = await pool.connect();

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        await client.query('BEGIN');
        await client.query(schemaSql);

        // Clear existing data and reset IDs for a clean, repeatable seed
        await client.query('TRUNCATE TABLE appointments, doctors RESTART IDENTITY CASCADE');

        const doctorsResult = await client.query(
            `INSERT INTO doctors (name, specialization, phone, email, availability, is_active)
       VALUES
         ($1, $2, $3, $4, $5, $6),
         ($7, $8, $9, $10, $11, $12),
         ($13, $14, $15, $16, $17, $18),
         ($19, $20, $21, $22, $23, $24),
         ($25, $26, $27, $28, $29, $30)
       RETURNING id, name`,
            [
                'Dr. Sarah Jenkins', 'General Dentistry', '+1 (555) 201-4410', 'sarah.jenkins@brightsmile.com', 'Mon–Fri, 9:00 AM – 5:00 PM', true,
                'Dr. Omar Farooq', 'Orthodontics', '+1 (555) 201-4422', 'omar.farooq@brightsmile.com', 'Mon–Thu, 10:00 AM – 6:00 PM', true,
                'Dr. Elena Rostova', 'Endodontics', '+1 (555) 201-4435', 'elena.rostova@brightsmile.com', 'Tue–Sat, 8:30 AM – 4:30 PM', true,
                'Dr. Marcus Chen', 'Pediatric Dentistry', '+1 (555) 201-4448', 'marcus.chen@brightsmile.com', 'Mon, Wed, Fri, 9:00 AM – 3:00 PM', true,
                'Dr. Priya Nair', 'Periodontics', '+1 (555) 201-4460', 'priya.nair@brightsmile.com', 'On Leave', false,
            ]
        );

        const [drSarah, drOmar, drElena, drMarcus] = doctorsResult.rows;

        const today = formatDateOffset(0);
        const tomorrow = formatDateOffset(1);
        const dayAfter = formatDateOffset(2);
        const nextWeek = formatDateOffset(5);
        const yesterday = formatDateOffset(-1);

        await client.query(
            `INSERT INTO appointments (patient_name, patient_contact, doctor_id, appointment_date, appointment_time, reason, status)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7),
         ($8, $9, $10, $11, $12, $13, $14),
         ($15, $16, $17, $18, $19, $20, $21),
         ($22, $23, $24, $25, $26, $27, $28),
         ($29, $30, $31, $32, $33, $34, $35),
         ($36, $37, $38, $39, $40, $41, $42),
         ($43, $44, $45, $46, $47, $48, $49)`,
            [
                'Amina Khalid', 'amina.khalid@email.com', drSarah.id, today, '09:30', 'Routine dental cleaning & checkup', 'confirmed',
                'Liam O\'Connor', '+1 (555) 390-1120', drOmar.id, today, '11:00', 'Braces adjustment follow-up', 'pending',
                'Sofia Alvarez', 'sofia.a@email.com', drElena.id, today, '14:00', 'Root canal consultation', 'pending',
                'Noah Williams', '+1 (555) 842-9910', drMarcus.id, tomorrow, '10:00', 'Pediatric fluoride treatment', 'confirmed',
                'Zainab Malik', 'zainab.m@email.com', drSarah.id, dayAfter, '15:30', 'Tooth sensitivity evaluation', 'pending',
                'Ethan Brooks', '+1 (555) 773-2041', drOmar.id, nextWeek, '13:00', 'Invisalign initial scan', 'confirmed',
                'Maya Patel', 'maya.patel@email.com', drSarah.id, yesterday, '16:00', 'Cavity filling', 'completed',
            ]
        );

        await client.query('COMMIT');
        console.log('Database schema initialized and seeded successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

seed();