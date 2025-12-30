import express from 'express'
import { createJob, getJobs, applyForJob } from '../controllers/jobController.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()
router.post('/', createJob)
router.get('/', getJobs)
router.post('/:jobId/apply', upload.single('resume'), applyForJob)

export default router
