import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { MapPin, Building, Search, Briefcase } from 'lucide-react'

export default function Jobs() {
    const { user } = useContext(UserContext)
    const [jobs, setJobs] = useState([])
    const [search, setSearch] = useState('')
    const [location, setLocation] = useState('')

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/jobs?search=${search}&location=${location}`)
            setJobs(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        fetchJobs()
    }

    return (
        <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Search for your next role</h2>
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, skill, or company"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 border p-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="City, state, or zip code"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-10 border p-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
                        Search
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow">No jobs found matching your criteria.</div>
                ) : (
                    jobs.map(job => (
                        <div key={job._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                    <Building size={24} className="text-gray-500" />
                                </div>
                                <div>
                                    <Link to={`/jobs/${job._id}`} className="text-blue-600 font-bold text-lg hover:underline">{job.title}</Link>
                                    <p className="text-gray-900">{job.company}</p>
                                    <p className="text-gray-500 text-sm">{job.location}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">Actively Hiring</span>
                                    </div>
                                </div>
                            </div>
                            <Link to={`/jobs/${job._id}`} className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-blue-700">
                                Apply
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
