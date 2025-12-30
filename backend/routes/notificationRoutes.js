import express from 'express'
import { getNotifications, markRead } from '../controllers/notificationController.js'

const router = express.Router()

router.get('/:userId', getNotifications)
router.put('/read', markRead)

export default router
