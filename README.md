# TechMart – E-Commerce Platform

## Overview

TechMart is a modern e-commerce web application built with React, TypeScript, Node.js, Express, and MongoDB. The platform provides a smooth shopping experience while integrating AI features to improve customer interaction and support.

The project includes both frontend and backend functionality with a responsive user interface, secure API communication, database integration, and an AI-powered chat assistant.

---

## Features

* Modern and responsive user interface
* AI-powered chat assistant using Google Gemini
* User authentication
* Product management
* Shopping experience with dynamic content
* Admin dashboard
* REST API integration
* MongoDB database support
* Secure backend using JWT authentication
* Fast and optimized performance
* Mobile-friendly design

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS
* Motion
* Recharts

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### AI

* Google Gemini API

### Authentication

* JSON Web Token (JWT)
* Bcrypt.js

---

## Project Structure

```text
TechMart/
│
├── src/                 # Frontend source code
├── server/              # Backend controllers and database
├── data/                # Sample data
├── assets/              # Static assets
├── package.json
├── server.ts
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/techmart.git
```

### 2. Open the project

```bash
cd techmart
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create an environment file

Create a file named:

```text
.env.local
```

Add your Gemini API key:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

If your project uses MongoDB authentication, also add:

```env
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
```

---

## Run the Project

Start the development server:

```bash
npm run dev
```

---

## Build for Production

```bash
npm run build
```

---

## Technologies Used

* React
* TypeScript
* Vite
* Node.js
* Express.js
* MongoDB
* Mongoose
* Google Gemini API
* JWT Authentication
* Bcrypt.js

---

## Future Improvements

* Payment gateway integration
* Wishlist feature
* Order tracking
* Product reviews and ratings
* Email notifications
* Multi-language support
* AI product recommendations

---

## Author

**Muhammad Saad**

BS Computer Science

Frontend & Generative AI Developer

GitHub: https://github.com/your-username

---

## License

This project is created for educational and portfolio purposes. Feel free to use it as a learning resource.
