import Message from '../models/Message.js'
import Notification from '../models/Notification.js'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'
import User from '../models/User.js'

export const sendMessage = async (req, res) => {
    try {
        const { senderId, recipientId, content } = req.body
        let attachment = null
        let originalName = null

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'attachments',
                resource_type: 'auto'
            })
            attachment = result.secure_url
            originalName = req.file.originalname
            fs.unlinkSync(req.file.path)
        }

        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content,
            attachment,
            originalName
        })

        // Real-time: Emit to recipient's room
        req.io.to(recipientId).emit('receive_message', message)

        // Also emit a notification event specifically for badge counts if clients listen to it
        // Or client can just use 'receive_message' to increment count

        res.status(201).json(message)
    } catch (error) {
        console.error(error)
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

export const getConversations = async (req, res) => {
    try {
        const { userId } = req.params

        // Find all unique interaction partners
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }] // Note: String vs ObjectId matching depends on how they are stored. Mongoose usually casts, but aggregation doesn't.
                    // Ideally we cast input userId to ObjectId if Schema uses ObjectId.
                    // For now, let's assume standard behavior or fix input.
                }
            },
            {
                $sort: { createdAt: -1 } // Newest first
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", { $toObjectId: userId }] },
                            "$recipient",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 } // Sort conversations by latest message
            }
        ])

        // Populate user details for each conversation
        const populatedConversations = await User.populate(conversations, {
            path: "_id",
            select: "name profilePic headline"
        })

        // Format result to match frontend expectation (clean user object + last message info)
        const result = populatedConversations.map(c => {
            const partner = c._id
            // If partner is null (deleted user?), skip or handle
            if (!partner) return null
            return {
                ...partner.toObject(),
                lastMessage: c.lastMessage
            }
        }).filter(Boolean)

        res.json(result)
    } catch (error) {
        console.error("Get Conversations Error:", error)
        res.status(500).json({ message: error.message })
    }
}
