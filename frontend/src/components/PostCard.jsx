import { useState, useContext, useEffect, useRef } from 'react'
import { UserContext } from '../context/UserContext'
import { ThumbsUp, MessageCircle, Share2, Send, MoreHorizontal, Trash2, Edit2, Clock, Paperclip } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'
import ConfirmationModal from './ConfirmationModal'
import { Link } from 'react-router-dom'

export default function PostCard({ post, onDelete }) {
    const { user } = useContext(UserContext)
    const [showOptions, setShowOptions] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post.content)
    const [likes, setLikes] = useState(post.likes || [])
    const [comments, setComments] = useState(post.comments || [])
    const [shares, setShares] = useState(post.shares || [])
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const videoRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => { }) // Auto-play might be blocked
                } else {
                    videoRef.current?.pause()
                }
            },
            { threshold: 0.6 } // Play when 60% visible
        )

        if (videoRef.current) {
            observer.observe(videoRef.current)
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current)
            }
        }
    }, [post])

    const isLiked = likes?.includes(user?._id || user?.id)
    const isAuthor = user && (user._id === post.author._id || user.id === post.author._id || user._id === post.author || user.id === post.author)

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

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/posts/${post._id}`)
            if (onDelete) {
                onDelete(post._id)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete post')
        }
    }

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/posts/${post._id}`, { content: editContent })
            setIsEditing(false)
            post.content = editContent // Optimistic update or refetch
        } catch (error) {
            console.error(error)
            toast.error('Failed to update post')
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

    const handleShare = async () => {
        try {
            await axios.put(`http://localhost:5000/api/posts/${post._id}/share`, { userId: user._id || user.id })
            if (shares?.includes(user?._id || user?.id)) {
                setShares(shares.filter(id => id !== (user._id || user.id)))
            } else {
                setShares([...shares, user._id || user.id])
            }
            setShowShareModal(true)
            // Copy link to clipboard
            const postLink = `${window.location.origin}/posts/${post._id}`
            navigator.clipboard.writeText(postLink)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setShowShareModal(false), 2000)
        } catch (error) {
            console.error(error)
            toast.error('Failed to share post')
        }
    }

    const getMediaUrl = (url) => {
        if (!url) return ''
        return url.startsWith('http') ? url : `http://localhost:5000${url}`
    }

    const getVideoThumbnail = (url) => {
        if (!url) return ''
        const fullUrl = getMediaUrl(url)
        // If it's a Cloudinary URL (contains /upload/), replace extension with .jpg
        if (fullUrl.includes('/upload/')) {
            return fullUrl.replace(/\.[^/.]+$/, ".jpg")
        }
        return fullUrl // Fallback
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden relative group transition-all hover:shadow-md">
            {/* Header */}
            <div className="p-3 sm:p-4 flex gap-2 sm:gap-3 justify-between items-start">
                <div className="flex gap-2 sm:gap-3">
                    <Link to={`/profile/${post.author._id || post.author.id}`} className="shrink-0">
                        {post.author.profilePic ? (
                            <img src={getMediaUrl(post.author.profilePic)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 border-2 border-white shadow-sm text-sm sm:text-base">
                                {post.author.name?.[0]}
                            </div>
                        )}
                    </Link>
                    <div className="min-w-0">
                        <h4 className="font-black text-gray-900 leading-tight hover:text-blue-600 cursor-pointer transition-colors text-sm sm:text-base truncate">{post.author.name}</h4>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold mt-0.5 line-clamp-1">{post.author.headline || 'Professional Member'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                {post.createdAt ? (
                                    (() => {
                                        const date = new Date(post.createdAt)
                                        return isNaN(date.getTime()) ? 'Just now' : `${formatDistanceToNow(date)} ago`
                                    })()
                                ) : 'Just now'}
                            </p>
                            <span className="text-gray-300">•</span>
                            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Public</span>
                        </div>
                    </div>
                </div>

                {isAuthor && (
                    <div className="relative">
                        <button onClick={() => setShowOptions(!showOptions)} className="text-gray-400 hover:text-gray-900 p-1.5 sm:p-2 rounded-xl hover:bg-gray-50 transition-all">
                            <MoreHorizontal size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 top-10 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 w-48 z-10 animate-in fade-in zoom-in duration-200">
                                <button onClick={() => { setIsEditing(true); setShowOptions(false) }} className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-bold flex items-center gap-3">
                                    <Edit2 size={16} /> Edit Post
                                </button>
                                <button onClick={() => { setIsDeleteModalOpen(true); setShowOptions(false) }} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition-colors text-sm font-bold flex items-center gap-3">
                                    <Trash2 size={16} /> Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-4 sm:px-5 pb-4">
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl p-3 sm:p-4 text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none resize-none text-sm sm:text-[15px]"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                            <button onClick={handleUpdate} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-blue-600 text-white rounded-full text-xs sm:text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Save Changes</button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words w-full overflow-hidden">{post.content}</p>
                )}
            </div>

            {post.mediaUrl && post.mediaType === 'image' && (
                <div className="bg-gray-50 border-y border-gray-100 flex items-center justify-center">
                    <img src={getMediaUrl(post.mediaUrl)} alt="Post media" className="w-full h-auto max-h-[400px] sm:max-h-[600px] object-cover sm:object-contain" />
                </div>
            )}

            {post.mediaUrl && post.mediaType === 'video' && (
                <div className="bg-black border-y border-gray-100 relative group/video">
                    <video
                        ref={videoRef}
                        src={getMediaUrl(post.mediaUrl)}
                        controls
                        muted // Autoplay generally requires muted
                        playsInline
                        className="w-full h-auto max-h-[400px] sm:max-h-[600px] object-cover sm:object-contain"
                        poster={getVideoThumbnail(post.mediaUrl)}
                    />
                </div>
            )}

            {post.mediaUrl && post.mediaType === 'pdf' && (
                <div className="mx-4 sm:mx-5 mb-4 p-3 sm:p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between group cursor-pointer hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                        <div className="p-2 sm:p-2.5 bg-white rounded-xl shadow-sm text-blue-600 shrink-0">
                            <Paperclip size={16} className="sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-[10px] sm:text-sm font-black text-blue-700 uppercase tracking-tighter truncate">Document Attachment</span>
                    </div>
                    <a href={getMediaUrl(post.mediaUrl)} target="_blank" rel="noreferrer" className="text-[10px] sm:text-xs font-black bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 shrink-0 ml-2">View PDF</a>
                </div>
            )}

            {/* Stats */}
            {(likes.length > 0 || comments.length > 0 || shares.length > 0) && (
                <div className="px-4 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold text-gray-500 flex justify-between items-center border-t border-gray-50">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {likes.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <div className="flex -space-x-1.5">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full border border-white flex items-center justify-center">
                                        <ThumbsUp size={8} className="sm:w-2.5 sm:h-2.5 text-white fill-white" />
                                    </div>
                                </div>
                                <span>{likes.length}</span>
                            </div>
                        )}
                        {shares.length > 0 && (
                            <span>{shares.length} {shares.length === 1 ? 'Share' : 'Shares'}</span>
                        )}
                    </div>
                    {comments.length > 0 && (
                        <button onClick={() => setShowComments(!showComments)} className="hover:text-blue-600 hover:underline transition-colors">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</button>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-0.5 p-0.5 border-t border-gray-100 bg-gray-50/20">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl transition-all active:scale-95 hover:bg-white hover:shadow-sm ${isLiked ? 'text-blue-600' : 'text-gray-500'}`}
                >
                    <ThumbsUp size={18} className="sm:w-5 sm:h-5" fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                    <span className="text-[11px] sm:text-sm font-black uppercase tracking-wider hidden xs:inline">Like</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl transition-all active:scale-95 hover:bg-white hover:shadow-sm text-gray-500"
                >
                    <MessageCircle size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    <span className="text-[11px] sm:text-sm font-black uppercase tracking-wider hidden xs:inline">Comment</span>
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl transition-all active:scale-95 hover:bg-white hover:shadow-sm text-gray-500">
                    <Share2 size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    <span className="text-[11px] sm:text-sm font-black uppercase tracking-wider hidden xs:inline">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top duration-300">
                    <form onSubmit={handleComment} className="flex gap-3 mb-6">
                        {user?.profilePic ? (
                            <img src={getMediaUrl(user.profilePic)} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{user?.name?.[0]}</div>
                        )}
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a thoughtful comment..."
                                className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center">
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                    <div className="space-y-4">
                        {comments.map((comment, idx) => (
                            <div key={idx} className="flex gap-3 group/comment">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center text-sm font-black shadow-sm overflow-hidden">
                                    {comment.author?.profilePic ? (
                                        <img src={getMediaUrl(comment.author.profilePic)} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400">{comment.author?.name?.[0] || '?'}</span>
                                    )}
                                </div>
                                <div className="bg-white rounded-2xl p-4 flex-1 shadow-sm border border-gray-100 group-hover/comment:border-blue-100 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-black text-[13px] text-gray-900 leading-none">{comment.author?.name || 'Someone'}</h5>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Just now</span>
                                    </div>
                                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone and will be removed from everyone's feed."
                confirmText="Permanently Delete"
                cancelText="Nevermind"
            />
        </div>
    )
}
