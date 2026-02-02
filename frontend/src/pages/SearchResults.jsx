import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import JobCard from '../components/JobCard'
import { Users, Briefcase, Search } from 'lucide-react'

export default function SearchResults() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const [activeTab, setActiveTab] = useState('all')
    const [jobs, setJobs] = useState([])
    const [people, setPeople] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (query) {
            fetchResults()
        }
    }, [query])

    const fetchResults = async () => {
        setLoading(true)
        setError(null)
        try {
            // Use absolute URL to match other parts of the app
            const [jobsRes, peopleRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/jobs/search?q=${encodeURIComponent(query)}`),
                axios.get(`http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`)
            ])
            console.log('--- FRONTEND SEARCH DEBUG ---')
            console.log('Jobs Received:', jobsRes.data)
            console.log('People Received:', peopleRes.data)
            setJobs(jobsRes.data)
            setPeople(peopleRes.data)
        } catch (error) {
            console.error(error)
            setError("Could not connect to the search server. Please verify the backend is running.")
        } finally {
            setLoading(false)
        }
    }

    const getMediaUrl = (url) => {
        if (!url) return ''
        return url.startsWith('http') ? url : `http://localhost:5000${url}`
    }

    const renderJobs = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
                <div key={job._id} className="transform transition duration-300 hover:scale-[1.02]">
                    <Link to={`/jobs/${job._id}`} key={job._id}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all h-full flex flex-col relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium mt-1">{job.company}</p>
                                </div>
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    {job.type}
                                </span>
                            </div>

                            <div className="mb-4 flex-1">
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                    {job.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto">
                                {job.skills?.slice(0, 3).map((skill, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-semibold">
                                        {skill}
                                    </span>
                                ))}
                                {job.skills?.length > 3 && (
                                    <span className="bg-gray-50 text-gray-400 px-2 py-1 rounded-md text-xs font-semibold">
                                        +{job.skills.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    )

    const renderPeople = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {people.map(user => (
                <Link key={user._id} to={`/profile/${user._id}`} className="group">
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-100 transition-all duration-300 h-full flex flex-col">
                        <div className="h-24 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                                {user.profilePic ? (
                                    <img src={getMediaUrl(user.profilePic)} alt={user.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl font-black text-white border-4 border-white shadow-md">
                                        {user.name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pt-12 pb-6 px-6 text-center flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{user.name}</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 line-clamp-1">{user.headline || 'Member'}</p>
                            {user.skills && user.skills.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                                    {user.skills.slice(0, 3).map((skill, idx) => (
                                        <span key={idx} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )

    const hasJobs = jobs.length > 0
    const hasPeople = people.length > 0

    return (
        <div className="max-w-[1600px] mx-auto px-4 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
                    Search Results for "<span className="text-blue-600">{query}</span>"
                </h1>
                <p className="text-gray-500 font-medium text-sm sm:text-base">
                    Found {jobs.length} jobs and {people.length} people
                </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto no-scrollbar whitespace-nowrap">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 px-2 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    All Results
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`pb-3 px-2 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'jobs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Jobs <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md text-[10px]">{jobs.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('people')}
                    className={`pb-3 px-2 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'people' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    People <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md text-[10px]">{people.length}</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-8 font-semibold text-center italic">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-12">
                    {!hasJobs && !hasPeople && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <Search size={48} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">No results found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                        </div>
                    )}

                    {(activeTab === 'all' || activeTab === 'jobs') && hasJobs && (
                        <div>
                            {activeTab === 'all' && (
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                        <Briefcase size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Jobs</h2>
                                </div>
                            )}
                            {renderJobs()}
                        </div>
                    )}

                    {(activeTab === 'all' || activeTab === 'people') && hasPeople && (
                        <div>
                            {activeTab === 'all' && (
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                                        <Users size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">People</h2>
                                </div>
                            )}
                            {renderPeople()}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
