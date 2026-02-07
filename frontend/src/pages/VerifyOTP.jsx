import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams()
    const email = searchParams.get('email')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-reset-code', { email, code })
            toast.success(res.data.message)
            navigate(`/forgot-password/reset?email=${email}&code=${code}`)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired code')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">JobSocial</h1>
                <h2 className="text-xl font-semibold mb-6 text-center">Verify Reset Code</h2>
                <p className="text-gray-600 text-sm mb-6 text-center">
                    We've sent a 6-digit verification code to <span className="font-semibold text-gray-800">{email}</span>. Please enter it below.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-1">Verification Code</label>
                        <input
                            type="text"
                            maxLength="6"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-2xl tracking-[0.5em] transition-all"
                            placeholder="123456"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className={`w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 font-semibold mb-4 flex items-center justify-center transition-colors ${loading || code.length !== 6 ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-500">
                    Didn't get the code? <button
                        onClick={() => navigate('/forgot-password/email')}
                        className="text-blue-600 font-semibold hover:underline"
                    >Resend Email</button>
                </p>
                <p className="mt-2 text-center text-sm">
                    <Link to="/login" className="text-gray-600 hover:text-gray-800 hover:underline">Cancel and Login</Link>
                </p>
            </div>
        </div>
    )
}
