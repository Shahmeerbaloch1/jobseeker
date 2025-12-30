import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { connectDB } from './connection/db.js'
import jobRoutes from './routes/jobRoutes.js'
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import userRoutes from './routes/userRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
connectDB()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins for now, secure in production
    }
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Static files
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join user to their own room for private messages/notifications
    socket.on('join_room', (userId) => {
        if (userId) socket.join(userId)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})

// Attach io to request for controllers
app.use((req, res, next) => {
    req.io = io
    next()
})

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
)
