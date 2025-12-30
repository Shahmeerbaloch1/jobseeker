import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { UserPlus, Check, Clock, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Network() {
    const { user } = useContext(UserContext)
    const [users, setUsers] = useState([])

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            // Pass userId to get status relative to me
            const res = await axios.get(`http://localhost:5000/api/users?userId=${user._id || user.id}`)
            // Filter out self
            const filtered = res.data.filter(u => u._id !== (user._id || user.id))
            setUsers(filtered)
        } catch (error) {
            console.error(error)
        }
    }

    const handleConnect = async (recipientId) => {
        try {
            const res = await axios.post('http://localhost:5000/api/users/connect', {
                requesterId: user._id || user.id,
                recipientId
            })
            toast.success('Connection request sent')
            // Optimistic update
            setUsers(users.map(u => u._id === recipientId ? { ...u, connectionStatus: 'pending' } : u))
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to connect')
        }
    }

    const handleAccept = async (connectionId, senderId) => {
        try {
            await axios.post('http://localhost:5000/api/users/connect/accept', { connectionId })
            toast.success('Connected!')
            setUsers(users.map(u => u._id === senderId ? { ...u, connectionStatus: 'accepted' } : u))
        } catch (error) {
            console.error(error)
        }
    }

    const renderActionButton = (u) => {
        if (u.connectionStatus === 'accepted') {
            return (
                <button className="text-gray-500 border border-gray-300 px-4 py-1 rounded-full flex items-center gap-2 font-semibold cursor-default" disabled>
                    <UserCheck size={18} /> Connected
                </button>
            )
        }
        if (u.connectionStatus === 'pending_sent') {
            return (
                <button className="text-orange-500 border border-orange-500 px-4 py-1 rounded-full flex items-center gap-2 font-semibold cursor-default">
                    <Clock size={18} /> Pending
                </button>
            )
        }
        if (u.connectionStatus === 'pending_received') {
            return (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => handleAccept(u.connectionId, u._id)}
                        className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 flex items-center gap-1 font-semibold"
                    >
                        Accept
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 font-semibold px-2">Ignore</button>
                </div>
            )
        }
        return (
            <button
                onClick={() => handleConnect(u._id)}
                className="text-blue-600 border border-blue-600 px-4 py-1 rounded-full hover:bg-blue-50 flex items-center gap-2 font-semibold"
            >
                <UserPlus size={18} /> Connect
            </button>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">People you may know</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(u => (
                    <div key={u._id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                        {u.profilePic ? (
                            <img src={`http://localhost:5000${u.profilePic}`} className="w-20 h-20 rounded-full object-cover mb-3" />
                        ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-gray-500">
                                {u.name[0]}
                            </div>
                        )}
                        <h3 className="font-bold text-lg">{u.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">{u.headline || 'Job Seeker'}</p>
                        {renderActionButton(u)}
                    </div>
                ))}
            </div>
        </div>
    )
}
