import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CompanyDashboard() {
    const { user } = useContext(UserContext)
    const [showJobModal, setShowJobModal] = useState(false)
    const [jobForm, setJobForm] = useState({ title: '', company: user?.name || '', location: '', description: '', type: 'Full-time' })

    const handlePostJob = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:5000/api/jobs', { ...jobForm, author: user._id || user.id })
            toast.success('Job Posted Successfully!')
            setShowJobModal(false)
            setJobForm({ title: '', company: user?.name || '', location: '', description: '', type: 'Full-time' })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post job')
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Company Dashboard</h1>
                    <p className="text-gray-600">Manage your job postings and view applicants.</p>
                </div>
                <button onClick={() => setShowJobModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700 flex items-center gap-2">
                    <Plus size={20} /> Post a Job
                </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 border-b font-semibold text-gray-600">Job Title</th>
                            <th className="p-4 border-b font-semibold text-gray-600">Date Posted</th>
                            <th className="p-4 border-b font-semibold text-gray-600">Applicants</th>
                            <th className="p-4 border-b font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Mock Data for now */}
                        <tr className="hover:bg-gray-50">
                            <td className="p-4 border-b font-bold text-blue-600 cursor-pointer">Senior Frontend Engineer</td>
                            <td className="p-4 border-b text-gray-600">Today</td>
                            <td className="p-4 border-b font-bold text-green-600">0 Applicants</td>
                            <td className="p-4 border-b"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Active</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {showJobModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-2xl">
                        <button onClick={() => setShowJobModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={24} /></button>
                        <h2 className="text-xl font-bold mb-4">Post a New Job</h2>
                        <form onSubmit={handlePostJob} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Job Title</label>
                                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Location</label>
                                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Job Type</label>
                                <select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Remote</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Description</label>
                                <textarea className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" rows={4} value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} required />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Post Job</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
