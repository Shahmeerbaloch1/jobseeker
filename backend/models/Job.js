import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
    title: String,
    description: String,
    company: String,
    location: String,
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

export default mongoose.model('Job', jobSchema)
