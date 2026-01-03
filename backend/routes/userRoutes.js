import express from 'express'
import { getUserProfile, updateUserProfile, getAllUsers, sendConnectionRequest, acceptConnectionRequest } from '../controllers/userController.js'

import { upload } from '../middleware/upload.js'

const router = express.Router()

router.get('/', getAllUsers)
router.get('/:id', getUserProfile)
router.put('/:id', upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), updateUserProfile)
router.post('/connect', sendConnectionRequest)
router.post('/connect/accept', acceptConnectionRequest)

export default router
