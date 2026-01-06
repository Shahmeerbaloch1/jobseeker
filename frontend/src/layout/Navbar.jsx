import { Link, useNavigate } from 'react-router-dom'
import { useContext, useState, useRef, useEffect } from 'react'
import { UserContext } from '../context/UserContext'
import { Bell, MessageSquare, LogOut, User as UserIcon, Briefcase, Home, Users } from 'lucide-react'

export default function Navbar() {
    const { user, logout, unreadCount } = useContext(UserContext)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16 flex items-center shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-200">
                            <Briefcase size={22} className="text-white" />
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter">Job<span className="text-blue-600">Social</span></span>
                    </Link>

                    <div className="flex-1 max-w-md hidden md:block">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search for jobs, skills, or people..."
                                className="w-full bg-gray-100 border-none rounded-xl py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            />
                            <Users size={18} className="absolute right-3 top-2.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-2 md:gap-6">
                            {/* Desktop Navigation Links */}
                            <div className="hidden md:flex items-center space-x-8">
                                <Link to="/" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors group">
                                    <Home size={22} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Home</span>
                                </Link>
                                <Link to="/network" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors group">
                                    <Users size={22} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Network</span>
                                </Link>
                                <Link to="/jobs" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors group">
                                    <Briefcase size={22} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Jobs</span>
                                </Link>
                                <Link to="/messaging" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors group relative">
                                    <MessageSquare size={22} className="group-hover:scale-110 transition-transform" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] border-2 border-white font-black px-1.5 py-0.5 rounded-full animate-bounce">
                                            {unreadCount}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Messaging</span>
                                </Link>
                                <Link to="/notifications" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors group">
                                    <Bell size={22} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Notifications</span>
                                </Link>
                            </div>

                            <div className="h-8 w-px bg-gray-200 hidden md:block mx-2"></div>

                            {/* User Menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition focus:outline-none border-2 border-transparent hover:border-blue-100"
                                >
                                    {user.profilePic ? (
                                        <img src={`http://localhost:5000${user.profilePic}`} alt="Profile" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                    ) : (
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {user.name?.[0]}
                                        </div>
                                    )}
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                            <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-semibold"
                                        >
                                            <UserIcon size={18} /> View Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                                        >
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-bold text-sm">Login</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200">Join Now</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            {user && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] h-[72px] pb-[safe-area-inset-bottom]">
                    <div className="h-full flex items-center justify-around px-2">
                        <Link to="/" className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-gray-400 hover:text-blue-600 active:scale-95 transition-all">
                            <div className="p-1 rounded-xl">
                                <Home size={26} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tight">Home</span>
                        </Link>
                        <Link to="/network" className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-gray-400 hover:text-blue-600 active:scale-95 transition-all">
                            <div className="p-1 rounded-xl">
                                <Users size={26} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tight">Network</span>
                        </Link>
                        <Link to="/jobs" className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-gray-400 hover:text-blue-600 active:scale-95 transition-all">
                            <div className="p-1 rounded-xl">
                                <Briefcase size={26} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tight">Jobs</span>
                        </Link>
                        <Link to="/messaging" className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-gray-400 hover:text-blue-600 active:scale-95 transition-all relative">
                            <div className="p-1 rounded-xl">
                                <MessageSquare size={26} />
                            </div>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-3 bg-red-600 text-white text-[10px] border-2 border-white font-black px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-tight">Messages</span>
                        </Link>
                        <Link to="/notifications" className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-gray-400 hover:text-blue-600 active:scale-95 transition-all">
                            <div className="p-1 rounded-xl">
                                <Bell size={26} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tight">Alerts</span>
                        </Link>
                    </div>
                </div>
            )}
        </>
    )
}
