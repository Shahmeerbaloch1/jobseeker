import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../context/UserContext'
import Layout from '../layout/Layout'
import Feed from '../pages/Feed'
import Jobs from '../pages/Jobs'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Verification from '../pages/Verification'
import Network from '../pages/Network'
import Messaging from '../pages/Messaging'
import Notifications from '../pages/Notifications'
import Profile from '../pages/Profile'
import JobDetails from '../pages/JobDetails'
import CompanyDashboard from '../pages/CompanyDashboard' // New
import MyItems from '../pages/MyItems'
import SearchResults from '../pages/SearchResults'
import ScrollToTop from '../components/ScrollToTop'

function ProtectedRoute({ children }) {
    const { user, loading } = useContext(UserContext)
    if (loading) return <div>Loading...</div>
    if (!user) return <Navigate to="/login" />
    return <Layout>{children}</Layout>
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verification" element={<Verification />} />

                <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
                <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
                <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/company-dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
                <Route path="/my-items" element={<ProtectedRoute><MyItems /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    )
}
