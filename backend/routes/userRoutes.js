import express from 'express'
import { getUserProfile, updateUserProfile, getAllUsers, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, getProfileViews, getMutualConnections } from '../controllers/userController.js'

import { upload } from '../middleware/upload.js'

const router = express.Router()

router.get('/', getAllUsers)
router.get('/:id', getUserProfile)
router.get('/mutual/:userId/:targetId', getMutualConnections)
router.put('/:id', upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), updateUserProfile)
router.post('/connect', sendConnectionRequest)
router.post('/connect/accept', acceptConnectionRequest)
router.post('/connect/reject', rejectConnectionRequest)
router.get('/:id/views', getProfileViews)

export default router
