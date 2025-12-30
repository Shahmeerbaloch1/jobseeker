import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Find Your Dream Job</h1>
            <p className="text-xl text-gray-600 mb-8">Browse thousands of job listings from top companies.</p>
            <div className="flex space-x-4">
                <Link to="/jobs" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Browse Jobs
                </Link>
                <Link to="/post-job" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                    Post a Job
                </Link>
            </div>
        </div>
    )
}
