import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Notification from '../models/Notification.js'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'

export const createPost = async (req, res) => {
    try {
        const { content, mediaType } = req.body
        let mediaUrl = ''

        if (req.file) {
            const uploadOptions = {
                resource_type: 'auto', // Detects image, video, or raw (pdf)
                folder: 'job-social'
            }

            const uploadResult = await cloudinary.uploader.upload(req.file.path, uploadOptions)
            mediaUrl = uploadResult.secure_url

            // Clean up: Delete local file after upload
            fs.unlinkSync(req.file.path)
        }

        const post = await Post.create({
            author: req.body.author,
            content,
            mediaUrl,
            mediaType: req.file ? mediaType : 'none'
        })

        await post.populate('author', 'name profilePic headline')

        // Real-time: Emit new post event to all clients
        req.io.emit('new_post', post)

        res.status(201).json(post)
    } catch (error) {
        console.error('Create Post Error:', error)
        res.status(500).json({ message: error.message })
    }
}

export const getFeed = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name profilePic headline')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'name profilePic' }
            })
        res.json(posts)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const likePost = async (req, res) => {
    try {
        const { postId } = req.params
        const { userId } = req.body

        const post = await Post.findById(postId)
        if (!post.likes.includes(userId)) {
            post.likes.push(userId)
            await post.save()

            // Notify author
            if (post.author.toString() !== userId) {
                const newNotification = await Notification.create({
                    recipient: post.author,
                    sender: userId,
                    type: 'like',
                    relatedId: post._id,
                    message: 'liked your post'
                })

                const sender = await User.findById(userId).select('name profilePic headline')
                req.io.to(post.author.toString()).emit('new_notification', {
                    ...newNotification.toObject(),
                    sender
                })
            }
        } else {
            post.likes = post.likes.filter(id => id.toString() !== userId)
            await post.save()
            // Optionally remove notification if unlike?
        }
        res.json(post)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { postId } = req.params
        const { userId, content } = req.body

        const comment = await Comment.create({
            author: userId,
            post: postId,
            content
        })

        const post = await Post.findById(postId)
        post.comments.push(comment._id)
        await post.save()

        // Notify author
        if (post.author.toString() !== userId) {
            const newNotification = await Notification.create({
                recipient: post.author,
                sender: userId,
                type: 'comment',
                relatedId: post._id,
                message: 'commented on your post'
            })

            const sender = await User.findById(userId).select('name profilePic headline')
            req.io.to(post.author.toString()).emit('new_notification', {
                ...newNotification.toObject(),
                sender
            })
        }

        const populatedComment = await comment.populate('author', 'name profilePic')
        res.status(201).json(populatedComment)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params
        // Ideally verify req.user.id matches post.author or is admin
        const post = await Post.findByIdAndDelete(id)
        if (!post) return res.status(404).json({ message: 'Post not found' })
        res.json({ message: 'Post deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params
        const { content } = req.body
        const post = await Post.findByIdAndUpdate(id, { content }, { new: true })
            .populate('author', 'name profilePic headline')
        if (!post) return res.status(404).json({ message: 'Post not found' })
        res.json(post)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const sharePost = async (req, res) => {
    try {
        const { postId } = req.params
        const { userId } = req.body

        const post = await Post.findById(postId)

        // Initialize shares array if it doesn't exist (for old posts)
        if (!post.shares) {
            post.shares = []
        }

        if (!post.shares.includes(userId)) {
            post.shares.push(userId)
            await post.save()

            // Notify author about the share
            if (post.author.toString() !== userId) {
                const newNotification = await Notification.create({
                    recipient: post.author,
                    sender: userId,
                    type: 'share',
                    relatedId: post._id,
                    message: 'shared your post'
                })

                const sender = await User.findById(userId).select('name profilePic headline')
                req.io.to(post.author.toString()).emit('new_notification', {
                    ...newNotification.toObject(),
                    sender
                })
            }
        } else {
            post.shares = post.shares.filter(id => id.toString() !== userId)
            await post.save()
        }
        res.json(post)
    } catch (error) {
        console.error('Share post error:', error)
        res.status(500).json({ message: error.message })
    }
}

