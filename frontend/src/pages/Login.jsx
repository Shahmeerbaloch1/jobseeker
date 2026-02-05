import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(false)
    const { login } = useContext(UserContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors([])
        setLoading(true)
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password })
            login(res.data.user, res.data.token)
            toast.success('Welcome back!')
            navigate('/')
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed'
            setErrors([errorMsg])
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">JobSocial</h1>
                <h2 className="text-xl font-semibold mb-6 text-center">Sign in</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border p-2 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border p-2 rounded mt-1"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold mb-4 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                    {errors.length > 0 && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        Please correct the following errors:
                                    </p>
                                    <ul className="list-disc list-inside text-xs text-red-600 mt-1">
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
                <p className="mt-4 text-center text-sm">
                    New to JobSocial? <Link to="/register" className="text-blue-600 font-semibold">Join now</Link>
                </p>
            </div>
        </div>
    )
}
