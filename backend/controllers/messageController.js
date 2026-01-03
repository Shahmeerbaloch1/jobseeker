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

        // Also emit a notification event specifically for badge counts if clients listen to it
        // Or client can just use 'receive_message' to increment count

        res.status(201).json(message)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) return res.status(400).json({ message: 'User ID required' })

        const count = await Message.countDocuments({
            recipient: userId,
            read: false
        })
        res.json({ count: count || 0 })
    } catch (error) {
        console.error('Get Unread Count Error:', error)
        res.status(500).json({ message: error.message })
    }
}

export const markRead = async (req, res) => {
    try {
        const { senderId, recipientId } = req.body;
        await Message.updateMany(
            { sender: senderId, recipient: recipientId, read: false },
            { $set: { read: true } }
        )
        res.json({ success: true })
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
