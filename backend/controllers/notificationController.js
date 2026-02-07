import Notification from '../models/Notification.js'

export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'name profilePic')

        // Filter out notifications where the sender no longer exists
        const validNotifications = notifications.filter(n => n.sender !== null)
        res.json(validNotifications)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const markRead = async (req, res) => {
    try {
        const { notificationId } = req.body
        await Notification.findByIdAndUpdate(notificationId, { read: true })
        res.json({ message: 'Marked as read' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
