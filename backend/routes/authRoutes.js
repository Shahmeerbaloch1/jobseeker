import express from 'express'
import { register, login, getMe } from '../controllers/authController.js'
// Need auth middleware for getMe, skipping for now or will implement if needed
const router = express.Router()

import { protect } from '../middleware/authMiddleware.js'

router.get('/me', protect, getMe)
router.post('/register', register)
router.post('/login', login)

export default router
