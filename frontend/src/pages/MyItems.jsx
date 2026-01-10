import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { UserContext } from '../context/UserContext'
import { Briefcase, Calendar, Clock, ChevronRight, Bookmark, Users, ExternalLink, MessageSquare, Check, X, Ban, FileText, MapPin, Trash2 } from 'lucide-react'
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


    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [jobToDelete, setJobToDelete] = useState(null)

    const initiateDelete = (jobId) => {
        setJobToDelete(jobId)
        setShowDeleteModal(true)
    }

    const confirmDeleteJob = async () => {
        if (!jobToDelete) return
        try {
            await axios.delete(`http://localhost:5000/api/jobs/${jobToDelete}`)
            setData(data.filter(job => job._id !== jobToDelete))
            if (selectedJob?._id === jobToDelete) {
                setSelectedJob(null)
                setApplicants([])
            }
            toast.success('Job deleted successfully')
        } catch (error) {
            toast.error('Failed to delete job')
        } finally {
            setShowDeleteModal(false)
            setJobToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing career assets...</p>
            </div>
        )
    }

    // --- COMPANY VIEW ---
    if (user.role === 'company') {
        return (
            <div className="w-full animate-fade-in pb-20 px-0 sm:px-1 relative">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-10">
                    {/* Left: Jobs List */}
                    <aside className="xl:col-span-4 space-y-4 sm:space-y-8">
                        <div className="premium-card p-5 sm:p-10 bg-white sticky top-24 sm:top-28">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
                                <div className="p-2 sm:p-3 bg-blue-600 rounded-xl sm:rounded-2xl text-white shadow-xl">
                                    <Briefcase size={18} className="sm:w-[22px] sm:h-[22px]" />
                                </div>
                                Active Pipelines
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                {data.length === 0 ? (
                                    <div className="py-12 sm:py-20 text-center bg-slate-50/50 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-slate-100">
                                        <p className="text-slate-400 font-black text-[10px] sm:text-[11px] uppercase tracking-widest">No roles published</p>
                                    </div>
                                ) : (
                                    data.map(job => (
                                        <div key={job._id} className="relative group/item">
                                            <button
                                                onClick={() => { setSelectedJob(job); fetchApplicants(job._id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                                className={`w-full text-left p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[1.75rem] transition-all duration-300 group ${selectedJob?._id === job._id ? 'bg-slate-900 text-white shadow-2xl translate-x-1' : 'bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:translate-x-1'}`}
                                            >
                                                <h3 className={`font-black tracking-tight leading-tight mb-2 sm:mb-3 text-sm sm:text-base pr-8 ${selectedJob?._id === job._id ? 'text-white' : 'text-slate-900'}`}>{job.title}</h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <MapPin size={10} className={selectedJob?._id === job._id ? 'text-blue-400' : 'text-slate-400'} />
                                                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${selectedJob?._id === job._id ? 'text-slate-400' : 'text-slate-500'}`}>{job.location}</span>
                                                    </div>
                                                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tighter bg-white/10 px-1.5 py-0.5 rounded ${selectedJob?._id === job._id ? 'inline-block' : 'hidden'}`}>Active</span>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); initiateDelete(job._id) }}
                                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/item:opacity-100"
                                                title="Delete Job"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Right: Applicants Panel */}
                    <main className="xl:col-span-8">
                        {!selectedJob ? (
                            <div className="premium-card h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/30 border-dashed border-2">
                                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 shadow-xl ring-1 ring-slate-100">
                                    <Users size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select a Talent Stream</h3>
                                <p className="text-slate-400 text-sm mt-3 font-medium max-w-xs leading-relaxed italic">Review professional profiles and manage your organization's recruitment pipeline.</p>
                            </div>
                        ) : (
                            <div className="premium-card overflow-hidden min-h-[500px] sm:min-h-[600px]">
                                <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-8 bg-gradient-to-br from-white to-slate-50/50">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter mb-1.5 sm:mb-2">{selectedJob.title}</h2>
                                        <p className="text-slate-400 font-black text-[9px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em]">Management Dashboard & Analysis</p>
                                    </div>
                                    <Link to={`/jobs/${selectedJob._id}`} className="bg-white text-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 hover:bg-slate-50 transition-all active:scale-95">
                                        <ExternalLink size={20} className="sm:w-6 sm:h-6" />
                                    </Link>
                                </div>

                                {loadingApplicants ? (
                                    <div className="flex flex-col items-center justify-center py-20 sm:py-32 space-y-4 sm:space-y-6">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Applicant Profiles...</p>
                                    </div>
                                ) : (
                                    <div className="p-5 sm:p-10">
                                        <div className="flex items-center justify-between mb-6 sm:mb-10">
                                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 sm:gap-4">
                                                <div className="w-1 h-6 sm:w-1.5 sm:h-7 bg-blue-600 rounded-full"></div>
                                                Candidates ({applicants.length})
                                            </h3>
                                            <div className="flex gap-2">
                                                <span className="px-3 py-1.5 sm:px-5 sm:py-2.5 bg-slate-50 text-slate-500 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest ring-1 ring-slate-100">
                                                    Latest
                                                </span>
                                            </div>
                                        </div>

                                        {applicants.length === 0 ? (
                                            <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                                <p className="text-slate-400 font-bold text-lg tracking-tight px-4 italic">No applications received for this position yet.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 sm:gap-6">
                                                {applicants.map(app => (
                                                    <div key={app._id} className="p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-50 bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group/app">
                                                        <div className="flex flex-col xl:flex-row justify-between gap-6 sm:gap-10">
                                                            <div className="flex gap-4 sm:gap-8 items-start">
                                                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.75rem] overflow-hidden shrink-0 shadow-2xl shadow-slate-200 border-2 border-white ring-1 ring-slate-100 group-hover/app:scale-105 transition-transform duration-500">
                                                                    {app.applicant?.profilePic ? (
                                                                        <img src={app.applicant?.profilePic.startsWith('http') ? app.applicant?.profilePic : `http://localhost:5000${app.applicant?.profilePic}`} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-black text-xl sm:text-3xl">{app.applicant?.name?.[0]}</div>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-2 sm:space-y-4">
                                                                    <div>
                                                                        <h4 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mb-0.5 sm:mb-1">{app.applicant?.name}</h4>
                                                                        <p className="text-slate-500 font-bold text-xs sm:text-sm tracking-tight">{app.applicant?.headline || 'High-Impact Professional'}</p>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                                                        <a
                                                                            href={`http://localhost:5000${app.resumeUrl}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="flex items-center gap-2 text-blue-600 text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-blue-50/50 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                        >
                                                                            <FileText size={14} className="sm:w-4 sm:h-4" /> CV
                                                                        </a>
                                                                        <Link
                                                                            to={`/messaging?userId=${app.applicant?._id}`}
                                                                            className="flex items-center gap-2 text-slate-500 text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-slate-50 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                                        >
                                                                            <MessageSquare size={14} className="sm:w-4 sm:h-4" /> Msg
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between gap-4 sm:gap-8 pt-4 sm:pt-6 xl:pt-0 border-t xl:border-none border-slate-50">
                                                                {(() => {
                                                                    const statusStyles = {
                                                                        selected: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                                                        rejected: 'bg-rose-50 text-rose-600 border-rose-100',
                                                                        stopped: 'bg-slate-100 text-slate-600 border-slate-200',
                                                                        pending: 'bg-amber-50 text-amber-600 border-amber-100'
                                                                    }
                                                                    return (
                                                                        <span className={`px-3 py-1 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-2xl text-[8px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] border shadow-sm ${statusStyles[app.status] || statusStyles.pending}`}>
                                                                            {app.status === 'selected' ? 'Selected' : app.status === 'rejected' ? 'Passed' : app.status}
                                                                        </span>
                                                                    )
                                                                })()}

                                                                <div className="flex gap-2 sm:gap-4">
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app._id, 'selected')}
                                                                        className="p-2 sm:p-4 rounded-lg sm:rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-emerald-200 active:scale-95"
                                                                    >
                                                                        <Check size={16} className="sm:w-5 sm:h-5" strokeWidth={3} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                                        className="p-2 sm:p-4 rounded-lg sm:rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-rose-200 active:scale-95"
                                                                    >
                                                                        <X size={16} className="sm:w-5 sm:h-5" strokeWidth={3} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app._id, 'stopped')}
                                                                        className="p-2 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-sm border border-slate-800 active:scale-95"
                                                                    >
                                                                        <Ban size={16} className="sm:w-5 sm:h-5" />
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
                    </main>
                </div>

                {/* Custom Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteModal(false)}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up border border-gray-100" onClick={e => e.stopPropagation()}>
                            <div className="p-8 text-center bg-white">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Opportunity?</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                    This action cannot be undone. The job listing and all associated applications will be permanently removed.
                                </p>
                            </div>
                            <div className="flex border-t border-slate-100">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <div className="w-px bg-slate-100"></div>
                                <button
                                    onClick={confirmDeleteJob}
                                    className="flex-1 py-4 text-red-600 font-black hover:bg-red-50 transition-colors text-sm uppercase tracking-widest"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // --- JOB SEEKER VIEW ---
    return (
        <div className="w-full animate-fade-in pb-20 px-0 sm:px-1">
            <div className="premium-card overflow-hidden">
                <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 bg-gradient-to-br from-white to-slate-50/50">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="p-3 sm:p-5 bg-blue-600 text-white rounded-2xl sm:rounded-[2rem] shadow-2xl shadow-blue-200">
                            <Bookmark size={24} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-tight">Professional Portfolio</h1>
                            <p className="text-slate-400 font-black text-[9px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5 sm:mt-1">Track ventures & career milestones</p>
                        </div>
                    </div>
                    <Link to="/jobs" className="w-full md:w-auto text-center bg-slate-900 hover:bg-blue-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-[1.75rem] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-2xl shadow-slate-200 active:scale-95">
                        Expand Horizons
                    </Link>
                </div>

                <div className="p-5 sm:p-10">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-6 sm:mb-10 flex items-center gap-3 sm:gap-4">
                        <div className="w-1 h-6 sm:w-1.5 sm:h-7 bg-blue-600 rounded-full"></div>
                        Applications ({data.length})
                    </h2>

                    {data.length === 0 ? (
                        <div className="text-center py-20 sm:py-32 bg-slate-50/30 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-slate-100 px-4">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl ring-1 ring-slate-100">
                                <Briefcase size={28} className="sm:w-10 sm:h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3">Begin Your Story</h3>
                            <p className="text-slate-400 text-sm sm:text-lg font-medium mb-6 sm:mb-10 italic">No historical applications found. The next leap awaits.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {data.map((app) => (
                                <div key={app._id} className="p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-50 bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group/app hover:-translate-y-1">
                                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 sm:gap-10">
                                        <div className="flex gap-5 sm:gap-8 items-start xl:items-center">
                                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 rounded-xl sm:rounded-[1.75rem] flex items-center justify-center text-slate-200 border border-slate-100 group-hover/app:bg-blue-600 group-hover/app:text-white transition-all duration-500 overflow-hidden shrink-0">
                                                <span className="font-black text-xl sm:text-3xl">{app.job?.company?.[0] || 'J'}</span>
                                            </div>
                                            <div className="space-y-2 sm:space-y-4">
                                                <div>
                                                    <Link to={`/jobs/${app.job?._id}`} className="text-lg sm:text-2xl font-black text-slate-900 hover:text-blue-600 transition-colors tracking-tight leading-tight block mb-0.5 sm:mb-1">
                                                        {app.job?.title}
                                                    </Link>
                                                    <p className="text-slate-500 font-bold text-[10px] sm:text-xs tracking-wider uppercase">{app.job?.company}</p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-1 sm:pt-2">
                                                    <span className="flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Calendar size={14} className="sm:w-4 sm:h-4 text-blue-500" />
                                                        {app.createdAt ? formatDistanceToNow(new Date(app.createdAt)) + ' ago' : 'Today'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Clock size={14} className="sm:w-4 sm:h-4 text-blue-500" />
                                                        {app.job?.type || 'Full-time'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between xl:justify-end gap-6 sm:gap-10 w-full xl:w-auto pt-5 sm:pt-8 xl:pt-0 border-t xl:border-none border-slate-50">
                                            <div className="shrink-0 text-left xl:text-right">
                                                <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-0.5 sm:mb-1">Phase Status</p>
                                                {(() => {
                                                    const statusStyles = {
                                                        selected: 'text-emerald-600',
                                                        rejected: 'text-rose-600',
                                                        stopped: 'text-slate-400',
                                                        pending: 'text-amber-600'
                                                    }
                                                    return (
                                                        <span className={`text-sm sm:text-xl font-black tracking-tight ${statusStyles[app.status] || statusStyles.pending} uppercase`}>
                                                            {app.status === 'selected' ? 'Shortlisted' : app.status === 'rejected' ? 'Closed' : app.status}
                                                        </span>
                                                    )
                                                })()}
                                            </div>
                                            <Link to={`/jobs/${app.job?._id}`} className="p-3 sm:p-5 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
                                                <ChevronRight size={20} className="sm:w-7 sm:h-7" />
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
