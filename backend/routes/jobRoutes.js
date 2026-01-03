import express from 'express'
import { createJob, searchJobs, getJobById, applyForJob, updateApplicationStatus, getUserApplications, getJobApplications, getMyPostedJobs } from '../controllers/jobController.js'
import { upload } from '../middleware/upload.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Applications
router.get('/applications/me', protect, getUserApplications) // Seeker: My applications
router.get('/posted', protect, getMyPostedJobs) // Company: My posted jobs
router.get('/:jobId/applications', protect, getJobApplications) // Company: Job applications
router.put('/applications/:id/status', protect, updateApplicationStatus) // Company: Update status

router.post('/', protect, createJob) // Protect job creation
router.get('/', searchJobs)
router.get('/:id', getJobById)

// Apply
router.post('/:jobId/apply', upload.single('resume'), applyForJob) // Ideally protect this too

export default router
