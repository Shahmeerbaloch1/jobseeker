import { useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { Image, Paperclip, Send, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

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
            const res = await axios.post('http://localhost:5000/api/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
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
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex gap-3">
                {user.profilePic ? (
                    <img src={`http://localhost:5000${user.profilePic}`} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                        {user.name[0]}
                    </div>
                )}
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start a post..."
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        rows={3}
                    />
                    {selectedFile && (
                        <div className="mt-2 relative bg-gray-100 p-2 rounded">
                            {preview ? (
                                <img src={preview} alt="Upload preview" className="max-h-60 rounded" />
                            ) : (
                                <span className="text-sm text-blue-600">{selectedFile.name}</span>
                            )}
                            <button onClick={() => { setSelectedFile(null); setPreview(null) }} className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-3">
                        <div className="flex space-x-2">
                            <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                <Image size={20} />
                                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                            <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                <Paperclip size={20} />
                                <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                            </label>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!content && !selectedFile)}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Send size={16} /> Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
