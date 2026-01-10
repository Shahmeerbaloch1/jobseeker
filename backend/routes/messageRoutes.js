import express from 'express'
import { sendMessage, getMessages, getUnreadCount, markRead, getConversations } from '../controllers/messageController.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.post('/', upload.single('file'), sendMessage)
router.get('/unread/:userId', getUnreadCount)
router.get('/conversations/:userId', getConversations)
router.get('/:userId1/:userId2', getMessages)
router.put('/read', markRead) // New route to mark messages as read

export default router
