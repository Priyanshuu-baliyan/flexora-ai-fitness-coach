# FlexOra — AI Fitness Coach

A full-stack AI-powered fitness coaching platform built with React, Express, MongoDB, and Groq AI.

## Features

- 🏋️ Personalized AI workout plans
- 🥗 AI-powered diet recommendations
- 🤖 Fitness chatbot assistant
- 📊 Progress tracking & analytics dashboard
- 👤 User profile management
- 🔐 JWT authentication
- 🛡️ Admin panel

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts |
| Backend | Node.js, Express 4, MongoDB, Mongoose |
| AI | Groq API (llama-3.3-70b-versatile), Hugging Face |
| Deploy | Vercel, Render, MongoDB Atlas |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key

### Installation

```bash
# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install
```

### Environment Variables

Create `.env` files in both `client/` and `server/` directories. See `.env.example` files for required variables.

### Development

```bash
# Start backend (from server/)
npm run dev

# Start frontend (from client/)
npm run dev
```

## Project Structure

```
AI_FITNESS_COACH/
├── client/          # React + Vite frontend
├── server/          # Express backend
├── .gitignore
└── README.md
```

## License

MIT
