import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { Bell, MessageSquare, LogOut, User as UserIcon, Briefcase, Home, Users } from 'lucide-react'

export default function Navbar() {
    const { user, logout, unreadCount } = useContext(UserContext)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="bg-white shadow sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-blue-600">JobSocial</Link>

                {user ? (
                    <div className="flex items-center space-x-6">
                        <Link to="/" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
                            <Home size={24} />
                            <span className="text-xs hidden md:block">Home</span>
                        </Link>
                        <Link to="/network" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
                            <Users size={24} />
                            <span className="text-xs hidden md:block">Network</span>
                        </Link>
                        <Link to="/jobs" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
                            <Briefcase size={24} />
                            <span className="text-xs hidden md:block">Jobs</span>
                        </Link>
                        <Link to="/messaging" className="flex flex-col items-center text-gray-500 hover:text-blue-600 relative">
                            <MessageSquare size={24} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                            <span className="text-xs hidden md:block">Messaging</span>
                        </Link>
                        <Link to="/notifications" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
                            <Bell size={24} />
                            <span className="text-xs hidden md:block">Notifications</span>
                        </Link>
                        <div className="relative group">
                            <button className="flex flex-col items-center text-gray-500 hover:text-blue-600">
                                {user.profilePic ? (
                                    <img src={`http://localhost:5000${user.profilePic}`} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                    <UserIcon size={24} />
                                )}
                                <span className="text-xs hidden md:block">Me</span>
                            </button>
                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg hidden group-hover:block">
                                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">View Profile</Link>
                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-x-4">
                        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-semibold">Login</Link>
                        <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700">Join Now</Link>
                    </div>
                )}
            </div>
        </nav>
    )
}
