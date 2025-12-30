import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'rejected', 'hired'], default: 'pending' }
}, { timestamps: true })

export default mongoose.model('Application', applicationSchema)
