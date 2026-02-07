import { useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Trash2, Calendar, User as UserIcon } from 'lucide-react'
import ConfirmationModal from '../components/ConfirmationModal'

export default function Settings() {
    const { user, logout } = useContext(UserContext)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const accountCreatedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Not available'

    const handleDeleteAccount = async () => {
        setLoading(true)
        try {
            await axios.delete(`http://localhost:5000/api/users/${user._id || user.id}`)
            toast.success('Account deleted successfully')
            logout()
            navigate('/register')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            <div className="space-y-6">
                {/* Account Info Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <UserIcon size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                                <p className="text-sm text-gray-500">View your basic account details</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Calendar size={18} />
                                <span className="font-medium">Account Created On</span>
                            </div>
                            <span className="text-gray-900 font-semibold">{accountCreatedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-6 border-b border-red-50 bg-red-50/30 flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-xl text-red-600">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
                            <p className="text-sm text-red-600">Irreversible actions on your account</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-gray-900">Delete Account</h3>
                                <p className="text-sm text-gray-500">Once you delete your account, there is no going back. Please be certain.</p>
                            </div>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 w-full sm:w-auto"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account Permanently?"
                message="Are you sure you want to delete your account? All your data, posts, and connections will be permanently removed. This action cannot be undone."
                type="danger"
                loading={loading}
            />
        </div>
    )
}
