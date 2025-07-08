# 🧠 SkillSwap Hub

A MERN-based AI-powered skill exchange platform where people barter skills like Python for Photoshop instead of using money.

## Features
- 🔐 JWT Authentication
- 🧠 AI-based skill matching using OpenAI
- 🕒 Built-in scheduler and reputation coins
- 💬 Real-time chat with Socket.io

## Tech Stack
- MongoDB + Mongoose
- Express.js
- React.js
- Node.js
- Socket.io
- OpenAI API
- Tailwind CSS

## Project Structure
```
skillswap-hub/
├── client/                     # React Frontend
│   ├── public/
│   └── src/
│       ├── assets/            # Images, logos, etc.
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level components
│       ├── hooks/             # Custom React hooks
│       ├── context/           # Auth and Global State Contexts
│       ├── utils/             # API calls, validators, helpers
│       ├── App.js
│       └── index.js
│
├── server/                    # Express Backend
│   ├── config/                # DB connection, API keys
│   ├── controllers/          # Logic for routes
│   ├── models/               # Mongoose models
│   ├── routes/               # Route handlers
│   ├── middleware/           # Auth middleware, error handler
│   ├── utils/                # Token utils, AI matching
│   └── index.js              # Entry point
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   MONGO_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/skillswap?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   CLIENT_URL=http://localhost:3000
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## License
MIT 
