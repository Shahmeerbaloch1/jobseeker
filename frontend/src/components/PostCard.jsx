import { useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { ThumbsUp, MessageCircle, Share2, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'

export default function PostCard({ post }) {
    const { user } = useContext(UserContext)
    const [likes, setLikes] = useState(post.likes)
    const [comments, setComments] = useState(post.comments)
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')

    const isLiked = likes.includes(user?._id || user?.id)

    const handleLike = async () => {
        try {
            await axios.put(`http://localhost:5000/api/posts/${post._id}/like`, { userId: user._id || user.id })
            if (isLiked) {
                setLikes(likes.filter(id => id !== (user._id || user.id)))
            } else {
                setLikes([...likes, user._id || user.id])
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleComment = async (e) => {
        e.preventDefault()
        if (!commentText.trim()) return

        try {
            const res = await axios.post(`http://localhost:5000/api/posts/${post._id}/comment`, {
                userId: user._id || user.id,
                content: commentText
            })
            setComments([...comments, res.data])
            setCommentText('')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow mb-4">
            {/* Header */}
            <div className="p-4 flex gap-3">
                {post.author.profilePic ? (
                    <img src={`http://localhost:5000${post.author.profilePic}`} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                        {post.author.name[0]}
                    </div>
                )}
                <div>
                    <h4 className="font-bold text-gray-900">{post.author.name}</h4>
                    <p className="text-xs text-gray-500">{post.author.headline || 'Member'}</p>
                    <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.createdAt))} ago</p>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.mediaUrl && post.mediaType === 'image' && (
                <img src={`http://localhost:5000${post.mediaUrl}`} alt="Post media" className="w-full object-cover max-h-[500px]" />
            )}
            {post.mediaUrl && post.mediaType === 'pdf' && (
                <div className="mx-4 my-2 p-3 bg-gray-100 rounded border border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 truncate">📄 PDF Attachment</span>
                    <a href={`http://localhost:5000${post.mediaUrl}`} target="_blank" className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Download</a>
                </div>
            )}

            {/* Stats */}
            <div className="px-4 py-2 text-xs text-gray-500 border-b flex justify-between">
                <span>{likes.length} Likes</span>
                <span>{comments.length} Comments</span>
            </div>

            {/* Actions */}
            <div className="flex justify-between px-4 py-1">
                <button onClick={handleLike} className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${isLiked ? 'text-blue-600' : 'text-gray-600'}`}>
                    <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} /> <span className="text-sm font-semibold">Like</span>
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-gray-600">
                    <MessageCircle size={18} /> <span className="text-sm font-semibold">Comment</span>
                </button>
                <button className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-gray-600">
                    <Share2 size={18} /> <span className="text-sm font-semibold">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="p-4 bg-gray-50 rounded-b-lg">
                    <form onSubmit={handleComment} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button type="submit" className="text-blue-600 p-2 hover:bg-blue-50 rounded-full"><Send size={18} /></button>
                    </form>
                    <div className="space-y-3">
                        {comments.map((comment, idx) => (
                            <div key={idx} className="flex gap-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">
                                    {comment.author?.name?.[0] || '?'}
                                </div>
                                <div className="bg-gray-200 rounded-lg p-3 flex-1">
                                    <h5 className="font-bold text-xs text-gray-900">{comment.author?.name || 'Unknown'}</h5>
                                    <p className="text-sm text-gray-800">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
