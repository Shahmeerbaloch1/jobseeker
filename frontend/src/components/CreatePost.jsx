import { useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { Image, Paperclip, Send, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function CreatePost({ onPostCreated }) {
    const { user } = useContext(UserContext)
    const [content, setContent] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            if (file.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(file))
            } else {
                setPreview(null)
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content && !selectedFile) return

        setLoading(true)
        const formData = new FormData()
        formData.append('content', content)
        formData.append('author', user._id || user.id) // Ensure ID is compliant
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/')) formData.append('mediaType', 'image')
            else formData.append('mediaType', 'pdf') // Simple logic for now
            formData.append('media', selectedFile)
        }

        try {
            const res = await axios.post('http://localhost:5000/api/posts', formData)
            setContent('')
            setSelectedFile(null)
            setPreview(null)
            if (onPostCreated) onPostCreated(res.data)
            toast.success('Post published!')
        } catch (error) {
            toast.error('Failed to post')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 transition-all hover:shadow-md">
            <div className="flex gap-4">
                <Link to="/profile">
                    {user.profilePic ? (
                        <img src={`http://localhost:5000${user.profilePic}`} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                            {user.name[0]}
                        </div>
                    )}
                </Link>
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share an update or a job opportunity..."
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none resize-none text-[15px]"
                        rows={3}
                    />

                    {selectedFile && (
                        <div className="mt-4 relative group">
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                                {preview ? (
                                    <img src={preview} alt="Upload preview" className="w-full max-h-80 object-cover" />
                                ) : (
                                    <div className="flex items-center gap-3 p-4">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Paperclip size={20} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 truncate">{selectedFile.name}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => { setSelectedFile(null); setPreview(null) }}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-lg hover:bg-red-50 transition-colors border border-red-100"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-1">
                            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors group">
                                <Image size={20} className="group-hover:text-blue-600 transition-colors" />
                                <span className="text-xs font-bold hidden sm:block">Photo / Video</span>
                                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors group">
                                <Paperclip size={20} className="group-hover:text-blue-600 transition-colors" />
                                <span className="text-xs font-bold hidden sm:block">Document</span>
                                <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                            </label>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!content && !selectedFile)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-sm hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Send size={16} />
                            )}
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
