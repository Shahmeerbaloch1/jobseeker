import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { useSocket } from '../context/SocketContext'
import axios from 'axios'
import { Bell, UserPlus, Briefcase, MessageSquare, ThumbsUp, Heart, Share2, Filter, UserIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Notifications() {
    const { user } = useContext(UserContext)
    const { socket } = useSocket()
    const [notifications, setNotifications] = useState([])
    const [filter, setFilter] = useState('all') // all, jobs, connections, activity
    const navigate = useNavigate()

    useEffect(() => {
        if (user) fetchNotifications()
    }, [user])

    useEffect(() => {
        if (socket) {
            socket.on('new_notification', (newNotification) => {
                setNotifications(prev => [newNotification, ...prev])
            })
            return () => socket.off('new_notification')
        }
    }, [socket])

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/notifications/${user._id || user.id}`)
            setNotifications(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            try {
                await axios.put('http://localhost:5000/api/notifications/read', { notificationId: notification._id })
                setNotifications(notifications.map(n => n._id === notification._id ? { ...n, read: true } : n))
            } catch (error) {
                console.error(error)
            }
        }

        const { type, relatedId, sender } = notification

        switch (type) {
            case 'connection_request':
            case 'connection_accepted':
                navigate(`/profile/${sender?._id || sender}`)
                break
            case 'new_job':
            case 'job_apply':
            case 'job_application':
            case 'application_status':
                if (relatedId) navigate(`/jobs/${relatedId}`)
                else navigate('/jobs')
                break
            case 'like':
            case 'comment':
            case 'share':
                // Navigate to feed or sender profile since we assume posts are on feed/profile
                // Ideally could scroll to post if on Feed page
                navigate('/')
                toast('See the post in your feed')
                break
            default:
                break
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true
        if (filter === 'jobs' && ['new_job', 'job_apply', 'job_application', 'application_status'].includes(n.type)) return true
        if (filter === 'connections' && ['connection_request', 'connection_accepted'].includes(n.type)) return true
        if (filter === 'activity' && ['like', 'comment', 'share'].includes(n.type)) return true
        return false
    })

    const getIcon = (type) => {
        switch (type) {
            case 'connection_request': return <UserPlus className="text-blue-600" size={20} />
            case 'connection_accepted': return <UserIcon className="text-green-600" size={20} />
            case 'new_job': return <Briefcase className="text-purple-600" size={20} />
            case 'like': return <Heart className="text-red-500" size={20} />
            case 'comment': return <MessageSquare className="text-blue-500" size={20} />
            case 'share': return <Share2 className="text-gray-600" size={20} />
            case 'job_application': return <Briefcase className="text-orange-500" size={20} />
            case 'application_status': return <Briefcase className="text-indigo-500" size={20} />
            default: return <Bell className="text-gray-500" size={20} />
        }
    }

    const getMessage = (n) => {
        if (n.message) return n.message
        // Fallback if message not populated
        switch (n.type) {
            case 'connection_request': return `sent a connection request`
            case 'connection_accepted': return `accepted your connection`
            case 'new_job': return `posted a new job`
            case 'like': return `liked your post`
            case 'comment': return `commented on your post`
            case 'share': return `shared your post`
            case 'job_application': return `applied for your job`
            case 'application_status': return `updated application status`
            default: return 'notification'
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Notifications</h2>

                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {['all', 'jobs', 'connections', 'activity'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                            <Bell size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">No notifications in this category</p>
                        </div>
                    ) : (
                        filteredNotifications.map(n => (
                            <div
                                key={n._id}
                                onClick={() => handleNotificationClick(n)}
                                className={`flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50' : ''
                                    }`}
                            >
                                <div className="mt-1 p-2 bg-white rounded-full bordered shadow-sm border-gray-100">
                                    {getIcon(n.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm text-gray-900 leading-relaxed">
                                            <span className="font-bold text-gray-900 hover:underline">{n.sender?.name || 'Someone'}</span>{' '}
                                            <span className="text-gray-600">{getMessage(n)}</span>
                                        </p>
                                        <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                                            {n.createdAt && !isNaN(new Date(n.createdAt)) ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                    {n.sender?.headline && (
                                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-md">{n.sender.headline}</p>
                                    )}
                                </div>

                                {!n.read && (
                                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-2 ring-2 ring-blue-100"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

