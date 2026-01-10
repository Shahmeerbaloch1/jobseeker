import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { Eye, Check, X, StopCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function CompanyDashboard() {
    const { user } = useContext(UserContext)
    const [jobs, setJobs] = useState([])
    const [selectedJob, setSelectedJob] = useState(null)
    const [applicants, setApplicants] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMyJobs()
    }, [])

    const fetchMyJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs/posted')
            setJobs(res.data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to fetch jobs')
        } finally {
            setLoading(false)
        }
    }

    const fetchApplicants = async (jobId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}/applications`)
            setApplicants(res.data)
            setSelectedJob(jobId)
        } catch (error) {
            console.error(error)
            toast.error('Failed to fetch applicants')
        }
    }

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/jobs/applications/${applicationId}/status`, { status })
            toast.success(`Application ${status}!`)
            // Refresh applicants
            fetchApplicants(selectedJob)
        } catch (error) {
            console.error(error)
            toast.error('Failed to update status')
        }
    }

    if (loading) return <div className="text-center py-8">Loading...</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">My Posted Jobs</h2>
                <div className="space-y-3">
                    {jobs.length === 0 ? (
                        <p className="text-gray-500 text-sm">No jobs posted yet.</p>
                    ) : (
                        jobs.map(job => (
                            <button
                                key={job._id}
                                onClick={() => fetchApplicants(job._id)}
                                className={`w-full text-left p-4 rounded-lg border transition ${selectedJob === job._id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <h3 className="font-bold text-gray-900">{job.title}</h3>
                                <p className="text-sm text-gray-600">{job.location}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Posted {job.createdAt ? (
                                        (() => {
                                            const date = new Date(job.createdAt)
                                            return isNaN(date.getTime()) ? 'Just now' : `${formatDistanceToNow(date)} ago`
                                        })()
                                    ) : 'Just now'}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Applicants List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">
                    {selectedJob ? 'Applicants' : 'Select a job to view applicants'}
                </h2>

                {!selectedJob ? (
                    <div className="text-center py-12 text-gray-500">
                        <Eye size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Click on a job to view applicants</p>
                    </div>
                ) : applicants.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No applicants yet for this job.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applicants.map(app => (
                            <div key={app._id} className="border rounded-lg p-4 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3">
                                        {app.applicant.profilePic ? (
                                            <img
                                                src={app.applicant.profilePic.startsWith('http') ? app.applicant.profilePic : `http://localhost:5000${app.applicant.profilePic}`}
                                                className="w-12 h-12 rounded-full object-cover"
                                                alt={app.applicant.name}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                                {app.applicant.name?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-gray-900">{app.applicantName || app.applicant.name}</h4>
                                            <p className="text-sm text-gray-600">{app.applicant.headline || 'Job Seeker'}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                📧 {app.applicantEmail} | 📞 {app.applicantPhone}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'accepted'
                                            ? 'bg-green-100 text-green-800'
                                            : app.status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : app.status === 'stopped'
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {app.status || 'pending'}
                                    </span>
                                </div>

                                {app.coverLetter && (
                                    <div className="bg-gray-50 p-3 rounded mb-3">
                                        <p className="text-sm text-gray-700">{app.coverLetter}</p>
                                    </div>
                                )}

                                {app.responses && app.responses.length > 0 && (
                                    <div className="bg-blue-50 p-3 rounded mb-3 border border-blue-100">
                                        <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Screening Responses</h5>
                                        <div className="space-y-2">
                                            {app.responses.map((resp, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 text-sm border-b border-blue-100 last:border-0 pb-1 last:pb-0">
                                                    <span className="text-gray-600 font-medium">{resp.questionText}</span>
                                                    <span className="text-blue-700 font-bold">{resp.answer}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {app.resumeUrl && (
                                        <a
                                            href={`http://localhost:5000${app.resumeUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <Eye size={16} /> View CV
                                        </a>
                                    )}
                                    {app.status !== 'accepted' && (
                                        <button
                                            onClick={() => handleStatusUpdate(app._id, 'accepted')}
                                            className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 flex items-center gap-1"
                                        >
                                            <Check size={16} /> Accept
                                        </button>
                                    )}
                                    {app.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 flex items-center gap-1"
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                    )}
                                    {app.status !== 'stopped' && (
                                        <button
                                            onClick={() => handleStatusUpdate(app._id, 'stopped')}
                                            className="bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-700 flex items-center gap-1"
                                        >
                                            <StopCircle size={16} /> Stop Hiring
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
