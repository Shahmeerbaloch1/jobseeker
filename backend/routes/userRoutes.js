import express from 'express'
import {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getProfileViews,
    getMutualConnections,
    searchUsers,
    deleteAccount
} from '../controllers/userController.js'

import { upload } from '../middleware/upload.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/search', searchUsers)
router.get('/', getAllUsers)
router.get('/:id', getUserProfile)
router.get('/mutual/:userId/:targetId', getMutualConnections)
router.put('/:id', protect, upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), updateUserProfile)
router.post('/connect', protect, sendConnectionRequest)
router.post('/connect/accept', protect, acceptConnectionRequest)
router.post('/connect/reject', protect, rejectConnectionRequest)
router.get('/:id/views', protect, getProfileViews)
router.delete('/:id', protect, deleteAccount)

export default router
