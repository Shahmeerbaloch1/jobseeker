import { useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'

export default function Sidebar() {
    const { user } = useContext(UserContext)
    if (!user) return null

    const getMediaUrl = (url) => {
        if (!url) return ''
        return url.startsWith('http') ? url : `http://localhost:5000${url}`
    }

    return (
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
                <div className="px-5 py-2 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between group">
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-wider">Connections</span>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{user.connections?.length || 0}</span>
                </div>
                <div className="px-5 py-2 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between group border-t border-gray-50">
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-wider">Profile Views</span>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">12</span>
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
    )
}
