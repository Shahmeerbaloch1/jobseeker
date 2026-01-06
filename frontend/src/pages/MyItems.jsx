import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { UserContext } from '../context/UserContext'
import { Briefcase, Calendar, Clock, ChevronRight, Bookmark, Users, ExternalLink, MessageSquare, Check, X, Ban, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function MyItems() {
    const { user } = useContext(UserContext)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedJob, setSelectedJob] = useState(null)
    const [applicants, setApplicants] = useState([])
    const [loadingApplicants, setLoadingApplicants] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = user.role === 'company'
                    ? 'http://localhost:5000/api/jobs/posted'
                    : 'http://localhost:5000/api/jobs/applications/me'
                const res = await axios.get(endpoint)
                setData(res.data)
            } catch (error) {
                // Error handling handled by UI states
            } finally {
                setLoading(false)
            }
        }
        if (user) fetchData()
    }, [user])

    const fetchApplicants = async (jobId) => {
        setLoadingApplicants(true)
        try {
            const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}/applications`)
            setApplicants(res.data)
        } catch (error) {
            toast.error('Failed to load applicants')
        } finally {
            setLoadingApplicants(false)
        }
    }

    const handleUpdateStatus = async (appId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/jobs/applications/${appId}/status`, { status: newStatus })
            setApplicants(applicants.map(app => app._id === appId ? { ...app, status: newStatus } : app))
            toast.success(`Status updated to ${newStatus}`)
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    // --- COMPANY VIEW ---
    if (user.role === 'company') {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Jobs List */}
                    <div className="md:w-1/3 space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Briefcase className="text-blue-600" /> My Posted Jobs
                            </h2>
                            <div className="space-y-2">
                                {data.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No jobs posted yet.</p>
                                ) : (
                                    data.map(job => (
                                        <button
                                            key={job._id}
                                            onClick={() => { setSelectedJob(job); fetchApplicants(job._id); }}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedJob?._id === job._id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                                        >
                                            <h3 className="font-bold text-gray-900 leading-tight">{job.title}</h3>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                <span>{job.location}</span>
                                                <span>•</span>
                                                <span>{formatDistanceToNow(new Date(job.createdAt))} ago</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Applicants Panel */}
                    <div className="md:w-2/3">
                        {!selectedJob ? (
                            <div className="bg-white h-[400px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                <Users size={48} className="mb-4 opacity-20" />
                                <p className="font-medium">Select a job to view applicants</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                                <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                                        <p className="text-gray-500 text-sm">Review applications and manage statuses</p>
                                    </div>
                                    <Link to={`/jobs/${selectedJob._id}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                                        <ExternalLink size={20} />
                                    </Link>
                                </div>

                                {loadingApplicants ? (
                                    <div className="flex justify-center py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
                                    </div>
                                ) : (
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Users size={20} className="text-blue-600" />
                                            Applicants ({applicants.length})
                                        </h3>

                                        {applicants.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">No applicants yet for this position.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {applicants.map(app => (
                                                    <div key={app._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                            <div className="flex gap-4">
                                                                <div className="w-14 h-14 rounded-full bg-gray-100 border overflow-hidden flex-shrink-0">
                                                                    {app.applicant?.profilePic ? (
                                                                        <img src={`http://localhost:5000${app.applicant.profilePic}`} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{app.applicant?.name?.[0]}</div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-lg text-gray-900">{app.applicant?.name}</h4>
                                                                    <p className="text-gray-600 text-sm font-medium">{app.applicant?.headline || 'No headline'}</p>
                                                                    <div className="flex items-center gap-4 mt-3">
                                                                        <a
                                                                            href={`http://localhost:5000${app.resumeUrl}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="flex items-center gap-1.5 text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition"
                                                                        >
                                                                            <FileText size={14} /> View CV
                                                                        </a>
                                                                        <Link
                                                                            to={`/messaging?userId=${app.applicant?._id}`}
                                                                            className="flex items-center gap-1.5 text-gray-600 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-md hover:bg-gray-100 transition"
                                                                        >
                                                                            <MessageSquare size={14} /> Message
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-start sm:items-end justify-between gap-3">
                                                                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'selected' ? 'bg-green-100 text-green-700' :
                                                                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        app.status === 'stopped' ? 'bg-gray-100 text-gray-700' :
                                                                            'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {app.status}
                                                                </span>

                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app._id, 'selected')}
                                                                        title="Select Candidate"
                                                                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                                                                    >
                                                                        <Check size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                                        title="Reject Candidate"
                                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                                    >
                                                                        <X size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app._id, 'stopped')}
                                                                        title="Stop Hiring"
                                                                        className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                                                                    >
                                                                        <Ban size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // --- JOB SEEKER VIEW ---
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Bookmark size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
                            <p className="text-gray-500 text-sm">View and track your job applications</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-600" />
                        My Applications ({data.length})
                    </h2>

                    {data.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No applications yet</h3>
                            <p className="text-gray-500 mb-6 font-medium">Find jobs that match your skills</p>
                            <Link to="/jobs" className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                Search Jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {data.map((app) => (
                                <div key={app._id} className="border rounded-xl p-5 hover:border-blue-200 bg-white transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                                                {app.job?.company?.[0] || 'J'}
                                            </div>
                                            <div>
                                                <Link to={`/jobs/${app.job?._id}`} className="font-bold text-lg text-gray-900 hover:text-blue-600 block leading-tight">
                                                    {app.job?.title}
                                                </Link>
                                                <p className="text-gray-600 font-medium text-sm mt-0.5">{app.job?.company}</p>
                                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <Calendar size={14} />
                                                        {app.createdAt ? (
                                                            (() => {
                                                                const date = new Date(app.createdAt)
                                                                return isNaN(date.getTime()) ? 'Just now' : `${formatDistanceToNow(date)} ago`
                                                            })()
                                                        ) : 'Just now'}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-medium"><Clock size={14} /> {app.job?.type || 'Full-time'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${app.status === 'selected' ? 'bg-green-100 text-green-700' :
                                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    app.status === 'stopped' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                            <Link to={`/jobs/${app.job?._id}`} className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-400 hover:text-blue-600">
                                                <ChevronRight size={20} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
