import User from '../models/User.js'
import Connection from '../models/Connection.js'
import Notification from '../models/Notification.js'

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('connections', 'name profilePic headline')
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        // Validate logged in user matches param id or use req.user.id from middleware
        // For simplicity using req.body data but ideally strict checking
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
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
