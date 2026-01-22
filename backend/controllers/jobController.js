import Job from '../models/Job.js'
import Application from '../models/Application.js'
import Notification from '../models/Notification.js'

export const createJob = async (req, res) => {
    try {
        // Ensure author is set from body or token (ideally token middleware adds user to req)
        const jobData = { ...req.body, author: req.body.author }
        if (!jobData.author) {
            return res.status(400).json({ message: 'Author ID is required' })
        }
        const job = await Job.create(jobData)
        res.status(201).json(job)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params
        const job = await Job.findById(id)

        if (!job) return res.status(404).json({ message: 'Job not found' })

        // Check if user is the author
        // Assuming req.user is populated by protect middleware
        if (job.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        await Job.findByIdAndDelete(id)
        // Optionally delete associated applications? For now we keep them or let them be orphaned/handled by hooks.
        // Let's also remove the job from connections or User posted jobs if configured there.
        // Typically we should also delete applications.
        await Application.deleteMany({ job: id })

        res.json({ message: 'Job removed' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getJobs = async (req, res) => {
    try {
        const { search, location, type } = req.query
        let query = {}

        if (search) query.title = { $regex: search, $options: 'i' }
        if (location) query.location = { $regex: location, $options: 'i' }

        const jobs = await Job.find(query).sort({ createdAt: -1 })
        res.json(jobs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params
        const { applicantId, coverLetter, applicantName, applicantEmail, applicantPhone, responses } = req.body

        let resumeUrl = ''
        if (req.file) {
            resumeUrl = `/uploads/${req.file.filename}`
        }

        // Parse responses if sent as JSON string (multi-part form data usually sends objects as strings)
        // Or if simple JSON body. Since we use 'upload.single', it's multipart/form-data.
        let parsedResponses = []
        if (responses) {
            try {
                parsedResponses = typeof responses === 'string' ? JSON.parse(responses) : responses
            } catch (e) {
                parsedResponses = []
            }
        }

        // Check for existing application
        const existingApplication = await Application.findOne({ job: jobId, applicant: applicantId })
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' })
        }

        const application = await Application.create({
            job: jobId,
            applicant: applicantId,
            applicantName,
            applicantEmail,
            applicantPhone,
            resumeUrl,
            coverLetter,
            responses: parsedResponses
        })

        // Add applicant to job and notify author
        const job = await Job.findById(jobId)
        if (!job) return res.status(404).json({ message: 'Job not found' })

        // Add to applicants list if not present (redundant check if UI works, but safe)
        if (!job.applicants.includes(applicantId)) {
            job.applicants.push(applicantId)
            await job.save()
        }

        await Notification.create({
            recipient: job.author,
            sender: applicantId,
            type: 'job_application',
            relatedId: application._id
        })

        // Emit socket event if io is attached
        if (req.io) {
            req.io.to(job.author.toString()).emit('new_notification', {
                type: 'job_application',
                message: `New application for ${job.title}`
            })
        }

        res.status(201).json(application)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const searchJobs = async (req, res) => {
    try {
        const { search, location } = req.query
        let query = {}

        if (search) query.title = { $regex: search, $options: 'i' }
        if (location) query.location = { $regex: location, $options: 'i' }

        const jobs = await Job.find(query).sort({ createdAt: -1 })
        res.json(jobs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('author', 'name email')
        if (!job) return res.status(404).json({ message: 'Job not found' })
        res.json(job)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const application = await Application.findById(id).populate('job')
        if (!application) return res.status(404).json({ message: 'Application not found' })

        if (application.job.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        application.status = status
        await application.save()

        await Notification.create({
            recipient: application.applicant,
            sender: req.user.id,
            type: 'application_status',
            relatedId: application.job._id,
            message: `Your application for ${application.job.title} was ${status}`
        })

        if (req.io) {
            req.io.to(application.applicant.toString()).emit('new_notification', {
                type: 'application_status',
                message: `Your application status updated: ${status}`
            })
        }

        res.json(application)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getUserApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate('job', 'title company location type')
        res.json(applications)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params
        const job = await Job.findById(jobId)
        if (job.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' })
        }

        const applications = await Application.find({ job: jobId })
            .populate('applicant', 'name email headline profilePic')

        res.json(applications)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getMyPostedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ author: req.user.id }).sort({ createdAt: -1 })
        res.json(jobs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
