import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Notification from '../models/Notification.js'

export const createPost = async (req, res) => {
    try {
        const { content, mediaType } = req.body
        let mediaUrl = ''
        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`
        }

        const post = await Post.create({
            author: req.body.author, // Should ideally come from auth middleware req.user
            content,
            mediaUrl,
            mediaType: req.file ? mediaType : 'none'
        })

        await post.populate('author', 'name profilePic headline')

        // Real-time: Emit new post event to all clients
        req.io.emit('new_post', post)

        res.status(201).json(post)
    } catch (error) {
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
                await Notification.create({
                    recipient: post.author,
                    sender: userId,
                    type: 'like',
                    relatedId: post._id
                })
                // Real-time notification could be emitted here
            }
        } else {
            post.likes = post.likes.filter(id => id.toString() !== userId)
            await post.save()
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
            await Notification.create({
                recipient: post.author,
                sender: userId,
                type: 'comment',
                relatedId: post._id
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
