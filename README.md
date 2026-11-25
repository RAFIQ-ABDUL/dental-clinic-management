# Dental Clinic Management System

A full-stack Dental Clinic Management System built with **React + Vite**, **Node.js + Express**, and **PostgreSQL**. Clinic staff can manage doctors and patient appointments through a responsive, component-based UI backed by a REST API.

## Tech Stack

- **Frontend:** React, Vite, React Router (`react-router-dom`), Responsive CSS
- **Backend:** Node.js, Express 5, `pg`, `cors`, `dotenv`
- **Database:** PostgreSQL
- **Hosting:** Render (Web Service + Static Site + Managed PostgreSQL)

## Project Structure

```text
dental-clinic-management/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI & feature modals/layout
│   │   ├── pages/          # Dashboard, Doctors, Appointments pages
│   │   └── services/       # API service layer
│   └── .env.example
└── server/                 # Express REST API
    ├── src/
    │   ├── config/         # PostgreSQL connection pool
    │   ├── controllers/    # Route handlers & validation
    │   ├── db/             # schema.sql & seed.js
    │   ├── middleware/     # Centralized error handler
    │   └── routes/         # /api/doctors, /api/appointments
    └── .env.example
```

## Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dental_clinic
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Local Setup

### 1. Database Setup
Create a PostgreSQL database named `dental_clinic`:
```bash
createdb dental_clinic
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env   # Update DATABASE_URL for your local Postgres user
npm run seed           # Creates tables and inserts mock doctors & appointments
npm run dev            # Starts API at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev            # Starts UI at http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & PostgreSQL connectivity |
| `GET` | `/api/doctors` | List doctors (supports `?search=` and `?active=`) |
| `GET` | `/api/doctors/:id` | Get doctor details + scheduled appointments |
| `POST` | `/api/doctors` | Create a new doctor |
| `PUT` | `/api/doctors/:id` | Update a doctor |
| `DELETE` | `/api/doctors/:id` | Delete a doctor (blocked with `409` if appointments exist) |
| `GET` | `/api/appointments` | List appointments (supports `?search=`, `?status=`, `?doctor_id=`, `?date=`) |
| `GET` | `/api/appointments/:id` | Get a single appointment |
| `POST` | `/api/appointments` | Book an appointment (checks active doctor & 30-min overlap) |
| `PUT` | `/api/appointments/:id` | Update appointment details or status |
| `DELETE` | `/api/appointments/:id` | Delete an appointment |

### Example Request (`POST /api/doctors`)
```bash
curl -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Alex Rivera",
    "specialization": "Oral Surgery",
    "phone": "+1 (555) 310-8820",
    "email": "alex.rivera@brightsmile.com",
    "availability": "Mon-Fri, 9:00 AM - 4:00 PM",
    "is_active": true
  }'
```