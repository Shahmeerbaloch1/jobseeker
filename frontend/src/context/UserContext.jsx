import { createContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

export const UserContext = createContext()

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const socketRef = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            fetchCurrentUser()
            // connectSocket called inside fetchCurrentUser after getting ID
        } else {
            setLoading(false)
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect()
        }
    }, [])

    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/me')
            const userData = res.data
            setUser(userData)
            // Update local storage to keep it somewhat in sync, though we rely on api now
            localStorage.setItem('user', JSON.stringify(userData))

            const userId = userData._id || userData.id
            if (userId) {
                connectSocket(userId)
                fetchUnreadCount(userId)
            }
        } catch (error) {
            console.error('Failed to fetch user', error)
            logout() // invalid token
        } finally {
            setLoading(false)
        }
    }

    const connectSocket = (userId) => {
        if (socketRef.current || !userId) return
        try {
            socketRef.current = io('http://localhost:5000')
            socketRef.current.emit('join_room', userId)

            socketRef.current.on('receive_message', () => {
                setUnreadCount(prev => prev + 1)
            })
        } catch (error) {
            console.error('Socket connection failed', error)
        }
    }

    const fetchUnreadCount = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/unread/${userId}`)
            setUnreadCount(res.data.count)
        } catch (error) {
            console.error('Failed to fetch unread count', error)
        }
    }

    const login = (userData, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(userData)

        const userId = userData._id || userData.id
        if (userId) {
            connectSocket(userId)
            fetchUnreadCount(userId)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
        }
        setUnreadCount(0)
    }

    return (
        <UserContext.Provider value={{ user, setUser, login, logout, loading, socket: socketRef.current, unreadCount, setUnreadCount }}>
            {children}
        </UserContext.Provider>
    )
}
