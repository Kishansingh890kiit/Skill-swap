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
![Screenshot 2025-07-05 235110](https://github.com/user-attachments/assets/a77f8b63-5910-4662-9257-6db16d8b90f6)
![Screenshot 2025-07-05 235045](https://github.com/user-attachments/assets/ec0cbc7d-69b5-4717-8697-eaa051eddf68)
![Screenshot 2025-07-05 235018](https://github.com/user-attachments/assets/e20133c2-f614-453a-bc3d-b9548b13c3c9)
![Screenshot 2025-07-05 235000](https://github.com/user-attachments/assets/a7b184ea-89e7-4489-a266-830239f02860)
![Screenshot 2025-07-05 234945](https://github.com/user-attachments/assets/2f0ffdec-1b55-49b0-9144-a159dda1836c)
