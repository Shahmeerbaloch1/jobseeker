import { useState, useContext, useCallback } from 'react'
import { UserContext } from '../context/UserContext'
import { Image, Paperclip, Send, X, Play, Clock, Check, ZoomIn, ZoomOut } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../utils/cropImage'

export default function CreatePost({ onPostCreated }) {
    const { user } = useContext(UserContext)
    const [content, setContent] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)

    // Cropping State
    const [isCropping, setIsCropping] = useState(false)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [tempImgSrc, setTempImgSrc] = useState(null)


    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // 10MB limit
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size exceeds 10MB limit')
                e.target.value = null // Reset input
                return
            }

            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.addEventListener('load', () => {
                    setTempImgSrc(reader.result)
                    setIsCropping(true)
                })
                reader.readAsDataURL(file)
            } else {
                setSelectedFile(file)
                if (file.type.startsWith('video/')) {
                    setPreview(URL.createObjectURL(file))
                } else {
                    setPreview(null)
                }
            }
        }
    }

    const cancelCrop = () => {
        setIsCropping(false)
        setTempImgSrc(null)
        // Reset input if needed, though react handles file inputs trickily
    }

    const performCrop = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(tempImgSrc, croppedAreaPixels)
            const file = new File([croppedImageBlob], "cropped-image.jpg", { type: "image/jpeg" })
            setSelectedFile(file)
            setPreview(URL.createObjectURL(file))
            setIsCropping(false)
            setTempImgSrc(null)
        } catch (e) {
            console.error(e)
            toast.error("Failed to crop image")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content && !selectedFile) return

        setLoading(true)
        const formData = new FormData()
        formData.append('content', content)
        formData.append('author', user._id || user.id)

        if (selectedFile) {
            let mediaType = 'pdf'
            if (selectedFile.type.startsWith('image/')) mediaType = 'image'
            else if (selectedFile.type.startsWith('video/')) mediaType = 'video'

            formData.append('mediaType', mediaType)
            formData.append('media', selectedFile)
        }

        try {
            const res = await axios.post('http://localhost:5000/api/posts', formData)
            setContent('')
            setSelectedFile(null)
            setPreview(null)
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6 transition-all hover:shadow-md">
            <div className="flex gap-3 sm:gap-4">
                <Link to="/profile" className="shrink-0">
                    {user.profilePic ? (
                        <img src={user.profilePic.startsWith('http') ? user.profilePic : `http://localhost:5000${user.profilePic}`} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                            {user.name?.[0]}
                        </div>
                    )}
                </Link>
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share an update or a job opportunity..."
                        className="w-full bg-gray-50 border-none rounded-2xl p-3 sm:p-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none resize-none text-sm sm:text-[15px]"
                        rows={3}
                    />

                    {selectedFile && (
                        <div className="mt-3 relative group">
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                                {selectedFile.type.startsWith('image/') ? (
                                    <img src={preview} alt="Upload preview" className="w-full max-h-60 sm:max-h-80 object-cover" />
                                ) : selectedFile.type.startsWith('video/') ? (
                                    <div className="relative">
                                        <video src={preview} className="w-full max-h-60 sm:max-h-80 object-cover" muted />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Play className="text-white drop-shadow-lg" size={40} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 sm:p-4">
                                        <div className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Paperclip size={18} />
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-gray-700 truncate">{selectedFile.name}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => { setSelectedFile(null); setPreview(null) }}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-lg hover:bg-red-50 transition-colors border border-red-100 z-10"
                            >
                                <X size={14} />
                            </button>


                        </div>
                    )}

                    <div className="flex justify-between items-center mt-3 sm:mt-4">
                        <div className="flex gap-1 items-center">
                            <label className="flex items-center gap-2 cursor-pointer p-2.5 sm:px-4 sm:py-2 hover:bg-gray-100 rounded-2xl text-gray-600 transition-colors group bg-gray-50 sm:bg-transparent">
                                <Image size={20} className="group-hover:text-blue-600 transition-colors sm:w-5 sm:h-5 text-blue-500 sm:text-gray-500" />
                                <span className="text-[10px] sm:text-xs font-black hidden sm:block uppercase">Media</span>
                                <input type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2.5 sm:px-4 sm:py-2 hover:bg-gray-100 rounded-2xl text-gray-600 transition-colors group bg-gray-50 sm:bg-transparent">
                                <Paperclip size={20} className="group-hover:text-blue-600 transition-colors sm:w-5 sm:h-5 text-blue-500 sm:text-gray-500" />
                                <span className="text-[10px] sm:text-xs font-black hidden sm:block uppercase">Document</span>
                                <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                            </label>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (!content && !selectedFile)}
                            className="bg-blue-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-lg shadow-blue-200 flex items-center gap-1.5 sm:gap-2 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Send size={14} className="sm:w-4 sm:h-4" />
                            )}
                            Post
                        </button>
                    </div>
                </div>
            </div>
            {isCropping && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col animate-fade-in">
                    <div className="relative flex-1 p-4">
                        <Cropper
                            image={tempImgSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 3}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <div className="bg-white p-4 pb-8 rounded-t-3xl sm:rounded-none sm:p-6">
                        <div className="max-w-xl mx-auto space-y-4">
                            <div className="flex items-center gap-4">
                                <ZoomOut size={20} className="text-gray-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <ZoomIn size={20} className="text-gray-400" />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={cancelCrop}
                                    className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performCrop}
                                    className="flex-1 py-3 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                                >
                                    <Check size={18} strokeWidth={3} /> Crop & Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
