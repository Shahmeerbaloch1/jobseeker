import { X, Copy, Facebook, Linkedin, Twitter } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ShareModal({ isOpen, onClose, postUrl }) {
    if (!isOpen) return null

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl)
        toast.success('Link copied to clipboard!')
    }

    const shareSocial = (platform) => {
        let url = ''
        const text = encodeURIComponent("Check out this post on Job-Social!")
        const encodedUrl = encodeURIComponent(postUrl)

        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
                break
            case 'twitter':
                url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`
                break
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
                break
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`
                break
            default:
                return
        }
        window.open(url, '_blank', 'width=600,height=400')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative mx-4">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Share to...</h3>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <button onClick={() => shareSocial('facebook')} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                            <Facebook size={24} fill="currentColor" />
                        </div>
                        <span className="text-xs font-bold text-gray-600">Facebook</span>
                    </button>

                    <button onClick={() => shareSocial('twitter')} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform">
                            <Twitter size={24} fill="currentColor" />
                        </div>
                        <span className="text-xs font-bold text-gray-600">X</span>
                    </button>

                    <button onClick={() => shareSocial('linkedin')} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 bg-[#0077b5] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                            <Linkedin size={24} fill="currentColor" />
                        </div>
                        <span className="text-xs font-bold text-gray-600">LinkedIn</span>
                    </button>

                    <button onClick={() => shareSocial('whatsapp')} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </div>
                        <span className="text-xs font-bold text-gray-600">WhatsApp</span>
                    </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between gap-3 border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium truncate flex-1">{postUrl}</p>
                    <button
                        onClick={handleCopyLink}
                        className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-colors flex items-center gap-2 shrink-0"
                    >
                        <Copy size={16} /> Copy
                    </button>
                </div>
            </div>
        </div>
    )
}
