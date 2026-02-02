import User from '../models/User.js'
import Connection from '../models/Connection.js'
import Notification from '../models/Notification.js'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('connections', 'name profilePic headline')

        // Record profile view
        // Check if query parameter or header has the viewer ID (since middleware might not be fully used on this public route, or we can trust the client to send it if logged in)
        // Ideally, we use req.user.id from middleware if protected.
        // Let's assume the client sends ?viewerId=<id> purely for this feature if not fully protected, or we check req.header.
        // Actually, Profile page is likely protected or we have the user context.
        // Let's check req.user from middleware if available, or query param as fallback.
        const viewerId = req.user?.id || req.query.viewerId

        if (viewerId && viewerId !== req.params.id) {
            // Check if already viewed recently? For now, just simple push.
            // Using addToSet or check manually to avoid spam? 
            // User requested "count first time", so let's check if already viewed.
            // "agar koi mere profile view first time tho wo count ho" -> implies unique views.

            const alreadyViewed = user.profileViews.some(view => view.viewer.toString() === viewerId)
            if (!alreadyViewed) {
                user.profileViews.push({ viewer: viewerId })
                await user.save()
            }
        }

        res.json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const updateData = { ...req.body }

        if (req.files) {
            if (req.files.profilePic) {
                const result = await cloudinary.uploader.upload(req.files.profilePic[0].path, { folder: 'profiles' })
                updateData.profilePic = result.secure_url
                fs.unlinkSync(req.files.profilePic[0].path)
            }
            if (req.files.coverImage) {
                const result = await cloudinary.uploader.upload(req.files.coverImage[0].path, { folder: 'covers' })
                updateData.coverImage = result.secure_url
                fs.unlinkSync(req.files.coverImage[0].path)
            }
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
        res.json(updatedUser)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const requesterId = req.query.userId

        // 1. Get requester's connections first
        const requester = await User.findById(requesterId).select('connections')
        const requesterConnectionIds = requester ? requester.connections.map(id => id.toString()) : []

        // 2. Fetch all users with their connections populated (just IDs needed really, but populated is fine if schema handles it)
        // Actually for mutual count, we just need the array of IDs. 
        // Let's use select to get connections array.
        const users = await User.find().select('name profilePic headline connections')

        if (requesterId) {
            const connections = await Connection.find({
                $or: [{ requester: requesterId }, { recipient: requesterId }]
            })

            // Map user to status and mutual count
            const usersWithData = users.map(u => {
                // Connection Status Logic
                const conn = connections.find(c =>
                    (c.requester.toString() === requesterId && c.recipient.toString() === u._id.toString()) ||
                    (c.recipient.toString() === requesterId && c.requester.toString() === u._id.toString())
                )

                let status = 'none'
                if (conn) {
                    if (conn.status === 'accepted') status = 'accepted'
                    else if (conn.status === 'pending') {
                        status = conn.requester.toString() === requesterId ? 'pending_sent' : 'pending_received'
                    }
                }

                // Mutual Connections Logic
                // Filter u.connections that are also in requesterConnectionIds
                // Note: u.connections might be ObjectIds, need toString comparison
                const userConnIds = u.connections ? u.connections.map(id => id.toString()) : []
                const mutualCount = userConnIds.filter(id => requesterConnectionIds.includes(id)).length

                return {
                    ...u.toObject(),
                    connectionStatus: status,
                    connectionId: conn ? conn._id : null,
                    mutualConnections: mutualCount
                }
            })
            return res.json(usersWithData)
        }

        res.json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getMutualConnections = async (req, res) => {
    try {
        const { userId, targetId } = req.params

        const userA = await User.findById(userId).select('connections')
        const userB = await User.findById(targetId).select('connections')

        if (!userA || !userB) return res.status(404).json({ message: 'User not found' })

        const userAConns = userA.connections.map(id => id.toString())
        const userBConns = userB.connections.map(id => id.toString())

        // Find intersection
        const mutualIds = userAConns.filter(id => userBConns.includes(id))

        const mutuals = await User.find({ _id: { $in: mutualIds } }).select('name profilePic headline')
        res.json(mutuals)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const sendConnectionRequest = async (req, res) => {
    try {
        const { requesterId, recipientId } = req.body

        // Check if already connected or pending
        const existing = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        })

        if (existing) return res.status(400).json({ message: 'Connection already exists or pending' })

        const connection = await Connection.create({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending'
        })

        const newNotification = await Notification.create({
            recipient: recipientId,
            sender: requesterId,
            type: 'connection_request',
            message: 'sent you a connection request'
        })

        const sender = await User.findById(requesterId).select('name profilePic headline')
        req.io.to(recipientId).emit('new_notification', {
            ...newNotification.toObject(),
            sender
        })

        res.status(201).json(connection)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.body
        const connection = await Connection.findById(connectionId)
        if (!connection) return res.status(404).json({ message: 'Connection not found' })

        connection.status = 'accepted'
        await connection.save()

        // Add to users' connection lists
        await User.findByIdAndUpdate(connection.requester, { $push: { connections: connection.recipient } })
        await User.findByIdAndUpdate(connection.recipient, { $push: { connections: connection.requester } })

        const newNotification = await Notification.create({
            recipient: connection.requester,
            sender: connection.recipient,
            type: 'connection_accepted',
            message: 'accepted your connection request'
        })

        const sender = await User.findById(connection.recipient).select('name profilePic headline')
        req.io.to(connection.requester.toString()).emit('new_notification', {
            ...newNotification.toObject(),
            sender
        })

        res.json(connection)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const rejectConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.body
        const connection = await Connection.findByIdAndDelete(connectionId)
        if (!connection) return res.status(404).json({ message: 'Connection not found' })

        res.json({ message: 'Connection request ignored' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getProfileViews = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('profileViews.viewer', 'name profilePic headline')
        if (!user) return res.status(404).json({ message: 'User not found' })

        // Return the list of views, flattened
        const views = user.profileViews.map(view => ({
            ...view.viewer.toObject(),
            viewedAt: view.viewedAt
        }))

        res.json(views)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

function escapeRegex(text) {
    if (!text) return '';
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const searchUsers = async (req, res) => {
    try {
        const keyword = (req.query.q || req.query.search || req.query.query || '').trim();
        console.log('--- USER SEARCH DIAGNOSTIC ---');
        console.log('Incoming Keyword:', keyword);

        if (!keyword) {
            console.log('Empty keyword, returning []');
            return res.json([]);
        }

        // Use a simple regex without over-escaping to ensure partial matches like 'meer' work.
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        console.log('Search Regex:', regex);

        // Debug: Check if a simple find works
        const users = await User.find({
            $or: [
                { name: { $regex: regex } },
                { headline: { $regex: regex } },
                { skills: { $regex: regex } }
            ]
        }).select('name headline profilePic skills connections');

        console.log(`Query finished. Found ${users.length} users.`);
        if (users.length > 0) {
            console.log('Sample result:', users[0].name);
        } else {
            console.log('No users matched this query in the database.');
        }
        console.log('------------------------------');

        res.json(users);
    } catch (error) {
        console.error('SEARCH CONTROLLER ERROR:', error);
        res.status(500).json({ message: error.message });
    }
}
