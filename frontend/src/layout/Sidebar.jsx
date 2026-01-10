import { useContext, useState } from 'react'
import { UserContext } from '../context/UserContext'
import { Link } from 'react-router-dom'
import { Bookmark, X, Loader2 } from 'lucide-react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

export default function Sidebar() {
    const { user } = useContext(UserContext)
    const [showConnectionsModal, setShowConnectionsModal] = useState(false)
    const [showViewsModal, setShowViewsModal] = useState(false)
    const [listData, setListData] = useState([])
    const [loadingList, setLoadingList] = useState(false)

    if (!user) return null

    const getMediaUrl = (url) => {
        if (!url) return ''
        return url.startsWith('http') ? url : `http://localhost:5000${url}`
    }

    const fetchConnections = async () => {
        setLoadingList(true)
        setShowConnectionsModal(true)
        try {
            // Re-using the network endpoint logic where we get all users and filter by connection status
            // Or ideally, we should have a clearer endpoint for "my connections".
            // Network.jsx does: res = await axios.get(`http://localhost:5000/api/users?userId=${user._id}`)
            // then filtered. Let's match that to ensure consistency.
            const res = await axios.get(`http://localhost:5000/api/users?userId=${user._id || user.id}`)
            const connected = res.data.filter(u => u.connectionStatus === 'accepted')
            setListData(connected)
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingList(false)
        }
    }

    const fetchViews = async () => {
        setLoadingList(true)
        setShowViewsModal(true)
        try {
            const res = await axios.get(`http://localhost:5000/api/users/${user._id || user.id}/views`)
            setListData(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingList(false)
        }
    }

    const closeModal = () => {
        setShowConnectionsModal(false)
        setShowViewsModal(false)
        setListData([])
    }

    const Modal = ({ title, data }) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
                    <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {loadingList ? (
                        <div className="flex justify-center py-10">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="font-bold text-sm">List is empty</p>
                        </div>
                    ) : (
                        data.map((u, i) => (
                            <Link
                                to={`/profile/${u._id}`}
                                key={i}
                                onClick={closeModal}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors group"
                            >
                                <div className="relative shrink-0">
                                    {u.profilePic ? (
                                        <img src={getMediaUrl(u.profilePic)} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                                            {u.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{u.name}</h4>
                                    <p className="text-xs text-gray-500 truncate font-medium">{u.headline || 'Professional'}</p>
                                    {u.viewedAt && (
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                                            Viewed {formatDistanceToNow(new Date(u.viewedAt))} ago
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20 transition-all hover:shadow-md">
                {/* Header / Cover Placeholder */}
                <div className="h-16 bg-gradient-to-r from-blue-700 to-blue-500 relative"></div>

                <div className="flex flex-col items-center -mt-10 px-4 pb-6 border-b border-gray-50">
                    <Link to="/profile" className="relative group">
                        {user.profilePic ? (
                            <img
                                src={getMediaUrl(user.profilePic)}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-gray-400 text-3xl font-bold group-hover:scale-105 transition-transform">
                                {user.name?.[0]}
                            </div>
                        )}
                    </Link>
                    <Link to="/profile" className="mt-3 text-center group">
                        <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{user.name}</h3>
                        <p className="text-gray-500 text-xs font-semibold mt-1 px-4 leading-relaxed line-clamp-2">
                            {user.headline || 'Professional at JobSocial'}
                        </p>
                    </Link>
                </div>

                <div className="py-4">
                    <div onClick={fetchConnections} className="px-5 py-2 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between group">
                        <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-wider">Connections</span>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{user.connections?.length || 0}</span>
                    </div>
                    <div onClick={fetchViews} className="px-5 py-2 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between group border-t border-gray-50">
                        <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-wider">Profile Views</span>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{user.profileViews?.length || 0}</span>
                    </div>
                </div>

                <Link
                    to="/my-items"
                    className="flex items-center gap-3 px-5 py-4 bg-gray-50/50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold text-xs uppercase tracking-widest border-t border-gray-100 transition-all"
                >
                    <Bookmark size={16} className="text-blue-600" />
                    My Saved Items
                </Link>
            </div>

            {(showConnectionsModal || showViewsModal) && (
                <Modal
                    title={showConnectionsModal ? "Connections" : "Profile Views"}
                    data={listData}
                />
            )}
        </>
    )
}
