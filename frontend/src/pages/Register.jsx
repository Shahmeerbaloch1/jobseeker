import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' })
    const { login } = useContext(UserContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData)
            toast.success(res.data.message)
            navigate('/verification', { state: { email: formData.email } })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">JobSocial</h1>
                <h2 className="text-xl font-semibold mb-6 text-center">Join now</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border p-2 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border p-2 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full border p-2 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">I am a...</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full border p-2 rounded mt-1"
                        >
                            <option value="user">Job Seeker</option>
                            <option value="company">Company (Hiring)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold">
                        Agree & Join
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already on JobSocial? <Link to="/login" className="text-blue-600 font-semibold">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
