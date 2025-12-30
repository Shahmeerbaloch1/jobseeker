import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useLocation } from 'react-router-dom'

export default function Layout({ children }) {
    const location = useLocation()
    const isAuthPage = ['/login', '/register'].includes(location.pathname)

    if (isAuthPage) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                {children}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f3f2ef]">
            <Navbar />
            <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Sidebar (Profile) */}
                <div className="hidden md:block col-span-1">
                    <Sidebar />
                </div>

                {/* Main Feed / Content */}
                <div className="col-span-1 md:col-span-2">
                    {children}
                </div>

                {/* Right Sidebar (Suggestions? News?) */}
                <div className="hidden md:block col-span-1">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-bold text-gray-700 mb-4">News</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex flex-col cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <span className="font-semibold">Tech Hiring Rebounds</span>
                                <span className="text-gray-500 text-xs">1d ago • 5,234 readers</span>
                            </li>
                            <li className="flex flex-col cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <span className="font-semibold">AI in 2026</span>
                                <span className="text-gray-500 text-xs">2d ago • 3,102 readers</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
