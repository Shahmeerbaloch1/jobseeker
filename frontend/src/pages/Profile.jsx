import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import PostCard from '../components/PostCard'
import { MapPin, Edit3, X, Camera, Users, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Profile() {
    const { user, setUser } = useContext(UserContext)
    const [posts, setPosts] = useState([])
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        headline: '',
        bio: '',
        skills: ''
    })

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                headline: user.headline || '',
                bio: user.bio || '',
                skills: user.skills ? user.skills.join(', ') : ''
            })
            fetchMyPosts()
        }
    }, [user])

    const fetchMyPosts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/posts')
            const myPosts = res.data.filter(p => p.author._id === (user._id || user.id))
            setPosts(myPosts)
        } catch (error) {
            // Silently fail
        }
    }

    const handleDeletePost = (postId) => {
        setPosts(posts.filter(post => post._id !== postId))
        toast.success('Post deleted successfully')
    }

    const [profilePicFile, setProfilePicFile] = useState(null)

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('name', editForm.name)
            formData.append('headline', editForm.headline)
            formData.append('bio', editForm.bio)

            const skillsArray = editForm.skills.split(',').map(s => s.trim()).filter(s => s)
            skillsArray.forEach(skill => formData.append('skills[]', skill))

            if (profilePicFile) formData.append('profilePic', profilePicFile)

            const res = await axios.put(`http://localhost:5000/api/users/${user._id || user.id}`, formData)
            setUser({ ...user, ...res.data })
            setIsEditing(false)
            setProfilePicFile(null)
            toast.success('Profile updated!')
        } catch (error) {
            toast.error('Failed to update profile')
        }
    }

    const getMediaUrl = (url) => {
        if (!url) return ''
        return url.startsWith('http') ? url : `http://localhost:5000${url}`
    }

    if (!user) return (
        <div className="flex flex-col items-center justify-center p-20 text-gray-400">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 relative group/profile">

                {/* Cover Image */}
                <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white rounded-xl p-2.5 hover:bg-white/40 transition-all shadow-lg active:scale-95 z-20"
                    >
                        <Edit3 size={20} />
                    </button>
                </div>

                <div className="px-4 sm:px-10 pb-8 relative">
                    {/* Profile Pic - Positioned half-on/half-off the banner */}
                    <div className="relative -mt-12 sm:-mt-16 inline-block">
                        <div className="border-4 sm:border-[6px] border-white rounded-3xl shadow-2xl bg-white overflow-hidden w-24 h-24 sm:w-40 sm:h-40 group/pic">
                            {user.profilePic ? (
                                <img src={getMediaUrl(user.profilePic)} className="w-full h-full object-cover transition-transform duration-500 group-hover/pic:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-3xl sm:text-6xl text-white">
                                    {user.name?.[0]}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/pic:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setIsEditing(true)}>
                                <Camera size={20} className="text-white sm:w-6 sm:h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-6 flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6">
                        <div className="flex-1 space-y-1 sm:space-y-2">
                            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                            <p className="text-base sm:text-xl text-gray-600 font-medium leading-tight">{user.headline || 'Impactful Professional at JobSocial'}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1.5 sm:pt-2">
                                <p className="text-xs sm:text-sm text-gray-500 font-bold flex items-center gap-1.5 hover:text-blue-600 cursor-default transition-colors">
                                    <MapPin size={14} className="text-blue-500 sm:w-4 sm:h-4" /> Los Angeles Metropolitan Area
                                </p>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <span className="text-[11px] sm:text-sm text-blue-600 font-black cursor-pointer hover:underline uppercase tracking-widest">Contact info</span>
                            </div>
                            <div className="pt-3 flex items-center gap-2">
                                <div className="flex -space-x-3 overflow-hidden">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                            <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-600 font-bold text-[10px]">{i}</div>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs font-black text-blue-600 hover:underline cursor-pointer transition-colors px-1 uppercase tracking-tighter">
                                    {user.connections?.length || 0} Professional Connections
                                </span>
                            </div>
                        </div>

                        {/* <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <button className="flex-1 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">Open to work</button>
                            <button className="flex-1 border-2 border-blue-600 text-blue-600 px-8 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95">Add section</button>
                            <button className="flex items-center justify-center border-2 border-gray-200 text-gray-500 px-4 py-2.5 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-95">More</button>
                        </div> */}
                    </div>

                    {/* About */}
                    <div className="mt-12 group/about">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">About</h3>
                            <button onClick={() => setIsEditing(true)} className="p-2 opacity-0 group-hover/about:opacity-100 transition-opacity text-gray-400 hover:text-blue-600">
                                <Edit3 size={18} />
                            </button>
                        </div>
                        <div className="bg-gray-50/50 border border-gray-100 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                            <p className="text-gray-700 leading-relaxed text-[15px] font-medium whitespace-pre-wrap">
                                {user.bio || "Craft a compelling summary to tell your professional story and highlight your unique contributions."}
                            </p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-12">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-5">Top Skills</h3>
                        <div className="flex flex-wrap gap-3">
                            {(user.skills && user.skills.length > 0 ? user.skills : []).map((skill, i) => (
                                <span key={i} className="px-6 py-3 bg-white border border-gray-200 text-gray-800 font-black rounded-2xl text-[13px] uppercase tracking-wide hover:border-blue-500 hover:text-blue-600 cursor-pointer shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                                    {skill}
                                </span>
                            ))}
                            {(!user.skills || user.skills.length === 0) && (
                                <button onClick={() => setIsEditing(true)} className="px-6 py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold text-sm w-full hover:border-blue-400 hover:text-blue-500 transition-all">
                                    + Add your core professional skills
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Activity</h3>
                <button className="text-blue-600 text-sm font-black uppercase tracking-widest hover:underline">See all posts</button>
            </div>
            {posts.length > 0 ? (
                <div className="space-y-6">
                    {posts.map(post => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mb-10 overflow-hidden relative group/no-activity">
                    <div className="absolute inset-0 bg-blue-50/10 opacity-0 group-hover/no-activity:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover/no-activity:scale-110 transition-transform">
                            <Edit3 size={40} className="text-gray-200" />
                        </div>
                        <p className="font-black text-gray-900 text-lg tracking-tight mb-2">Build Your Professional Narrative</p>
                        <p className="text-sm font-medium text-gray-500 max-w-xs leading-relaxed mb-8">Share your insights, achievements, or career updates to engage with your network.</p>
                        <Link to="/" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Create First Post</Link>
                    </div>
                </div>
            )}

            {/* Edit Modal - Z-Index 60 to appear above Navbar (Z-50) */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold">Edit Profile</h2>
                            <button onClick={() => setIsEditing(false)} className="rounded-full p-2 hover:bg-gray-100"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-6">

                            {/* Image Upload */}
                            <div className="flex justify-center pb-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden relative">
                                        {profilePicFile ? (
                                            <img src={URL.createObjectURL(profilePicFile)} className="w-full h-full object-cover" />
                                        ) : user.profilePic ? (
                                            <img src={getMediaUrl(user.profilePic)} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">{user.name?.[0]}</div>
                                        )}
                                        <label
                                            htmlFor="profile-upload"
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <Camera size={24} />
                                        </label>
                                    </div>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        accept="image/*"
                                        onChange={e => setProfilePicFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                    <p className="text-center text-xs text-gray-500 mt-2 font-semibold">Click photo to change profile picture</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Headline</label>
                                <input
                                    type="text"
                                    value={editForm.headline}
                                    onChange={e => setEditForm({ ...editForm, headline: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Bio / Summary</label>
                                <textarea
                                    rows={4}
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Skills (comma separated)</label>
                                <input
                                    type="text"
                                    value={editForm.skills}
                                    onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. React, Node.js, Design"
                                />
                            </div>
                            <div className="flex justify-end pt-4 border-t">
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-lg">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
