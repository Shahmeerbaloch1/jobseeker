import { Bell } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useLocation } from 'react-router-dom'

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
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
                {isFullWidthPage ? (
                    <div className="pb-20 md:pb-0">
                        {children}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
                                <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Bell size={18} className="text-blue-600" />
                                        Trending News
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="group cursor-pointer">
                                        <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">Tech Hiring Rebounds in 2026</h4>
                                        <p className="text-[11px] text-gray-500 mt-1">1d ago • 5,234 readers</p>
                                    </div>
                                    <div className="group cursor-pointer border-t border-gray-50 pt-3">
                                        <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">AI Productivity at All-Time High</h4>
                                        <p className="text-[11px] text-gray-500 mt-1">2d ago • 3,102 readers</p>
                                    </div>
                                    <div className="group cursor-pointer border-t border-gray-50 pt-3">
                                        <h4 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">Remote vs Hybrid: The Debate</h4>
                                        <p className="text-[11px] text-gray-500 mt-1">3d ago • 8,491 readers</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-50">
                                    View all stories
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
