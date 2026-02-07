import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams()

    const email = searchParams.get('email')
    const code = searchParams.get('code')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match')
        }
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters')
        }

        setLoading(true)
        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email,
                code,
                newPassword
            })
            toast.success(res.data.message)
            navigate('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">JobSocial</h1>
                <h2 className="text-xl font-semibold mb-6 text-center">Setup New Password</h2>
                <p className="text-gray-600 text-sm mb-6 text-center">
                    Please choose a strong password that you haven't used before.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1 text-left">New Password</label>
                        <div className="relative flex items-center">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full border border-gray-300 p-2.5 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center h-full"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-1 text-left">Confirm New Password</label>
                        <div className="relative flex items-center">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full border border-gray-300 p-2.5 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center h-full"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 font-semibold mb-4 flex items-center justify-center transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Updating...' : 'Reset Password'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    <Link to="/login" className="text-gray-600 hover:text-gray-800 hover:underline">Back to Login</Link>
                </p>
            </div>
        </div>
    )
}
