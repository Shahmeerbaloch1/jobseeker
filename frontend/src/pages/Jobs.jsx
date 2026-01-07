import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { Search, MapPin, Briefcase, DollarSign, Clock, Plus, X, Building } from 'lucide-react'
import toast from 'react-hot-toast'

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
        <div className="max-w-5xl mx-auto px-2 pb-20 md:pb-0">
            {user.role === 'company' ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-10 mb-8 sm:mb-10 transition-all hover:shadow-md">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                            <div className="p-2.5 sm:p-3 bg-blue-100 rounded-2xl text-blue-600">
                                <Plus size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">Hire Exceptional Talent</h2>
                                <p className="text-xs sm:text-base text-gray-500 font-medium">Post your professional opportunity and reach thousands.</p>
                            </div>
                        </div>
                        <PostJobForm user={user} />
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden group/search">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-20 -mt-20 blur-3xl group-hover/search:bg-blue-100/50 transition-colors"></div>
                        <h2 className="text-xl sm:text-3xl font-black mb-4 sm:mb-6 text-gray-900 tracking-tight leading-tight">Find Your Next <br className="sm:hidden" /><span className="text-blue-600 underline decoration-blue-200 decoration-4">Professional Leap</span></h2>
                        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3 sm:gap-4 relative z-10">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Keywords: React, UI..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 bg-gray-50 border-none h-11 sm:h-12 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-sm font-medium"
                                />
                            </div>
                            <div className="flex-1 relative group">
                                <MapPin className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Location..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-11 pr-4 bg-gray-50 border-none h-11 sm:h-12 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-sm font-medium"
                                />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-8 h-11 sm:h-12 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                                Search
                            </button>
                        </form>
                    </div>

                    <div className="space-y-3 sm:space-y-4 mb-10">
                        {jobs.length === 0 ? (
                            <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                <Briefcase size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500 font-black text-base sm:text-lg">Opportunities are loading...</p>
                                <p className="text-gray-400 text-xs sm:text-sm mt-1">Try adjusting your filters for better results.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <div key={job._id} className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all group/job">
                                    <div className="flex flex-col gap-5 sm:gap-6">
                                        <div className="flex gap-4 sm:gap-6 items-start">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-100 group-hover/job:bg-blue-600 group-hover/job:text-white transition-all duration-300">
                                                <Briefcase size={24} className="sm:w-8 sm:h-8" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/jobs/${job._id}`} className="text-lg sm:text-xl font-black text-gray-900 hover:text-blue-600 transition-colors leading-tight line-clamp-1 block">{job.title}</Link>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 font-bold text-sm">
                                                    <span className="text-gray-900 truncate">{job.company}</span>
                                                    <span className="text-gray-300 hidden xs:inline">•</span>
                                                    <span className="text-gray-500 flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                                                    <span className="bg-green-50 text-green-700 text-[9px] sm:text-[11px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-green-100">{job.type || 'Full-time'}</span>
                                                    <span className="bg-blue-50 text-blue-700 text-[9px] sm:text-[11px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-blue-100">{job.salary || '$120k'}</span>
                                                    <span className="bg-gray-50 text-gray-700 text-[9px] sm:text-[11px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-gray-100 hidden xs:block">Actively Hiring</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posted <span className="text-gray-800 ml-1">2 days ago</span></p>
                                            </div>
                                            {(() => {
                                                const application = myApplications.find(app => (app.job._id || app.job) === job._id)
                                                if (application) {
                                                    const statusColors = {
                                                        pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                                                        selected: 'bg-green-50 text-green-700 border-green-100',
                                                        rejected: 'bg-red-50 text-red-700 border-red-100',
                                                        stopped: 'bg-gray-100 text-gray-700 border-gray-200'
                                                    }
                                                    return (
                                                        <span className={`px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest border ${statusColors[application.status] || statusColors.pending} flex items-center justify-center gap-2`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${application.status === 'selected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                            {application.status === 'selected' ? 'Shortlisted' :
                                                                application.status === 'rejected' ? 'Passed' :
                                                                    application.status === 'stopped' ? 'Inactive' :
                                                                        'Applied'}
                                                        </span>
                                                    )
                                                }
                                                return (
                                                    <Link to={`/jobs/${job._id}`} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-50 active:scale-95 text-center">
                                                        Apply Now
                                                    </Link>
                                                )
                                            })()}
                                        </div>
                                    </div>
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
            const payload = {
                ...formData,
                author: user._id || user.id,
                skills: formData.skills.split(',').map(s => s.trim())
            }
            await axios.post('http://localhost:5000/api/jobs', payload)
            toast.success('Professional Opportunity Posted!')
            setFormData({ title: '', description: '', company: user.name, location: '', requirements: '', skills: '', website: '', salary: '', type: 'Full-time' })
        } catch (error) {
            toast.error('Failed to post vacancy')
        }
    }

    const inputClasses = "w-full bg-gray-50 border-none px-5 h-12 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-sm font-black placeholder-gray-400"
    const labelClasses = "block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1"

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClasses}>Job Title</label>
                    <input required placeholder="Lead Design Engineer" className={inputClasses} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>Company Brand</label>
                    <input required placeholder="Acne Studios" className={inputClasses} value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>Location</label>
                    <input required placeholder="Paris, France (On-site)" className={inputClasses} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>Salary Package</label>
                    <input placeholder="€90k - €120k" className={inputClasses} value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>Employment Type</label>
                    <select className={inputClasses + " cursor-pointer"} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                        <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>Application Portal/Link</label>
                    <input placeholder="https://careers.acne.com/..." className={inputClasses} value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                </div>
            </div>
            <div className="space-y-2">
                <label className={labelClasses}>The Role Description</label>
                <textarea required placeholder="Outline the vision and day-to-day impact..." rows={4} className={inputClasses.replace('h-12', 'h-auto py-4') + " resize-none"} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-2">
                <label className={labelClasses}>Candidate Requirements</label>
                <textarea required placeholder="Expertise in Figma, 5+ years experience..." rows={4} className={inputClasses.replace('h-12', 'h-auto py-4') + " resize-none"} value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
            </div>
            <div className="space-y-2">
                <label className={labelClasses}>Required Stack (Skills)</label>
                <input placeholder="React, Tailwind, Node.js, GraphQL..." className={inputClasses} value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-gray-900 text-white px-12 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 active:scale-95">Publish Opportunity</button>
            </div>
        </form>
    )
}
