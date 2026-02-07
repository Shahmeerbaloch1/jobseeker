import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/sendEmail.js'

export const register = async (req, res) => {
    try {
        const { name, email: rawEmail, password, role } = req.body
        const email = rawEmail.toLowerCase()

        // Check if user exists
        let user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: 'User already exists' })

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Generate Verification Code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Create user
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            verificationCode,
            verificationCodeExpires,
            isVerified: false
        })

        // Send Email
        await sendVerificationEmail(email, verificationCode)

        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            email: user.email
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { email: rawEmail, code } = req.body
        const email = rawEmail.toLowerCase()

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'User not found' })

        if (user.isVerified) return res.status(400).json({ message: 'Email already verified' })

        if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired verification code' })
        }

        user.isVerified = true
        user.verificationCode = undefined
        user.verificationCodeExpires = undefined
        await user.save()

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.json({ token, user: { id: user._id, name: user.name, role: user.role, profilePic: user.profilePic } })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const resendVerificationCode = async (req, res) => {
    try {
        const { email: rawEmail } = req.body
        const email = rawEmail.toLowerCase()
        const user = await User.findOne({ email })

        if (!user) return res.status(400).json({ message: 'User not found' })
        if (user.isVerified) return res.status(400).json({ message: 'Email already verified' })

        // Generate new code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000)

        user.verificationCode = verificationCode
        user.verificationCodeExpires = verificationCodeExpires
        await user.save()

        await sendVerificationEmail(email, verificationCode)

        res.json({ message: 'Verification code resent' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email: rawEmail, password } = req.body
        const email = rawEmail.toLowerCase()

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'Invalid credentials' })

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email to login' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.json({ token, user: { id: user._id, name: user.name, role: user.role, profilePic: user.profilePic } })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getMe = async (req, res) => {
    // Middleware should attach user to req
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email: rawEmail } = req.body
        const email = rawEmail.toLowerCase()
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: 'Email does not exist' })

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
        const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000)

        user.resetPasswordCode = resetCode
        user.resetPasswordExpires = resetCodeExpires
        await user.save()

        await sendResetPasswordEmail(email, resetCode)
        res.json({ message: 'Reset code sent to your email' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body
        const user = await User.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) return res.status(400).json({ message: 'Invalid or expired reset code' })

        res.json({ message: 'Code verified successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body
        const user = await User.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) return res.status(400).json({ message: 'Invalid or expired reset code' })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        user.resetPasswordCode = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.json({ message: 'Password reset successful. You can now login with your new password.' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
