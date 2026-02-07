import express from 'express'
import {
    register,
    verifyEmail,
    login,
    getMe,
    resendVerificationCode,
    forgotPassword,
    verifyResetCode,
    resetPassword
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/verify-email', verifyEmail)
router.post('/resend-code', resendVerificationCode)
router.post('/login', login)
router.get('/me', protect, getMe)

router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-code', verifyResetCode)
router.post('/reset-password', resetPassword)

export default router
