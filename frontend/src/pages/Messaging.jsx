import { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { ArrowLeft, Send, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function Messaging() {
    const { user, socket, setUnreadCount } = useContext(UserContext)
    const [conversations, setConversations] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

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

    const fetchConnections = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users?userId=${user._id || user.id}`)
            const myConnections = res.data.filter(u => u.connectionStatus === 'accepted')
            setConversations(myConnections)
        } catch (error) {
            // Silently fail
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
        if (!newMessage.trim() || !activeChat) return

        const tempContent = newMessage
        const recipientId = activeChat._id || activeChat.id
        setNewMessage('')

        const msgData = {
            senderId: user._id || user.id,
            recipientId: recipientId,
            content: tempContent
        }

        const optimisticMsg = { ...msgData, createdAt: new Date().toISOString(), sender: (user._id || user.id) }
        setMessages(prev => [...prev, optimisticMsg])

        try {
            await axios.post('http://localhost:5000/api/messages', msgData)
        } catch (error) {
            // Failed
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex overflow-hidden lg:max-w-6xl mx-auto">
            {/* Sidebar: Conversations */}
            <div className={`w-full md:w-1/3 border-r flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight text-center w-full">Messaging</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <p className="font-bold text-sm">No connections yet</p>
                            <Link to="/network" className="text-blue-600 text-xs mt-2 block hover:underline">Find people to connect with</Link>
                        </div>
                    ) : (
                        conversations.map(u => (
                            <div
                                key={u._id}
                                onClick={() => setActiveChat(u)}
                                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-all border-b border-gray-50 ${activeChat?._id === u._id ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="relative">
                                    {u.profilePic ? (
                                        <img src={`http://localhost:5000${u.profilePic}`} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-sm border-2 border-white">
                                            {u.name[0]}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className="font-black text-gray-900 text-[14px] truncate">{u.name}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">12m</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-bold truncate tracking-tight uppercase">{u.headline || 'Job Seeker'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-gray-50/30 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                            <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <Link to="/profile" className="flex items-center gap-3">
                                {activeChat.profilePic ? (
                                    <img src={`http://localhost:5000${activeChat.profilePic}`} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                ) : (
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-sm">
                                        {activeChat.name[0]}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <h3 className="font-black text-gray-900 text-sm leading-none">{activeChat.name}</h3>
                                    <span className="text-[10px] text-green-500 font-bold mt-1 tracking-wider uppercase">Online</span>
                                </div>
                            </Link>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                    <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                                        <MessageSquare size={32} />
                                    </div>
                                    <p className="font-black text-xs uppercase tracking-widest">Start of conversation</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
                                    const isMe = senderId === (user._id || user.id)

                                    return (
                                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl text-[14px] font-medium shadow-sm transition-all hover:shadow-md ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 mt-1.5 px-2 uppercase tracking-tighter">
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

                        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
                            <form onSubmit={handleSend} className="flex gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
                                <input
                                    className="flex-1 bg-transparent border-none rounded-xl px-4 py-2 text-sm focus:outline-none placeholder-gray-400 font-medium"
                                    placeholder="Type a thoughtful message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:bg-gray-400 active:scale-95 flex items-center justify-center" disabled={!newMessage.trim()}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 p-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6 group hover:scale-110 transition-transform">
                            <MessageSquare size={40} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="text-gray-900 font-black text-xl tracking-tight mb-2">Select a Conversation</h3>
                        <p className="text-sm font-medium text-gray-500 max-w-xs leading-relaxed">Choose one of your professional connections to start chatting and expanding your network.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
