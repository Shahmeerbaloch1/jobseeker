import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Mail, ArrowRight, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react'

export default function Verification() {
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [resendDisabled, setResendDisabled] = useState(true)
    const [countdown, setCountdown] = useState(60)

    const location = useLocation()
    const navigate = useNavigate()
    const email = location.state?.email

    useEffect(() => {
        if (!email) {
            toast.error('Email not found. Please register first.')
            navigate('/register')
        }
    }, [email, navigate])

    useEffect(() => {
        let timer
        if (countdown > 0 && resendDisabled) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1)
            }, 1000)
        } else if (countdown === 0) {
            setResendDisabled(false)
        }
        return () => clearInterval(timer)
    }, [countdown, resendDisabled])

    const handleChange = (index, value) => {
        if (value.length > 1) return // Prevent multiple chars

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`)
            if (nextInput) nextInput.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`)
            if (prevInput) prevInput.focus()
        }
    }

    const handleVerify = async (e) => {
        e.preventDefault()
        const verificationCode = code.join('')
        if (verificationCode.length !== 6) return toast.error('Please enter the full 6-digit code')

        setLoading(true)
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify', {
                email,
                code: verificationCode
            })

            // Login user
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))

            toast.success('Email verified successfully! Welcome.')
            window.location.href = '/' // Full reload to update context
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (resendDisabled) return

        try {
            await axios.post('http://localhost:5000/api/auth/resend-code', { email })
            toast.success('Verification code resent!')
            setResendDisabled(true)
            setCountdown(60)
        } catch (error) {
            toast.error('Failed to resend code')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50 blur-3xl"></div>
                    <div className="relative z-10 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Verify Your Email</h2>
                    <p className="text-blue-100 text-sm font-medium">We've sent a code to <br /><span className="font-bold text-white">{email}</span></p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleVerify}>
                        <div className="flex justify-between gap-2 mb-8">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-gray-50 focus:bg-white text-gray-800"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || code.join('').length !== 6}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <>Verify & Continue <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm font-medium mb-3">Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={resendDisabled}
                            className={`flex items-center justify-center gap-2 mx-auto text-sm font-bold ${resendDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                            {resendDisabled ? (
                                <>Resend code in {countdown}s</>
                            ) : (
                                <>
                                    <RefreshCw size={16} /> Resend Code
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
