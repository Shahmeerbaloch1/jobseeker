import express from 'express'
import { createPost, getFeed, likePost, commentOnPost, deletePost, updatePost } from '../controllers/postController.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.post('/', upload.single('media'), createPost)
router.get('/', getFeed)
router.put('/:postId/like', likePost)
router.post('/:postId/comment', commentOnPost)
router.delete('/:id', deletePost)
router.put('/:id', updatePost)

export default router
