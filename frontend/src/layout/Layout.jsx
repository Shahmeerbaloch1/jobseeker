import { Bell } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'

export default function Layout({ children }) {
    const location = useLocation()

    const isAuthPage = ['/login', '/register'].includes(location.pathname)
    const isFullWidthPage = ['/profile', '/messaging', '/jobs', '/my-items', '/network', '/jobs/'].some(path => location.pathname.startsWith(path))
    const isFeedPage = location.pathname === '/' || location.pathname === '/notifications'

    if (isAuthPage) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                {children}
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="w-full max-w-7xl mx-auto px-1.5 sm:px-4 pt-2 sm:pt-4 pb-4 sm:pb-6 overflow-hidden">
                {isFullWidthPage ? (
                    <div className="pb-20 md:pb-0">
                        {children}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        {/* Left Sidebar - Hidden on mobile, visible on lg+ */}
                        <div className="hidden lg:block col-span-1">
                            <Sidebar />
                        </div>

                        {/* Main Feed / Content - Full width on mobile/tablet, centered on lg+ */}
                        <div className="col-span-1 lg:col-span-2 space-y-4 pb-20 md:pb-0">
                            {children}
                        </div>

                        {/* Right Sidebar - Hidden on mobile/tablet, visible on lg+ */}
                        <div className="hidden lg:block col-span-1">
                            <RecentJobsSidebar />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function RecentJobsSidebar() {
    const [jobs, setJobs] = useState([])
    const { user } = useContext(UserContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (user) fetchRecentJobs()
    }, [user])

    const fetchRecentJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs')
            // Take top 5 recent
            setJobs(res.data.slice(0, 5))
        } catch (error) {
            console.error('Failed to fetch recent jobs')
        }
    }

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d ago`
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
            <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Bell size={18} className="text-blue-600" />
                    Newest Jobs
                </h3>
            </div>
            <div className="p-4 space-y-4">
                {jobs.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No recent jobs found.</p>
                ) : (
                    jobs.map(job => (
                        <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)} className="group cursor-pointer border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                            <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h4>
                            <p className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
                                <span className="truncate max-w-[60%]">{job.company}</span>
                                <span>{formatTimeAgo(job.createdAt)}</span>
                            </p>
                        </div>
                    ))
                )}
            </div>
            <button
                onClick={() => navigate('/jobs')}
                className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-50"
            >
                View all jobs
            </button>
        </div>
    )
}

