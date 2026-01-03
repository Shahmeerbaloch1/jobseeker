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
    const [myApplications, setMyApplications] = useState([])

    useEffect(() => {
        fetchJobs()
        if (user.role !== 'company') {
            fetchMyApplications()
        }
    }, [])

    const fetchMyApplications = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs/applications/me')
            setMyApplications(res.data)
        } catch (error) {
            console.error(error)
        }
    }

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
            {user.role === 'company' ? (
                <div className="bg-white rounded-lg shadow p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Post a New Job</h2>
                    <PostJobForm user={user} />
                </div>
            ) : (
                <>
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
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">{job.type || 'Full-time'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {(() => {
                                        const application = myApplications.find(app => app.job._id === job._id)
                                        if (application) {
                                            const statusColors = {
                                                pending: 'bg-yellow-100 text-yellow-800',
                                                accepted: 'bg-green-100 text-green-800',
                                                rejected: 'bg-red-100 text-red-800',
                                                stopped: 'bg-gray-100 text-gray-800'
                                            }
                                            return (
                                                <span className={`px-4 py-2 rounded-full font-semibold text-sm ${statusColors[application.status] || statusColors.pending}`}>
                                                    {application.status === 'accepted' ? 'Accepted' :
                                                        application.status === 'rejected' ? 'Rejected' :
                                                            application.status === 'stopped' ? 'Hiring Stopped' :
                                                                'Applied'}
                                                </span>
                                            )
                                        }
                                        return (
                                            <Link to={`/jobs/${job._id}`} className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-blue-700">
                                                Apply
                                            </Link>
                                        )
                                    })()}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

function PostJobForm({ user }) {
    const [formData, setFormData] = useState({
        title: '', description: '', company: user.name, location: '',
        requirements: '', skills: '', website: '', salary: '', type: 'Full-time'
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Convert skills string to array
            const payload = {
                ...formData,
                author: user._id || user.id,
                skills: formData.skills.split(',').map(s => s.trim())
            }
            await axios.post('http://localhost:5000/api/jobs', payload)
            alert('Job Posted Successfully!')
            setFormData({ title: '', description: '', company: user.name, location: '', requirements: '', skills: '', website: '', salary: '', type: 'Full-time' })
        } catch (error) {
            console.error(error)
            alert('Failed to post job')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Job Title" className="border p-2 rounded" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <input required placeholder="Company Name" className="border p-2 rounded" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                <input required placeholder="Location" className="border p-2 rounded" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                <input placeholder="Salary Range (e.g. $80k - $100k)" className="border p-2 rounded" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                <select className="border p-2 rounded" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option>
                </select>
                <input placeholder="Website Link" className="border p-2 rounded" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
            </div>
            <textarea required placeholder="Job Description" rows={4} className="border p-2 rounded w-full" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <textarea required placeholder="Requirements (Bullet points recommended)" rows={4} className="border p-2 rounded w-full" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
            <input placeholder="Skills (comma separated, e.g. React, Node.js)" className="border p-2 rounded w-full" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />

            <div className="flex justify-end">
                <button type="submit" className="bg-gray-900 text-white px-8 py-2 rounded-full font-bold hover:bg-gray-800">Post Job</button>
            </div>
        </form>
    )
}
