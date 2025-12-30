import express from 'express'
import { getUserProfile, updateUserProfile, getAllUsers, sendConnectionRequest, acceptConnectionRequest } from '../controllers/userController.js'

const router = express.Router()

router.get('/', getAllUsers)
router.get('/:id', getUserProfile)
router.put('/:id', updateUserProfile)
router.post('/connect', sendConnectionRequest)
router.post('/connect/accept', acceptConnectionRequest)

export default router
