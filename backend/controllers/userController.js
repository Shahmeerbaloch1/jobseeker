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
        // We need to know the connection status relative to the requester
        // This requires passing the requester's ID, e.g. via query or middleware (req.user)
        // Since we don't have middleware fully wired on all routes yet, let's assume client sends ?userId=<myId>
        const requesterId = req.query.userId

        const users = await User.find().select('name profilePic headline')

        if (requesterId) {
            const connections = await Connection.find({
                $or: [{ requester: requesterId }, { recipient: requesterId }]
            })

            // Map user to status
            const usersWithStatus = users.map(u => {
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

                return {
                    ...u.toObject(),
                    connectionStatus: status,
                    connectionId: conn ? conn._id : null
                }
            })
            return res.json(usersWithStatus)
        }

        res.json(users)
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

        await Notification.create({
            recipient: recipientId,
            sender: requesterId,
            type: 'connection_request'
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

        await Notification.create({
            recipient: connection.requester,
            sender: connection.recipient,
            type: 'connection_accepted'
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
