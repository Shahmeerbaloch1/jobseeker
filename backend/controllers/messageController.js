import Message from '../models/Message.js'
import Notification from '../models/Notification.js'

export const sendMessage = async (req, res) => {
    try {
        const { senderId, recipientId, content } = req.body

        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content
        })

        // Real-time: Emit to recipient's room
        req.io.to(recipientId).emit('receive_message', message)

        // Notification logic could be optional here since message itself is an alert
        // But let's keep it consistent if needed, or rely on client-side msg event

        res.status(201).json(message)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params

        const messages = await Message.find({
            $or: [
                { sender: userId1, recipient: userId2 },
                { sender: userId2, recipient: userId1 }
            ]
        }).sort({ createdAt: 1 }) // Oldest first for chat history

        res.json(messages)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
