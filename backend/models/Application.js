import mongoose from "mongoose";

export default mongoose.model('Application', new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    applicantPhone: { type: String, required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'rejected', 'selected', 'stopped'], default: 'pending' }
}, { timestamps: true }))
