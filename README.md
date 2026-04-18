# CareBridge NGO Donation Platform

CareBridge is a full-stack NGO Donation Platform built with React, Vite, Tailwind CSS, React Router, FastAPI, SQLite, and JWT authentication.

It includes:

- Home page
- Donor registration and OTP-based login simulation
- NGO registration and login
- Donor dashboard
- NGO dashboard
- Donation form page
- REST API integration between frontend and backend
- Clean UI with validation, error handling, and seeded demo NGO accounts

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: FastAPI + SQLAlchemy + SQLite
- Authentication: JWT
- OTP: Simulated OTP flow for donors

## Project Structure

```text
frontend/
backend/
README.md
start-project.bat
```

## Main Features

### Donor Features

- Register with name, mobile number, dummy ID proof, and city
- Login using OTP simulation
- Donate food, clothes, books, money, medicine, stationery, or other items
- Select an NGO before donating
- View profile and donation history in the donor dashboard

### NGO Features

- Register with NGO name, dummy government NGO ID, owner name, owner ID proof, mission, and contact details
- Login with email and password
- View all donations received
- View donor details for received donations
- Track donation totals and donor connections in the NGO dashboard

### Backend APIs

- Donor registration
- Donor OTP request
- Donor OTP verification login
- NGO registration
- NGO login
- NGO listing
- Donation submission
- Donor dashboard APIs
- NGO dashboard APIs

## Database Tables

- `donors`
- `ngos`
- `donations`

## Recommended Python Version

For the smoothest setup on Windows, use **Python 3.13**.

Python 3.14 may require additional native build tools depending on package wheel availability.

## Quick Start

### Option 1: One-click startup on Windows

From the project root, double-click:

- `start-project.bat`

This opens:

- FastAPI backend on `http://127.0.0.1:8000`
- React frontend on `http://127.0.0.1:5173`

### Option 2: Start backend and frontend separately

Backend:

```powershell
cd backend
start_backend.bat
```

Frontend:

```powershell
cd frontend
start_frontend.bat
```

## Manual Setup

### Backend

```powershell
cd backend
py -3.13 -m pip install -r requirements.txt --target .packages
py -3.13 run_server.py
```

If `py -3.13` is not available, install Python 3.13 first.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Demo NGO Login

These demo NGOs are seeded automatically when the backend starts for the first time:

- Email: `hopebasket@example.org`
- Password: `ngo12345`

Also available:

- Email: `brightfuture@example.org`
- Password: `ngo12345`

## How Donor Login Works

1. Register as a donor.
2. Request OTP using the registered mobile number.
3. Use the generated demo OTP shown by the frontend.
4. Verify OTP to receive a JWT session.

## Notes

- Aadhaar and NGO IDs are dummy fields only.
- OTP is simulated and intentionally shown in the UI for demo purposes.
- The database file is created locally as SQLite.
- The frontend uses Vite proxy configuration to connect to the backend during development.

## Submission Checklist

This project includes all requested requirements:

- React with Vite
- Tailwind CSS styling
- React Router navigation
- Home page
- Donor registration and login
- NGO registration and login
- Donor dashboard
- NGO dashboard
- Donation form page
- FastAPI backend
- SQLite database
- JWT authentication
- OTP simulation
- Dummy mobile and ID proof fields
- Donation submission APIs
- Donor details for NGOs
- Clean dashboard UI
- Validation and error handling
- API integration

"# ngo" 
