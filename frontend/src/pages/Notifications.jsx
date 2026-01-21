import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { Bell, UserPlus, Briefcase, MessageSquare, ThumbsUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Notifications() {
    const { user } = useContext(UserContext)
    const [notifications, setNotifications] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        fetchNotifications()
    }, [])

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

        // Navigation logic
        const { type, relatedId, sender } = notification

        // If no relatedId, usually go to profile of sender
        const targetId = relatedId || (sender?._id || sender)

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
                break
            case 'like':
            case 'comment':
                // Assuming we might have a single post view or just go to feed. 
                // Currently no /posts/:id route in AppRoutes, so maybe just go to profile or show toast?
                // Let's assume we can navigate to the profile of the liker for now, OR if we had a post detail page 
                if (relatedId) {
                    // For now, since we don't have a dedicated post page (except maybe in feed), 
                    // we can't deep direct easily without that route. 
                    // Let's redirect to sender profile as a meaningful fallback or Feed
                    navigate('/') // Or create a PostDetails page later
                    toast('View this post in your feed')
                }
                break
            default:
                break
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'connection_request': return <UserPlus className="text-blue-600" />
            case 'new_job': return <Briefcase className="text-green-600" />
            case 'like': return <ThumbsUp className="text-blue-600" />
            case 'comment': return <MessageSquare className="text-green-600" />
            case 'job_application':
            case 'job_apply':
            case 'application_status': return <Briefcase className="text-blue-600" />
            default: return <Bell className="text-gray-500" />
        }
    }

    const getMessage = (n) => {
        switch (n.type) {
            case 'connection_request': return `sent you a connection request`
            case 'connection_accepted': return `accepted your connection request`
            case 'new_job': return `posted a new job`
            case 'like': return `liked your post`
            case 'comment': return `commented on your post`
            case 'job_application': return `applied for your job`
            case 'application_status': return `updated your application status`
            default: return 'sent a notification'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow px-4 py-2">
            <h2 className="text-xl font-bold py-4 border-b">Notifications</h2>
            <div>
                {notifications.length === 0 ? <p className="p-4 text-center text-gray-500">No notifications yet.</p> : (
                    notifications.map(n => (
                        <div
                            key={n._id}
                            className={`flex items-start gap-4 p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                            onClick={() => handleNotificationClick(n)}
                        >
                            <div className="mt-1">{getIcon(n.type)}</div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    {n.message ? (
                                        <span>{n.message}</span>
                                    ) : (
                                        <>
                                            <span className="font-bold">{n.sender?.name || 'Someone'}</span> {getMessage(n)}
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {n.createdAt ? (
                                        (() => {
                                            const date = new Date(n.createdAt)
                                            return isNaN(date.getTime()) ? 'Just now' : `${formatDistanceToNow(date)} ago`
                                        })()
                                    ) : 'Just now'}
                                </p>
                            </div>
                            {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
