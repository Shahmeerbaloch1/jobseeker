import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const UserContext = createContext()

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            // In a real app, verify token with backend /api/auth/me
            // For now, decode or just trust presence + fetching me
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            // Mock "Me" call or decoding for speed, but ideally:
            // axios.get('http://localhost:5000/api/auth/me').then(...)

            // Checking if we have user data stored
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                setUser(JSON.parse(storedUser))
            }
        }
        setLoading(false)
    }, [])

    const login = (userData, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
    }

    return (
        <UserContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    )
}
