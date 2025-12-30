import Job from '../models/Job.js'
import Application from '../models/Application.js'
import Notification from '../models/Notification.js'

export const createJob = async (req, res) => {
    try {
        const job = await Job.create(req.body)
        // Notification logic: requires author field in job to know who to notify?
        // For now, assuming standard job creation
        res.status(201).json(job)
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
        const { applicantId, coverLetter } = req.body

        let resumeUrl = ''
        if (req.file) {
            resumeUrl = `/uploads/${req.file.filename}`
        }

        const application = await Application.create({
            job: jobId,
            applicant: applicantId,
            resumeUrl,
            coverLetter
        })

        res.status(201).json(application)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
