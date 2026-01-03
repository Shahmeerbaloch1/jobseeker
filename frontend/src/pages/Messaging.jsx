import { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { Send } from 'lucide-react'

export default function Messaging() {
    const { user, socket, setUnreadCount } = useContext(UserContext)
    const [conversations, setConversations] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

    // Scroll to bottom whenever messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        fetchConnections()

        if (socket) {
            // Remove previous listeners to avoid duplicates if re-mounting
            socket.off('receive_message')

            socket.on('receive_message', (message) => {
                // If the message belongs to the current active chat
                if (activeChat && (message.sender === activeChat._id || message.sender === activeChat.id || message.sender._id === activeChat._id)) {
                    setMessages(prev => [...prev, message])
                    // Since we are viewing it, it shouldn't count as unread ideally.
                    // But global handler incremented it. We might need to "read" it immediately.
                    markAsRead(activeChat._id || activeChat.id)
                }
                // Note: The global UserContext listener also runs and increments the badge. 
                // If we are in the chat, we decrement it back below.
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
            // Update global badge locally by fetching freshly or simple logic
            // Let's refetch to be accurate
            const res = await axios.get(`http://localhost:5000/api/messages/unread/${user._id || user.id}`)
            setUnreadCount(res.data.count)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchConnections = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users?userId=${user._id || user.id}`)
            const myConnections = res.data.filter(u => u.connectionStatus === 'accepted')
            setConversations(myConnections)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchMessages = async (partnerId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/${user._id || user.id}/${partnerId}`)
            setMessages(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeChat) return

        const tempContent = newMessage
        const recipientId = activeChat._id || activeChat.id

        // 1. Clear input IMMEDIATELY (Optimistic UI)
        setNewMessage('')

        const msgData = {
            senderId: user._id || user.id,
            recipientId: recipientId,
            content: tempContent
        }

        // 2. Add to list IMMEDIATELY (Optimistic UI)
        const optimisticMsg = { ...msgData, createdAt: new Date().toISOString(), sender: (user._id || user.id) }
        setMessages(prev => [...prev, optimisticMsg])

        try {
            // 3. Send to backend
            const res = await axios.post('http://localhost:5000/api/messages', msgData)
            // Replace last message with real one? Or just trust it. 
            // Since we added it optimistically, we don't strictly *need* to replace it unless ID matters.
            // But to avoid duplicates if socket also sends it back (which it shouldn't for sender), we are good.
        } catch (error) {
            console.error(error)
            // Revert on failure? For MVP just log.
        }
    }

    return (
        <div className="bg-white rounded-lg shadow h-[calc(100vh-100px)] flex overflow-hidden">
            {/* Sidebar: Conversations */}
            <div className="w-1/3 border-r overflow-y-auto hidden md:block">
                <div className="p-4 border-b font-bold text-lg">Messaging</div>
                {conversations.map(u => (
                    <div
                        key={u._id}
                        onClick={() => setActiveChat(u)}
                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition ${activeChat?._id === u._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                    >
                        {u.profilePic ? (
                            <img src={`http://localhost:5000${u.profilePic}`} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                {u.name[0]}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <div className={`font-semibold text-sm ${activeChat?._id === u._id ? 'text-blue-700' : 'text-gray-900'}`}>{u.name}</div>
                            <div className="text-xs text-gray-500 truncate">{u.headline || 'Job Seeker'}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="w-full md:w-2/3 flex flex-col">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3 shadow-sm bg-white z-10">
                            {/* Mobile Back Button could go here */}
                            {activeChat.profilePic ? (
                                <img src={`http://localhost:5000${activeChat.profilePic}`} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
                                    {activeChat.name[0]}
                                </div>
                            )}
                            <h3 className="font-bold">{activeChat.name}</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg, i) => {
                                // Check both possibilities for sender (populated object or ID string)
                                const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
                                const isMe = senderId === (user._id || user.id)

                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                            <input
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="Write a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md disabled:opacity-50" disabled={!newMessage.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <Send size={48} className="mb-4 text-gray-300" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    )
}
