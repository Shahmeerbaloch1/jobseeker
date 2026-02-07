import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email })
            toast.success(res.data.message)
            navigate(`/forgot-password/verify?email=${email}`)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">JobSocial</h1>
                <h2 className="text-xl font-semibold mb-6 text-center">Forgot Password</h2>
                <p className="text-gray-600 text-sm mb-6 text-center">
                    Enter your email address and we'll send you a verification code to reset your password.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 font-semibold mb-4 flex items-center justify-center transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending Code...
                            </>
                        ) : (
                            'Send Code'
                        )}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Remember your password? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Back to Login</Link>
                </p>
            </div>
        </div>
    )
}
