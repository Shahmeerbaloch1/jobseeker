import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { Bell, UserPlus, Briefcase, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function Notifications() {
    const { user } = useContext(UserContext)
    const [notifications, setNotifications] = useState([])

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

    const handleMarkRead = async (id) => {
        try {
            await axios.put('http://localhost:5000/api/notifications/read', { notificationId: id })
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n))
        } catch (error) {
            console.error(error)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'connection_request': return <UserPlus className="text-blue-600" />
            case 'new_job': return <Briefcase className="text-green-600" />
            case 'like': return <Bell className="text-red-500" /> // Use Heart if available, else Bell
            case 'comment': return <MessageSquare className="text-orange-500" />
            default: return <Bell className="text-gray-500" />
        }
    }

    const getMessage = (n) => {
        switch (n.type) {
            case 'connection_request': return `sent you a connection request`
            case 'new_job': return `posted a new job`
            case 'like': return `liked your post`
            case 'comment': return `commented on your post`
            default: return 'sent a notification'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow px-4 py-2">
            <h2 className="text-xl font-bold py-4 border-b">Notifications</h2>
            <div>
                {notifications.length === 0 ? <p className="p-4 text-center text-gray-500">No notifications yet.</p> : (
                    notifications.map(n => (
                        <div key={n._id} className={`flex items-start gap-4 p-4 border-b last:border-0 hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`} onClick={() => handleMarkRead(n._id)}>
                            <div className="mt-1">{getIcon(n.type)}</div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    <span className="font-bold">{n.sender?.name || 'Someone'}</span> {getMessage(n)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(n.createdAt))} ago</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
