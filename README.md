# TechMart

TechMart is a full-stack e-commerce web application developed using the MERN stack. The project was built to provide a modern online shopping experience with secure user authentication, product management, and an AI-powered chatbot for customer assistance.

The frontend is built with React, TypeScript, and Vite, while the backend uses Node.js, Express.js, and MongoDB. Google Gemini API is integrated to enhance customer interaction by answering product-related queries and providing intelligent shopping assistance.

The project focuses on building a responsive, scalable, and user-friendly e-commerce platform while following modern web development practices.

---

## Features

- User registration and login
- JWT-based authentication
- AI chatbot powered by Google Gemini
- Product listing and management
- Admin dashboard
- Responsive design
- REST API integration
- MongoDB database
- Secure password hashing with Bcrypt
- Fast frontend using Vite

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

- JWT
- Bcrypt.js

### AI Integration

- Google Gemini API

---

## Project Structure

```text
TechMart
│
├── src/
├── server/
├── data/
├── assets/
├── package.json
├── server.ts
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Saadii010/TechMart.git
```

Move into the project directory:

```bash
cd TechMart
```

Install the required packages:

```bash
npm install
```

Create a `.env.local` file and add the required environment variables:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
MONGODB_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET_KEY
```

Start the development server:

```bash
npm run dev
```

To create a production build:

```bash
npm run build
```

---

## Future Improvements

Some features planned for future updates include:

- Online payment integration
- Wishlist functionality
- Product reviews and ratings
- Order tracking
- Email notifications
- AI-based product recommendations
- Multi-language support

---

## Author

**Muhammad Saad**

Frontend Developer | MERN Stack Developer | Generative AI Enthusiast

GitHub: https://github.com/Saadii010

---

## License

This project is intended for educational and portfolio purposes. Feel free to explore the code and use it as a learning resource.