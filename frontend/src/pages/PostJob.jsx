import { useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { Plus, Trash2, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function PostJob() {
    const { user } = useContext(UserContext)
    const [job, setJob] = useState({ title: '', company: '', location: '', description: '', type: 'Full-time', salary: '' })
    const [questions, setQuestions] = useState([])
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/jobs', {
                ...job,
                author: user._id || user.id,
                questions
            })
            toast.success('Job posted successfully!')
            navigate('/dashboard')
        } catch (error) {
            console.error(error)
            toast.error('Failed to post job')
        }
    }

    const addQuestion = () => {
        setQuestions([...questions, { text: '', type: 'yes_no' }])
    }

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions]
        newQuestions[index][field] = value
        setQuestions(newQuestions)
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-3xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-3xl font-black text-white tracking-tight">Post a New Job</h1>
                    <p className="text-blue-100 mt-2 font-medium">Find the perfect candidate</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Job Title</label>
                            <input
                                type="text"
                                value={job.title}
                                onChange={(e) => setJob({ ...job, title: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                placeholder="e.g. Senior Developer"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Company Name</label>
                            <input
                                type="text"
                                value={job.company}
                                onChange={(e) => setJob({ ...job, company: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                placeholder="Your Company"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Location</label>
                            <input
                                type="text"
                                value={job.location}
                                onChange={(e) => setJob({ ...job, location: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                placeholder="e.g. New York (Remote)"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Job Type</label>
                            <select
                                value={job.type}
                                onChange={(e) => setJob({ ...job, type: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                            >
                                {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Salary Range (Optional)</label>
                        <input
                            type="text"
                            value={job.salary}
                            onChange={(e) => setJob({ ...job, salary: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                            placeholder="e.g. $100k - $120k"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Description</label>
                        <textarea
                            value={job.description}
                            onChange={(e) => setJob({ ...job, description: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium min-h-[150px]"
                            placeholder="Describe the role, requirements, and benefits..."
                            required
                        ></textarea>
                    </div>

                    {/* Screening Questions Section */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-blue-900 flex items-center gap-2">
                                <HelpCircle size={20} />
                                Screening Questions (Optional)
                            </h3>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="text-sm bg-white text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 font-bold hover:bg-blue-50 transition-colors flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Question
                            </button>
                        </div>

                        {questions.length === 0 ? (
                            <p className="text-blue-400 text-sm text-center py-4 italic">No screening questions added.</p>
                        ) : (
                            <div className="space-y-3">
                                {questions.map((q, i) => (
                                    <div key={i} className="bg-white p-3 rounded-lg border border-blue-100 flex gap-3 items-start animate-fade-in">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={q.text}
                                                onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                                                placeholder="Enter question (e.g., Do you have 5+ years of React experience?)"
                                                className="w-full border-gray-200 rounded-lg text-sm p-2 focus:outline-none focus:border-blue-400 border transition-colors"
                                                required
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Answer Type:</span>
                                                <select
                                                    value={q.type}
                                                    onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                                                    className="text-sm border-gray-200 rounded-md p-1 bg-gray-50 font-medium"
                                                >
                                                    <option value="yes_no">Yes / No</option>
                                                    <option value="number">Numeric</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(i)}
                                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-lg">
                        <Plus size={24} /> Post Job Now
                    </button>
                </form>
            </div>
        </div>
    )
}
