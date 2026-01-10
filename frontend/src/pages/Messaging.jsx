import { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { ArrowLeft, Send, MessageSquare, Paperclip, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function Messaging() {
    const { user, socket, setUnreadCount } = useContext(UserContext)
    const [conversations, setConversations] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        fetchConnections()

        if (socket) {
            socket.off('receive_message')
            socket.on('receive_message', (message) => {
                const partnerId = activeChat?._id || activeChat?.id
                const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender

                if (partnerId && senderId === partnerId) {
                    setMessages(prev => [...prev, message])
                    markAsRead(partnerId)
                }
                fetchConnections() // Re-sort list in real-time
            })
        }

        return () => {
            if (socket) socket.off('receive_message')
        }
    }, [socket, activeChat])

    useEffect(() => {
        if (activeChat) {
            const partnerId = activeChat._id || activeChat.id
            fetchMessages(partnerId)
            markAsRead(partnerId)
        }
    }, [activeChat])

    const markAsRead = async (senderId) => {
        try {
            await axios.put('http://localhost:5000/api/messages/read', {
                senderId: senderId,
                recipientId: user._id || user.id
            })
            const res = await axios.get(`http://localhost:5000/api/messages/unread/${user._id || user.id}`)
            setUnreadCount(res.data.count)
        } catch (error) {
            // Silently fail
        }
    }

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/conversations/${user._id || user.id}`)
            setConversations(res.data)

            // If no active chat, but we have conversations, don't auto-select to avoid confusion
            // unless the user just came from a profile (which is handled by useEffect on activeChat)
        } catch (error) {
            console.error('Fetch conversations error:', error)
        }
    }

    const fetchConnections = async () => {
        try {
            // First fetch existing conversations (sorted by latest msg)
            const resConversations = await axios.get(`http://localhost:5000/api/messages/conversations/${user._id || user.id}`)
            const existingConvIds = resConversations.data.map(c => c._id)

            // Then fetch all connections that don't have messages yet
            const resUsers = await axios.get(`http://localhost:5000/api/users?userId=${user._id || user.id}`)
            const acceptedConnections = resUsers.data.filter(u =>
                u.connectionStatus === 'accepted' && !existingConvIds.includes(u._id)
            )

            // Combine: Conversations first (active), then silent connections
            setConversations([...resConversations.data, ...acceptedConnections])
        } catch (error) {
            console.error('Fetch connections error:', error)
        }
    }

    const fetchMessages = async (partnerId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/${user._id || user.id}/${partnerId}`)
            setMessages(res.data)
        } catch (error) {
            // Silently fail
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if ((!newMessage.trim() && !selectedFile) || !activeChat) return

        const recipientId = activeChat._id || activeChat.id
        const formData = new FormData()
        formData.append('senderId', user._id || user.id)
        formData.append('recipientId', recipientId)
        formData.append('content', newMessage.trim() || 'Sent an attachment')
        if (selectedFile) {
            formData.append('file', selectedFile)
        }

        // Reset inputs
        setNewMessage('')
        setSelectedFile(null)

        try {
            const res = await axios.post('http://localhost:5000/api/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            // Update messages list with the real response
            setMessages(prev => [...prev, res.data])
            // Refresh conversation list to bring this one to top
            fetchConnections()
        } catch (error) {
            console.error('Send message error:', error)
        }
    }

    const getMediaUrl = (url) => {
        if (!url) return ''
        return url.startsWith('http') ? url : `http://localhost:5000${url}`
    }

    return (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 h-[calc(100vh-145px)] md:h-[calc(100vh-100px)] flex overflow-hidden lg:max-w-6xl mx-auto mb-20 md:mb-0">
            {/* Sidebar: Conversations */}
            <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 shrink-0">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight text-center w-full">Messaging</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="font-bold text-sm">No connections yet</p>
                            <Link to="/network" className="text-blue-600 text-xs mt-2 block hover:underline">Find people to connect with</Link>
                        </div>
                    ) : (
                        conversations.map(u => {
                            const hasLastMsg = u.lastMessage
                            const isUnread = hasLastMsg && !hasLastMsg.read && hasLastMsg.recipient === (user._id || user.id)

                            return (
                                <div
                                    key={u._id}
                                    onClick={() => setActiveChat(u)}
                                    className={`p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-gray-50 transition-all border-b border-gray-50 ${activeChat?._id === u._id ? 'bg-blue-50/50' : ''} ${isUnread ? 'bg-blue-50/30' : ''}`}
                                >
                                    <Link to={`/profile/${u._id}`} onClick={(e) => e.stopPropagation()} className="relative shrink-0">
                                        {u.profilePic ? (
                                            <img src={getMediaUrl(u.profilePic)} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                        ) : (
                                            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-sm border-2 border-white text-sm sm:text-base">
                                                {u.name[0]}
                                            </div>
                                        )}
                                        <div className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 ${isUnread ? 'bg-blue-600 animate-pulse' : 'bg-green-500'} border-2 border-white rounded-full`}></div>
                                    </Link>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-start gap-2 mb-0.5">
                                            <span className={`text-[13px] sm:text-[14px] truncate ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>{u.name}</span>
                                            {hasLastMsg && (
                                                <span className="text-[9px] text-gray-400 font-bold uppercase shrink-0">
                                                    {formatDistanceToNow(new Date(hasLastMsg.createdAt), { addSuffix: false }).replace('about ', '').replace(' minutes', 'm').replace(' minute', 'm').replace(' hours', 'h').replace(' hour', 'h').replace(' days', 'd').replace(' day', 'd')}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-[10px] truncate tracking-tight uppercase ${isUnread ? 'text-blue-600 font-black' : 'text-gray-500 font-bold'}`}>
                                            {isUnread ? 'New Message' : (hasLastMsg ? (hasLastMsg.attachment ? 'Sent a file' : hasLastMsg.content) : (u.headline || 'Job Seeker'))}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-gray-50/30 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center gap-3 sm:gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm shrink-0">
                            <button onClick={() => setActiveChat(null)} className="md:hidden p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                <Link to={`/profile/${activeChat._id || activeChat.id}`} className="shrink-0">
                                    {activeChat.profilePic ? (
                                        <img src={getMediaUrl(activeChat.profilePic)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-100" />
                                    ) : (
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-xs sm:text-sm">
                                            {activeChat.name[0]}
                                        </div>
                                    )}
                                </Link>
                                <div className="flex flex-col min-w-0">
                                    <Link to={`/profile/${activeChat._id || activeChat.id}`} className="hover:underline">
                                        <h3 className="font-black text-gray-900 text-[13px] sm:text-sm leading-none truncate">{activeChat.name}</h3>
                                    </Link>
                                    <span className="text-[9px] text-green-500 font-bold mt-1 tracking-wider uppercase">Active Now</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-6">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                                    <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                                        <MessageSquare size={32} />
                                    </div>
                                    <p className="font-black text-[10px] uppercase tracking-widest text-gray-500">Say hello to {activeChat.name.split(' ')[0]}!</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
                                    const isMe = senderId === (user._id || user.id)

                                    return (
                                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-[13px] sm:text-[14px] font-medium shadow-sm transition-all hover:shadow-md ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                {msg.attachment && (
                                                    <div className="mb-3">
                                                        <a
                                                            href={msg.attachment}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-100 text-blue-600'} hover:scale-[1.02] transition-transform`}
                                                        >
                                                            <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                                                                <FileText size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-black uppercase tracking-widest opacity-70 mb-0.5">PDF Document</p>
                                                                <p className="text-xs font-bold truncate">{msg.originalName || 'Document.pdf'}</p>
                                                            </div>
                                                        </a>
                                                    </div>
                                                )}
                                                {msg.content}
                                            </div>
                                            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 mt-1.5 px-2 uppercase tracking-tighter">
                                                {msg.createdAt ? (
                                                    (() => {
                                                        const date = new Date(msg.createdAt)
                                                        return isNaN(date.getTime()) ? 'Just now' : `${formatDistanceToNow(date)} ago`
                                                    })()
                                                ) : 'Just now'}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 sm:p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shrink-0">
                            {selectedFile && (
                                <div className="mb-3 flex items-center justify-between bg-blue-50 p-2 rounded-xl border border-blue-100 animate-slide-up">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-600 text-white p-2 rounded-lg">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-[11px] font-bold text-blue-700 truncate max-w-[200px]">{selectedFile.name}</span>
                                    </div>
                                    <button onClick={() => setSelectedFile(null)} className="text-blue-400 hover:text-blue-600 p-1">
                                        <ArrowLeft size={16} className="rotate-90" />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSend} className="flex gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 sm:p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all shadow-sm">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-2 sm:p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Paperclip size={20} className="sm:w-5 sm:h-5" />
                                </button>
                                <input
                                    className="flex-1 bg-transparent border-none rounded-xl px-1 sm:px-2 py-1.5 sm:py-2 text-[13px] sm:text-sm focus:outline-none placeholder-gray-400 font-medium"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white p-2 sm:p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-50 disabled:opacity-50 disabled:bg-gray-400 active:scale-95 flex items-center justify-center shrink-0" disabled={!newMessage.trim() && !selectedFile}>
                                    <Send size={18} className="sm:w-5 sm:h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 p-8 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-6 group hover:scale-105 transition-transform">
                            <MessageSquare size={32} className="sm:w-10 sm:h-10 text-gray-200 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="text-gray-900 font-black text-lg sm:text-xl tracking-tight mb-2">Select a Conversation</h3>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-xs leading-relaxed">Choose a connection to start chatting and expanding your network.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
