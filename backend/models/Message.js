import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachment: { type: String }, // URL to file
    originalName: { type: String },
    read: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Message', messageSchema)
