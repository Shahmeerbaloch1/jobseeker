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
            const res = await axios.get(`http://localhost:5000/api/users?userId=${user._id || user.id}`)
            const filtered = res.data.filter(u => u._id !== (user._id || user.id))
            setUsers(filtered)
        } catch (error) {
            // Silently fail
        }
    }

    const handleConnect = async (recipientId) => {
        try {
            await axios.post('http://localhost:5000/api/users/connect', {
                requesterId: user._id || user.id,
                recipientId
            })
            toast.success('Connection request sent')
            setUsers(users.map(u => u._id === recipientId ? { ...u, connectionStatus: 'pending_sent' } : u))
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
            // Silently fail
        }
    }

    const renderActionButton = (u) => {
        if (u.connectionStatus === 'accepted') {
            return (
                <button className="w-full bg-gray-50 text-gray-400 border border-gray-100 py-2.5 rounded-xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest cursor-default" disabled>
                    <UserCheck size={16} /> Connected
                </button>
            )
        }
        if (u.connectionStatus === 'pending_sent') {
            return (
                <button className="w-full bg-blue-50 text-blue-600 border border-blue-100 py-2.5 rounded-xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest cursor-default">
                    <Clock size={16} /> Requested
                </button>
            )
        }
        if (u.connectionStatus === 'pending_received') {
            return (
                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => handleAccept(u.connectionId, u._id)}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-100"
                    >
                        Accept
                    </button>
                    <button className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                        Ignore
                    </button>
                </div>
            )
        }
        return (
            <button
                onClick={() => handleConnect(u._id)}
                className="w-full bg-white text-blue-600 border-2 border-blue-600 py-2.5 rounded-xl hover:bg-blue-50 font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
                <UserPlus size={16} /> Connect
            </button>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-2">
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-xl shadow-blue-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight relative z-10">Expand Your <span className="text-blue-100 decoration-blue-200 decoration-4">Inner Circle</span></h2>
                <p className="text-blue-50 font-medium relative z-10 mt-1 opacity-90">Discover professionals who share your passion and expertise.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {users.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
                        <Users size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-900 font-black text-lg">Looking for connections...</p>
                        <p className="text-gray-400 text-sm mt-1">Check back later for more profiles.</p>
                    </div>
                ) : (
                    users.map(u => (
                        <div key={u._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all group/card flex flex-col">
                            {/* Profile Card Header: Mock Cover Photo */}
                            <div className="h-20 bg-gradient-to-tr from-gray-100 to-gray-50 relative group-hover/card:from-blue-50 group-hover/card:to-indigo-50 transition-colors">
                                <div className="absolute -bottom-10 inset-x-0 flex justify-center">
                                    <div className="relative">
                                        {u.profilePic ? (
                                            <img src={`http://localhost:5000${u.profilePic}`} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg group-hover/card:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white border-4 border-white shadow-lg group-hover/card:scale-105 transition-transform">
                                                {u.name[0]}
                                            </div>
                                        )}
                                        <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-12 flex-1 flex flex-col items-center text-center">
                                <h3 className="font-black text-gray-900 text-lg tracking-tight mb-1 group-hover/card:text-blue-600 transition-colors">{u.name}</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 h-8 overflow-hidden line-clamp-2">{u.headline || 'Impactful Job Seeker'}</p>

                                <div className="flex items-center gap-1.5 mb-6">
                                    <div className="flex -space-x-1.5">
                                        {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-gray-100 border border-white"></div>)}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">12 mutual connections</span>
                                </div>

                                <div className="mt-auto w-full">
                                    {renderActionButton(u)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

import { Users } from 'lucide-react'
