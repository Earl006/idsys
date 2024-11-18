
# School Gate Pass System

A modern access control system built with Node.js, TypeScript, and Angular.

## Features

- 🔐 QR Code-based Access Control
- 👥 User Management (Students/Staff)
- 📱 Mobile-friendly ID Cards
- 📊 Access Logs & Analytics
- 🚨 Breach Detection
- 🎯 Role-based Access Control

## Tech Stack

- Backend:
  - Node.js + TypeScript
  - Express.js
  - Prisma ORM
  - PostgreSQL
  - JWT Authentication
  
- Frontend:
  - Angular
  - Material UI
  - QR Code Scanner

## Prerequisites

- Node.js >= 14
- PostgreSQL >= 12
- npm or yarn
- Angular CLI

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Earl006/idsys.git
cd idsys
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

```

3. Environment setup:
```bash
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/gatepass"
JWT_SECRET="your-secret-key"
CLOUD_NAME="your-cloudinary-name"
CLOUD_API_KEY="your-cloudinary-key"
CLOUD_SECRET_KEY="your-cloudinary-secret"
```

4. Database setup:
```bash
npx prisma migrate dev
```

## Usage

1. Start backend server:
```bash
cd backend
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login

### Users
- POST `/api/users` - Create new person (Admin)
- GET `/api/users` - Get all persons
- GET `/api/users/:id` - Get person by ID
- PUT `/api/users/:id` - Update person
- DELETE `/api/users/:id` - Disable person

### Access Control
- POST `/api/verify` - Verify QR code and log access
- GET `/api/locations` - Get all locations
- GET `/api/locations/:id/logs` - Get location access logs

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── bg-services/
│   │   └── utils/
│   └── prisma/
└── frontend/
    └── src/
        ├── app/
        ├── components/
        └── services/
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
```

