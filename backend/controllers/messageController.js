import Message from '../models/Message.js'
import Notification from '../models/Notification.js'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'
import User from '../models/User.js'
import mongoose from 'mongoose'

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
        const userObjectId = new mongoose.Types.ObjectId(userId)

        // Aggregation to find conversations, latest message, and unread count
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userObjectId },
                        { recipient: userObjectId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$sender', userObjectId] },
                            then: '$recipient',
                            else: '$sender'
                        }
                    },
                    latestMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$recipient', userObjectId] },
                                        { $eq: ['$read', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partnerDetails'
                }
            },
            {
                $unwind: '$partnerDetails'
            },
            {
                $project: {
                    _id: '$partnerDetails._id',
                    name: '$partnerDetails.name',
                    profilePic: '$partnerDetails.profilePic',
                    headline: '$partnerDetails.headline',
                    latestMessage: {
                        content: '$latestMessage.content',
                        createdAt: '$latestMessage.createdAt',
                        isOwn: { $eq: ['$latestMessage.sender', userObjectId] },
                        read: '$latestMessage.read'
                    },
                    unreadCount: 1
                }
            },
            {
                $sort: { 'latestMessage.createdAt': -1 }
            }
        ])

        res.json(conversations)
    } catch (error) {
        console.error('Get Conversations Error:', error)
        res.status(500).json({ message: error.message })
    }
}
