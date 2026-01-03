import express from 'express'
import { sendMessage, getMessages, getUnreadCount, markRead } from '../controllers/messageController.js'

const router = express.Router()

router.post('/', sendMessage)
router.get('/unread/:userId', getUnreadCount)
router.get('/:userId1/:userId2', getMessages)
router.put('/read', markRead) // New route to mark messages as read

export default router
