import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function MutualConnectionsModal({ isOpen, onClose, requesterId, targetId }) {
    const [mutuals, setMutuals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && requesterId && targetId) {
            fetchMutuals()
        }
    }, [isOpen, requesterId, targetId])

    const fetchMutuals = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`http://localhost:5000/api/users/mutual/${requesterId}/${targetId}`)
            setMutuals(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900">Mutual Connections</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : mutuals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 font-medium">
                            No mutual connections found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {mutuals.map(user => (
                                <Link to={`/profile/${user._id}`} key={user._id} onClick={onClose} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="relative">
                                        {user.profilePic ? (
                                            <img src={user.profilePic.startsWith('http') ? user.profilePic : `http://localhost:5000${user.profilePic}`} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                                                {user.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</h4>
                                        <p className="text-xs text-gray-500 truncate font-medium uppercase tracking-wide">{user.headline || 'Impactful Professional'}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
