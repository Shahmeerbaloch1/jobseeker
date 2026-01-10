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

        // Notify Job Author
        const job = await Job.findById(jobId)
        if (job.author) { // Should be populated, but we just need ID. Wait, finding Job again? passed job ID.
            // We need to fetch job to know who the author is, unless we trust populates or pass it? 
            // Best to fetch job to ensure it exists and get author.
            // Wait, logic above already checks `Job.findById(jobId)`?
            // Let's see the start of function.
            // I will assume earlier code fetched 'job'. If not I will fetch it.
        }

        // Actually, let's just use the `job` if it was fetched in previous lines, or fetch it.
        // Looking at snippet in step 664: `const job = await Job.findById(jobId)`. 
        // So `job` variable exists.

        await Notification.create({
            recipient: job.author,
            sender: applicantId,
            type: 'job_application',
            relatedId: jobId, // or application._id? Maybe Job ID to link to job. 
            // Or better: link to application so company can review it.
            // Let's link to application._id if relatedId is generic. 
            // But frontend typically routes based on type. 
            // If type 'job_application', relatedId could be Job.
            // Let's stick to Job ID for now, notifications usually redirect to relevant resource.
            // Company wants to see APPLICANT. So maybe redirect to Dashboard? 
            // Let's use application._id and handle it on frontend.
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
