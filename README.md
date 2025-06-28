# Chat Application

A modern chat application built with NestJS for the backend and React for the frontend.

## Features

- User authentication with JWT tokens
- Real-time messaging
- User management
- Group chat functionality
- Responsive UI
- Secure password hashing

## Tech Stack

### Backend (NestJS)
- TypeScript
- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication
- Passport.js
- Socket.IO

### Frontend (React)
- React
- TypeScript
- Material-UI
- Axios
- Socket.IO Client

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL

## Installation

### Backend Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3001
   DATABASE_URL=postgresql://username:password@localhost:5432/chat_app
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRATION=1h
   ```
5. Run migrations:
   ```bash
   npm run typeorm migration:run
   ```
6. Start the backend server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── message/        # Message handling module
│   ├── user/          # User management module
│   ├── group/         # Group chat module
│   └── app.module.ts  # Root module
├── test/              # Test files
└── package.json      # Dependencies

frontend/
├── src/
│   ├── components/    # React components
│   ├── services/      # API services
│   ├── contexts/      # React context
│   └── pages/         # Page components
├── public/           # Static files
└── package.json     # Dependencies
```

## API Endpoints

### Authentication

- POST `/auth/login` - Login user
- POST `/auth/register` - Register new user

### Messages

- GET `/messages` - Get all messages
- GET `/messages/:id` - Get message by ID
- POST `/messages` - Create new message
- PUT `/messages/:id` - Update message
- DELETE `/messages/:id` - Delete message

### Users

- GET `/users` - Get all users
- GET `/users/:id` - Get user by ID
- POST `/users` - Create new user
- PUT `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

## Security

- JWT token-based authentication
- Password hashing using bcrypt
- CORS enabled for frontend origin
- Input validation
- Rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@chatapp.com or create an issue in the repository.

## Acknowledgments

- NestJS team
- React team
- Material-UI team
- Socket.IO team
- All contributors
