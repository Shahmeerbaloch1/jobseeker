import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['like', 'comment', 'connection_request', 'connection_accepted', 'job_apply', 'new_job', 'job_application', 'application_status'], required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of Post, Job, etc.
    message: { type: String },
    read: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)
