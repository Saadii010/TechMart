# TechMart

TechMart is a full-stack e-commerce web application built using the MERN stack. The project demonstrates the development of a modern online shopping platform with secure authentication, product management, and AI-powered customer assistance.

The application is developed with React, TypeScript, and Vite on the frontend, while the backend is powered by Node.js, Express.js, and MongoDB. Google Gemini API is integrated to provide an AI chatbot that assists users with product-related queries and shopping guidance.

The project is intended as a portfolio and learning project, showcasing modern web development practices, RESTful API development, database integration, authentication, and AI integration.

---

## Features

- User registration and authentication
- JWT-based authorization
- Secure password hashing with Bcrypt
- Product listing and management
- AI chatbot powered by Google Gemini
- Admin dashboard
- REST API integration
- MongoDB database support
- Responsive user interface
- Fast development environment using Vite

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- Motion
- Recharts

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JSON Web Token (JWT)
- Bcrypt.js

### AI Integration

- Google Gemini API

---

## Project Structure

```text
TechMart/
│
├── src/                 Frontend source code
├── server/              Backend source code
├── data/                Sample data
├── assets/              Static assets
├── package.json
├── server.ts
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Saadii010/TechMart.git
```

### 2. Navigate to the Project Directory

```bash
cd TechMart
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a file named `.env.local` in the project root and configure the required environment variables.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
```

> **Note**
>
> This repository does **not** include API keys, database credentials, or secret configuration files.
>
> To run the project locally, you must:
>
> - Create your own MongoDB database (local or MongoDB Atlas).
> - Update the `MONGODB_URI` with your database connection string.
> - Generate your own `JWT_SECRET`.
> - Obtain a valid Google Gemini API key and add it to the environment variables.
>
> Without these configurations, the backend services and AI chatbot will not function correctly.

---

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will start in development mode.

---

## Production Build

To generate a production build:

```bash
npm run build
```

---

## Future Improvements

Planned enhancements include:

- Online payment gateway integration
- Shopping cart persistence
- Wishlist functionality
- Product reviews and ratings
- Order tracking
- Email notifications
- AI-powered product recommendations
- Multi-language support
- Cloud deployment

---

## Author

**Muhammad Saad**

Frontend Developer | MERN Stack Developer | Generative AI Enthusiast

GitHub: https://github.com/Saadii010

---

## License

This project is provided for educational and portfolio purposes. You are welcome to explore, learn from, and modify the source code for personal or educational use.