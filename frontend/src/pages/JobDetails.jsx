import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { Building, MapPin, Clock, Upload, X, Trash2, ChevronLeft, ChevronRight, FileText, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import ApplicationView from '../components/ApplicationView'

export default function JobDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useContext(UserContext)
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showApplyModal, setShowApplyModal] = useState(false)

    // Application Wizard State
    const [step, setStep] = useState(1)
    const [resume, setResume] = useState(null)
    const [applicantDetails, setApplicantDetails] = useState({ name: '', email: '', phone: '' })
    const [coverLetter, setCoverLetter] = useState('')
    const [answers, setAnswers] = useState({}) // { [questionText]: answer }

    useEffect(() => {
        fetchJob()
    }, [id])

    const [hasApplied, setHasApplied] = useState(false)

    useEffect(() => {
        if (user && id) {
            checkApplicationStatus()
        }
    }, [id, user])

    const checkApplicationStatus = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs/applications/me')
            const myApplications = res.data
            // Check if current job ID is in my applications
            const found = myApplications.some(app =>
                (typeof app.job === 'object' ? app.job._id === id : app.job === id)
            )
            setHasApplied(found)
        } catch (error) {
            console.error("Failed to check application status", error)
        }
    }

    useEffect(() => {
        if (user) {
            setApplicantDetails({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            })
        }
    }, [user])

    const fetchJob = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs')
            const found = res.data.find(j => j._id === id)
            setJob(found)
            setLoading(false)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return
        try {
            await axios.delete(`http://localhost:5000/api/jobs/${id}`)
            toast.success('Job deleted successfully')
            navigate('/dashboard')
        } catch (error) {
            toast.error('Failed to delete job')
        }
    }

    const handleNext = () => {
        if (step === 1 && !resume) return toast.error('Please upload your resume to proceed')
        if (step === 2 && (!applicantDetails.name || !applicantDetails.email || !applicantDetails.phone)) return toast.error('Please fill in all contact details')

        // Skip questions step if no questions
        if (step === 2 && (!job.questions || job.questions.length === 0)) {
            setStep(4)
            return
        }

        setStep(step + 1)
    }

    const handlePrev = () => {
        // Skip questions step going back if no questions
        if (step === 4 && (!job.questions || job.questions.length === 0)) {
            setStep(2)
            return
        }
        setStep(step - 1)
    }

    const handleAnswerChange = (questionText, value) => {
        setAnswers({ ...answers, [questionText]: value })
    }

    const handleApply = async () => {
        const formData = new FormData()
        formData.append('applicantId', user._id || user.id)
        formData.append('resume', resume)
        formData.append('coverLetter', coverLetter)
        formData.append('applicantName', applicantDetails.name)
        formData.append('applicantEmail', applicantDetails.email)
        formData.append('applicantPhone', applicantDetails.phone)

        // Format answers for backend
        const formattedResponses = Object.entries(answers).map(([q, a]) => ({
            questionText: q,
            answer: a
        }))
        formData.append('responses', JSON.stringify(formattedResponses))

        try {
            await axios.post(`http://localhost:5000/api/jobs/${id}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success('Application submitted successfully!')
            setShowApplyModal(false)
            // Refresh application status
            checkApplicationStatus()
            fetchJob()
            // Reset state
            setStep(1)
            setResume(null)
            setAnswers({})
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply')
            console.error(error)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading job details...</div>
    if (!job) return <div className="p-8 text-center">Job not found</div>

    const isAuthor = user && job.author && (
        (user._id && job.author._id && user._id.toString() === job.author._id.toString()) ||
        (user.id && job.author._id && user.id.toString() === job.author._id.toString()) ||
        (user._id && job.author === user._id) ||
        (user.id && job.author === user.id)
    )

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-blue-700 to-indigo-600"></div>

                <div className="px-8 pb-8">
                    <div className="flex justify-between items-start -mt-10 mb-6">
                        <div className="bg-white p-2 rounded-2xl shadow-md">
                            <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-3xl border border-blue-100">
                                {job.company[0]}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-12">
                            {isAuthor && (
                                <button
                                    onClick={handleDelete}
                                    className="bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 flex items-center gap-2 transition-colors shadow-sm"
                                >
                                    <Trash2 size={18} /> Delete Job
                                </button>
                            )}
                            {!isAuthor && (
                                hasApplied ? (
                                    <button
                                        disabled
                                        className="bg-green-100 text-green-700 px-8 py-2.5 rounded-xl font-bold text-lg cursor-not-allowed flex items-center gap-2"
                                    >
                                        <CheckCircle size={20} /> Applied
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                                    >
                                        Easy Apply
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{job.title}</h1>
                    <div className="text-lg text-gray-600 font-medium mb-6 flex items-center gap-2">
                        {job.company}
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="text-gray-500">{job.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-8">
                        <span className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200">
                            <Building size={16} className="text-blue-500" /> {job.type}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200">
                            <MapPin size={16} className="text-green-500" /> {job.location}
                        </span>
                        {job.salary && (
                            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-200">
                                💰 {job.salary}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200">
                            <Clock size={16} className="text-purple-500" /> Posted Recently
                        </span>
                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100">
                            12 Applicants
                        </span>
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            About the role
                        </h3>
                        <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
                            {job.description || "No description provided."}
                        </div>

                        {job.requirements && (
                            <>
                                <h3 className="text-xl font-bold mb-4">Requirements</h3>
                                <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
                                    {job.requirements}
                                </div>
                            </>
                        )}

                        {job.skills && job.skills.length > 0 && (
                            <>
                                <h3 className="text-xl font-bold mb-4">Skills Required</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).map((skill, index) => (
                                        <span key={index} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm border border-blue-100">
                                            {typeof skill === 'string' ? skill.trim() : skill}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Application Modal Wizard */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-up overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Apply to {job.company}</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                                    Step {step} of {(job.questions && job.questions.length > 0) ? 4 : 3}:
                                    {step === 1 && ' Upload Resume'}
                                    {step === 2 && ' Contact Details'}
                                    {step === 3 && ' Screening Questions'}
                                    {step === 4 && ' Review Application'}
                                </p>
                            </div>
                            <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-gray-100 w-full mb-0">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${(step / ((job.questions && job.questions.length > 0) ? 4 : 3)) * 100}%` }}
                            ></div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                            <FileText size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Upload your Resume</h3>
                                        <p className="text-gray-500 mt-2">Please upload your CV in PDF format to continue.</p>
                                    </div>

                                    <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${resume ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'} cursor-pointer relative group`}>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setResume(e.target.files[0])}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        {resume ? (
                                            <div>
                                                <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
                                                <p className="font-bold text-gray-900">{resume.name}</p>
                                                <p className="text-xs text-green-600 font-bold mt-1">Ready to upload</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload size={32} className="mx-auto text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
                                                <p className="font-bold text-gray-700 group-hover:text-blue-700">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-400 mt-2">PDF only (Max 5MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                            <input
                                                value={applicantDetails.name}
                                                onChange={e => setApplicantDetails(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={applicantDetails.email}
                                                onChange={e => setApplicantDetails(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={applicantDetails.phone}
                                                onChange={e => setApplicantDetails(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Cover Letter (Optional)</label>
                                            <textarea
                                                value={coverLetter}
                                                onChange={e => setCoverLetter(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium min-h-[100px]"
                                                placeholder="Tell us why you're a fit..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900">Screening Questions</h3>
                                    <p className="text-gray-500 text-sm mb-6">Please answer the following questions from the employer.</p>

                                    <div className="space-y-6">
                                        {job.questions.map((q, i) => (
                                            <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-shadow hover:shadow-md hover:border-blue-200">
                                                <label className="block font-bold text-gray-800 mb-3">{q.text}</label>
                                                {q.type === 'yes_no' ? (
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-400 font-medium">
                                                            <input
                                                                type="radio"
                                                                name={`q-${i}`}
                                                                value="Yes"
                                                                checked={answers[q.text] === 'Yes'}
                                                                onChange={() => handleAnswerChange(q.text, 'Yes')}
                                                                className="text-blue-600 focus:ring-blue-500"
                                                            /> Yes
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-400 font-medium">
                                                            <input
                                                                type="radio"
                                                                name={`q-${i}`}
                                                                value="No"
                                                                checked={answers[q.text] === 'No'}
                                                                onChange={() => handleAnswerChange(q.text, 'No')}
                                                                className="text-blue-600 focus:ring-blue-500"
                                                            /> No
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={answers[q.text] || ''}
                                                        onChange={(e) => handleAnswerChange(q.text, e.target.value)}
                                                        className="w-full max-w-xs bg-white border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                                        placeholder="Enter number..."
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <ApplicationView
                                    applicantDetails={applicantDetails}
                                    resume={resume}
                                    coverLetter={coverLetter}
                                    responses={answers}
                                />
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50/50">
                            {step > 1 ? (
                                <button
                                    onClick={handlePrev}
                                    className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all flex items-center gap-2"
                                >
                                    <ChevronLeft size={18} /> Back
                                </button>
                            ) : (
                                <div></div> // Spacer
                            )}

                            {step < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    Next Step <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleApply}
                                    className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    Submit Application <CheckCircle size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
