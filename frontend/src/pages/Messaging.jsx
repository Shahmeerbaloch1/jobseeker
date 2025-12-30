import { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Send } from 'lucide-react'

export default function Messaging() {
    const { user } = useContext(UserContext)
    const [conversations, setConversations] = useState([]) // List of users we chatted with
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const socketRef = useRef()

    useEffect(() => {
        // Ideally we have an endpoint to get "My Conversations" (last message per user)
        // For MVP, letting user pick from Network/Connections or listing all users is easiest,
        // but better: fetch basic list of users we have connections with.
        fetchConnections()

        socketRef.current = io('http://localhost:5000')
        socketRef.current.emit('join', user._id || user.id)

        socketRef.current.on('receive_message', (message) => {
            if (activeChat && (message.sender === activeChat._id || message.sender === activeChat.id)) {
                setMessages(prev => [...prev, message])
            }
        })

        return () => socketRef.current.disconnect()
    }, [user, activeChat])

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat._id)
        }
    }, [activeChat])

    const fetchConnections = async () => {
        try {
            // Only fetch users who are actually connected or I have chatted with
            // For MVP: Fetch all users but filtered logic
            // Better: use the new getAllUsers status or filter manually
            const res = await axios.get(`http://localhost:5000/api/users?userId=${user._id || user.id}`)
            // Filter: ONLY show 'accepted' connections
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

        const msgData = {
            senderId: user._id || user.id,
            recipientId: activeChat._id,
            content: newMessage
        }

        // Optimistic updatet
        // setMessages([...messages, { ...msgData, createdAt: new Date() }])

        try {
            const res = await axios.post('http://localhost:5000/api/messages', msgData)
            setMessages([...messages, res.data])
            setNewMessage('')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow h-[calc(100vh-100px)] flex overflow-hidden">
            {/* Sidebar: Conversations */}
            <div className="w-1/3 border-r overflow-y-auto">
                <div className="p-4 border-b font-bold text-lg">Messaging</div>
                {conversations.map(u => (
                    <div
                        key={u._id}
                        onClick={() => setActiveChat(u)}
                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${activeChat?._id === u._id ? 'bg-blue-50 border-1 border-blue-200' : ''}`}
                    >
                        {u.profilePic ? (
                            <img src={`http://localhost:5000${u.profilePic}`} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                {u.name[0]}
                            </div>
                        )}
                        <div>
                            <div className="font-semibold text-sm">{u.name}</div>
                            <div className="text-xs text-gray-500 truncate">{u.headline || 'Job Seeker'}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3 shadow-sm bg-white z-10">
                            <h3 className="font-bold">{activeChat.name}</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg, i) => {
                                const isMe = msg.sender === (user._id || user.id)
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-lg text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none shadow-sm'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                            <input
                                className="flex-1 border rounded-full px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="Write a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    )
}
