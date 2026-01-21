import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'company'], default: 'user' },
    profilePic: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: [String],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profileViews: [{
        viewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        viewedAt: { type: Date, default: Date.now }
    }],
    verificationCode: String,
    verificationCodeExpires: Date,
    isVerified: { type: Boolean, default: false }
})

export default mongoose.model('User', userSchema)
