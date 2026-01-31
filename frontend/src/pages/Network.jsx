import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { UserPlus, Check, Clock, UserCheck, ArrowLeft, Users, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import MutualConnectionsModal from '../components/MutualConnectionsModal'

export default function Network() {
    const { user } = useContext(UserContext)
    const [users, setUsers] = useState([])
    const [activeTab, setActiveTab] = useState('suggestions')
    const [selectedMutuals, setSelectedMutuals] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            fetchUsers()
        }
    }, [user])

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users?userId=${user._id || user.id}`)
            // Filter out self just in case backend returns it
            const filtered = res.data.filter(u => u._id !== (user._id || user.id))
            setUsers(filtered)
        } catch (error) {
            console.error(error)
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
            toast.error('Failed to accept')
        }
    }

    const handleReject = async (connectionId, senderId) => {
        try {
            await axios.post('http://localhost:5000/api/users/connect/reject', { connectionId })
            toast.success('Ignored')
            setUsers(users.filter(u => u._id !== senderId)) // Remove from list immediately if we want
            // Or update status to none if we want them to reappear in suggestions? 
            // Usually ignore means "don't show request anymore". 
            // Let's set status to none so they go to suggestions or disappear from pending.
            setUsers(users.map(u => u._id === senderId ? { ...u, connectionStatus: 'none', connectionId: null } : u))
        } catch (error) {
            toast.error('Failed to ignore request')
        }
    }

    const filteredUsers = users.filter(u => {
        if (activeTab === 'suggestions') return u.connectionStatus === 'none'
        if (activeTab === 'connections') return u.connectionStatus === 'accepted'
        if (activeTab === 'pending') return u.connectionStatus === 'pending_received' || u.connectionStatus === 'pending_sent'
        return false
    })

    const renderActionButton = (u) => {
        if (u.connectionStatus === 'accepted') {
            return (
                <button className="w-full bg-[#f8f9fa] text-slate-500 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest cursor-default border border-transparent shadow-sm" disabled>
                    <UserCheck size={18} className="text-slate-400" /> CONNECTED
                </button>
            )
        }
        if (u.connectionStatus === 'pending_sent') {
            return (
                <button className="w-full bg-blue-50 text-blue-600 border border-blue-100 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest cursor-default">
                    <Clock size={18} /> Requested
                </button>
            )
        }
        if (u.connectionStatus === 'pending_received') {
            return (
                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => handleAccept(u.connectionId, u._id)}
                        className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl hover:bg-blue-700 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-100"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleReject(u.connectionId, u._id)}
                        className="px-4 py-3.5 border border-gray-200 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Ignore
                    </button>
                </div>
            )
        }
        return (
            <button
                onClick={() => handleConnect(u._id)}
                className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-2xl hover:bg-blue-50 font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
                <UserPlus size={18} /> Connect
            </button>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 pb-20 md:pb-10">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8 p-6 sm:p-12 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-blue-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full -mr-20 -mt-20 sm:-mr-32 sm:-mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>

                <div className="relative z-10 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">Grow Your <span className="text-blue-100 underline decoration-blue-200/50 decoration-4 underline-offset-8">Network</span></h2>
                    <p className="text-blue-50/90 text-sm sm:text-lg font-medium mt-3 sm:mt-4 max-w-2xl mx-auto sm:mx-0">Connect with industry leaders and professional peers to unlock new opportunities.</p>
                </div>
            </div>

            {/* Tabs - Mobile Optimized */}
            <div className="sticky top-[70px] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8 bg-white/80 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none py-2 sm:py-0 sm:static">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 sm:overflow-visible w-full sm:w-fit sm:bg-white/50 sm:backdrop-blur-sm sm:p-1 sm:rounded-2xl sm:border sm:border-gray-100">
                    {['suggestions', 'connections', 'pending'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white sm:bg-transparent text-gray-500 hover:bg-white hover:text-blue-600 border border-gray-100 sm:border-none'}`}
                        >
                            {tab === 'suggestions' && 'Suggestions'}
                            {tab === 'connections' && 'My Connections'}
                            {tab === 'pending' && 'Pending'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mb-12">
                {filteredUsers.length === 0 ? (
                    <div className="col-span-full py-24 sm:py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
                        <Users size={48} className="text-gray-200 mb-6" />
                        <p className="text-gray-900 font-black text-xl">
                            {activeTab === 'suggestions' ? 'No new suggestions' : activeTab === 'connections' ? 'No connections yet' : 'No pending requests'}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">Check back later or explore other tabs.</p>
                    </div>
                ) : (
                    filteredUsers.map(u => (
                        <div key={u._id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group/card flex flex-col">
                            {/* Profile Card Header: Mock Cover Photo */}
                            <div className="h-28 bg-[#f3f6f9] relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-white group-hover/card:scale-110 transition-transform duration-1000"></div>
                                <div className="absolute -bottom-10 inset-x-0 flex justify-center">
                                    <Link to={`/profile/${u._id}`} className="relative block">
                                        {u.profilePic ? (
                                            <img src={u.profilePic.startsWith('http') ? u.profilePic : `http://localhost:5000${u.profilePic}`} className="w-24 h-24 rounded-2xl object-cover border-8 border-white shadow-xl group-hover/card:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-black text-white border-8 border-white shadow-xl group-hover/card:scale-105 transition-transform duration-500">
                                                {u.name[0]}
                                            </div>
                                        )}
                                        {u.connectionStatus === 'accepted' && (
                                            <div className="absolute right-1 bottom-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                                        )}
                                    </Link>
                                </div>
                            </div>

                            <div className="p-6 pt-14 flex-1 flex flex-col items-center text-center">
                                <Link to={`/profile/${u._id}`} className="block w-full">
                                    <h3 className="font-black text-slate-900 text-lg sm:text-[22px] tracking-tight mb-2 group-hover/card:text-blue-600 transition-colors truncate w-full px-2">{u.name}</h3>
                                </Link>
                                <p className="text-slate-500 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.1em] mb-6 h-10 overflow-hidden line-clamp-2 leading-relaxed px-2">
                                    {u.headline ? u.headline.toUpperCase() : 'IMPACTFUL PROFESSIONAL'}
                                </p>

                                <button
                                    onClick={() => u.mutualConnections > 0 && setSelectedMutuals(u._id)}
                                    className={`flex items-center gap-3 mb-8 px-3 py-1.5 rounded-xl transition-colors ${u.mutualConnections > 0 ? 'hover:bg-blue-50 cursor-pointer group/mutual' : 'cursor-default'}`}
                                >
                                    <div className="flex -space-x-2 shrink-0">
                                        {[1, 2, 3].slice(0, Math.min(u.mutualConnections || 0, 3)).map(i => <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>)}
                                        {(!u.mutualConnections || u.mutualConnections === 0) && (
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 border-2 border-white shadow-sm"></div>
                                        )}
                                    </div>
                                    <span className={`text-[11px] font-bold whitespace-nowrap ${u.mutualConnections > 0 ? 'text-blue-600 group-hover/mutual:underline' : 'text-slate-400'}`}>
                                        {u.mutualConnections || 0} mutual connections
                                    </span>
                                </button>

                                <div className="mt-auto w-full">
                                    {renderActionButton(u)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <MutualConnectionsModal
                isOpen={!!selectedMutuals}
                onClose={() => setSelectedMutuals(null)}
                requesterId={user?._id || user?.id}
                targetId={selectedMutuals}
            />
        </div>
    )
}

