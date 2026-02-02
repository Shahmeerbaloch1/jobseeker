import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useContext, useState, useRef, useEffect } from 'react'
import { UserContext } from '../context/UserContext'
import { useSocket } from '../context/SocketContext'
import axios from 'axios'
import { Bell, MessageSquare, LogOut, User as UserIcon, Briefcase, Home, Users, Bookmark, ArrowLeft, Search } from 'lucide-react'

export default function Navbar() {
    const { user, logout, unreadCount } = useContext(UserContext)
    const { socket } = useSocket()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
    const [unreadNotifications, setUnreadNotifications] = useState(0)
    const menuRef = useRef(null)
    const navigate = useNavigate()
    const location = useLocation()

    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
            setIsMobileSearchOpen(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchUnreadNotifications()
        }
    }, [user])

    useEffect(() => {
        if (socket) {
            socket.on('new_notification', () => {
                setUnreadNotifications(prev => prev + 1)
            })
            return () => socket.off('new_notification')
        }
    }, [socket])

    // Reset count when visiting notifications page
    useEffect(() => {
        if (location.pathname === '/notifications') {
            setUnreadNotifications(0)
            fetchUnreadNotifications()
        }
    }, [location.pathname])

    const fetchUnreadNotifications = async () => {
        try {
            // Using 5000 based on standard, will verify with .env
            const res = await axios.get(`http://localhost:5000/api/notifications/${user._id || user.id}`)
            const unread = res.data.filter(n => !n.read).length
            setUnreadNotifications(unread)
        } catch (error) {
            console.error(error)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path

    // Close search and menu when clicking outside or navigating
    useEffect(() => {
        setIsMobileSearchOpen(false)
        setIsMenuOpen(false)
    }, [location.pathname])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getMediaUrl = (url) => {
        if (!url) return ''
        return url.startsWith('http') ? url : `http://localhost:5000${url}`
    }

    return (
        <>
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16 flex items-center shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {location.pathname !== '/' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-90 text-gray-500 hover:text-blue-600"
                                title="Go Back"
                            >
                                <ArrowLeft size={22} strokeWidth={2.5} />
                            </button>
                        )}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-200">
                                <Briefcase size={22} className="text-white" />
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">Job<span className="text-blue-600">Social</span></span>
                        </Link>
                    </div>

                    <div className="flex-1 max-w-md hidden lg:block">
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder="Search for jobs, skills, or people..."
                                className="w-full bg-gray-100 border-none rounded-xl py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            />
                            <Search size={18} className="absolute right-3 top-2.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-2 md:gap-6">
                            {/* Desktop Navigation Links */}
                            <div className="hidden md:flex items-center space-x-8">
                                <Link to="/" className={`flex flex-col items-center transition-all group ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                                    <Home size={22} className={`${isActive('/') ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                    <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isActive('/') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>Home</span>
                                </Link>
                                <Link to="/network" className={`flex flex-col items-center transition-all group ${isActive('/network') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                                    <Users size={22} className={`${isActive('/network') ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                    <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isActive('/network') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>Network</span>
                                </Link>
                                <Link to="/jobs" className={`flex flex-col items-center transition-all group ${isActive('/jobs') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                                    <Briefcase size={22} className={`${isActive('/jobs') ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                    <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isActive('/jobs') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>Jobs</span>
                                </Link>
                                <Link to="/messaging" className={`flex flex-col items-center transition-all group relative ${isActive('/messaging') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                                    <MessageSquare size={22} className={`${isActive('/messaging') ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] border-2 border-white font-black px-1.5 py-0.5 rounded-full animate-bounce">
                                            {unreadCount}
                                        </span>
                                    )}
                                    <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isActive('/messaging') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>Messaging</span>
                                </Link>
                                <Link to="/notifications" className={`flex flex-col items-center transition-all group relative ${isActive('/notifications') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                                    <Bell size={22} className={`${isActive('/notifications') ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                    {unreadNotifications > 0 && (
                                        <div className="absolute top-0 right-1 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full"></div>
                                    )}
                                    <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isActive('/notifications') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>Notifications</span>
                                </Link>
                            </div>

                            <div className="h-8 w-px bg-gray-200 hidden md:block mx-2"></div>

                            {/* Mobile Search Toggle */}
                            <button
                                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-blue-600"
                            >
                                <Search size={22} />
                            </button>

                            {/* User Menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={`flex items-center gap-2 p-1 rounded-full transition focus:outline-none border-2 ${isMenuOpen || isActive('/profile') ? 'border-blue-100 bg-blue-50/50' : 'border-transparent hover:bg-gray-100 hover:border-blue-50'}`}
                                >
                                    {user.profilePic ? (
                                        <img src={getMediaUrl(user.profilePic)} alt="Profile" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm" />
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
                                            className={`flex items-center gap-3 px-4 py-3 transition-colors font-semibold ${isActive('/profile') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                                        >
                                            <UserIcon size={18} /> View Profile
                                        </Link>
                                        <Link
                                            to="/my-items"
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 transition-colors font-semibold ${isActive('/my-items') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                                        >
                                            <Bookmark size={18} /> My Items
                                        </Link>
                                        <div className="h-px bg-gray-50 mx-2"></div>
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

                {/* Mobile Search Bar Expansion */}
                {isMobileSearchOpen && (
                    <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-4 animate-in slide-in-from-top duration-200">
                        <div className="relative">
                            <input
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder="Search jobs, skills, or people..."
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-base focus:ring-0 focus:border-blue-500 transition-all outline-none"
                            />
                            <Search size={20} className="absolute left-4 top-3.5 text-blue-600" />
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Navigation */}
            {user && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] h-[72px] pb-[safe-area-inset-bottom]">
                    <div className="h-full flex items-center justify-around px-1 sm:px-2">
                        <Link to="/" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-all active:scale-95 ${isActive('/') ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`p-1 rounded-xl transition-colors ${isActive('/') ? 'bg-blue-50' : ''}`}>
                                <Home size={22} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">Home</span>
                        </Link>
                        <Link to="/network" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-all active:scale-95 ${isActive('/network') ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`p-1 rounded-xl transition-colors ${isActive('/network') ? 'bg-blue-50' : ''}`}>
                                <Users size={22} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">Network</span>
                        </Link>
                        <button
                            onClick={() => {
                                setIsMobileSearchOpen(!isMobileSearchOpen);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-all active:scale-95 ${isMobileSearchOpen ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                            <div className={`p-1 rounded-xl transition-colors ${isMobileSearchOpen ? 'bg-blue-50' : ''}`}>
                                <Search size={22} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">Search</span>
                        </button>
                        <Link to="/jobs" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-all active:scale-95 ${isActive('/jobs') ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`p-1 rounded-xl transition-colors ${isActive('/jobs') ? 'bg-blue-50' : ''}`}>
                                <Briefcase size={22} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">Jobs</span>
                        </Link>
                        <Link to="/my-items" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-all active:scale-95 ${isActive('/my-items') ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`p-1 rounded-xl transition-colors ${isActive('/my-items') ? 'bg-blue-50' : ''}`}>
                                <Bookmark size={22} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">Items</span>
                        </Link>
                        <Link to="/messaging" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-all active:scale-95 relative ${isActive('/messaging') ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`p-1 rounded-xl transition-colors ${isActive('/messaging') ? 'bg-blue-50' : ''}`}>
                                <MessageSquare size={22} />
                            </div>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-2 bg-red-600 text-white text-[9px] border-2 border-white font-black px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">Chat</span>
                        </Link>
                        <Link to="/notifications" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-all active:scale-95 relative ${isActive('/notifications') ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`p-1 rounded-xl transition-colors ${isActive('/notifications') ? 'bg-blue-50' : ''}`}>
                                <Bell size={22} />
                            </div>
                            {unreadNotifications > 0 && (
                                <div className="absolute top-2 right-3 w-2 h-2 bg-red-600 border-2 border-white rounded-full"></div>
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">Alerts</span>
                        </Link>
                    </div>
                </div>
            )}
        </>
    )
}
