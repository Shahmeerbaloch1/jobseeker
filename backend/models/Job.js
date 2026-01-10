import mongoose from "mongoose";

export default mongoose.model('Job', new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requirements: { type: String }, // Rich text or bullet points
    skills: [{ type: String }], // Array of strings
    website: { type: String },
    salary: { type: String }, // e.g. "$100k - $120k"
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'], default: 'Full-time' },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    questions: [{
        text: { type: String, required: true },
        type: { type: String, enum: ['yes_no', 'number'], required: true }
    }]
}, { timestamps: true }))
