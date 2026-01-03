import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import PostCard from '../components/PostCard'
import { MapPin, Edit3, X } from 'lucide-react'

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
            console.error(error)
        }
    }

    const [profilePicFile, setProfilePicFile] = useState(null)
    const [coverImageFile, setCoverImageFile] = useState(null)

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('name', editForm.name)
            formData.append('headline', editForm.headline)
            formData.append('bio', editForm.bio)
            formData.append('skills', editForm.skills.split(',').map(s => s.trim()).filter(s => s)) // Still send array? backend expects body to be json if not simple. 
            // Wait, multer fields handles files, body parser handles text. 
            // arrays in formData are tricky. Let's send skills as comma separated string or let backend handle it?
            // User controller typically uses req.body directly. 
            // Let's check backend controller: `const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })`
            // If we send `skills` as string, mongoose might complain if schema is array? 
            // No, mongoose casts if flexible. But schema defines `skills: [String]`.
            // Safer to loop and append.
            const skillsArray = editForm.skills.split(',').map(s => s.trim()).filter(s => s)
            skillsArray.forEach(skill => formData.append('skills[]', skill))
            // Actually, express body parser with multer might just see 'skills' as array if multiple appended, or we can send as string and split in backend? 
            // Backend Controller: `const updateData = { ...req.body }`. If req.body.skills is missing, it won't update.
            // Simplest: Send as JSON string if complex, but let's try standard append. 
            // Correction: `req.body` with multer will have text fields. 
            // If I append multiple 'skills', req.body.skills will be array.

            if (profilePicFile) formData.append('profilePic', profilePicFile)
            if (coverImageFile) formData.append('coverImage', coverImageFile)

            const res = await axios.put(`http://localhost:5000/api/users/${user._id || user.id}`, formData)
            setUser({ ...user, ...res.data }) // Update context
            setIsEditing(false)
            setProfilePicFile(null)
            setCoverImageFile(null)
        } catch (error) {
            console.error(error)
            alert('Failed to update profile')
        }
    }

    if (!user) return <div className="p-8 text-center text-gray-500">Loading profile...</div>

    return (
        <div>
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4 relative">

                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-700 to-blue-500 relative group">
                    {user.coverImage && (
                        <img src={`http://localhost:5000${user.coverImage}`} className="w-full h-full object-cover absolute inset-0" />
                    )}
                    {/* Profile Pic */}
                    <div className="absolute top-6 left-8 border-4 border-white rounded-full shadow-lg bg-white overflow-hidden">
                        {user.profilePic ? (
                            <img src={`http://localhost:5000${user.profilePic}`} className="w-32 h-32 object-cover" />
                        ) : (
                            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center font-bold text-4xl text-gray-500">
                                {user.name?.[0]}
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white rounded-full p-2 hover:bg-white/30 transition">
                        <Edit3 size={20} />
                    </button>
                    <div className="absolute bottom-4 right-4 text-white/80 text-xs font-semibold drop-shadow-md">
                        {user.coverImage ? 'Edit cover photo' : 'Add cover photo'}
                    </div>
                </div>

                <div className="px-8 pb-8 relative">

                    <div className="mt-24 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-lg text-gray-600 mt-1">{user.headline || 'Add a headline...'}</p>
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                <MapPin size={16} /> Los Angeles, CA <span className="mx-1 text-gray-300">|</span> <span className="text-blue-600 font-bold cursor-pointer hover:underline">Contact info</span>
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm">
                                <span className="hover:underline cursor-pointer">{user.connections?.length || 0} connections</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Open to</button>
                            <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition">More</button>
                        </div>
                    </div>

                    {/* About */}
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-3 text-gray-900">About</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {user.bio || "Write a summary to highlight your personality or work experience."}
                        </p>
                    </div>

                    {/* Skills */}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {(user.skills && user.skills.length > 0 ? user.skills : []).map((skill, i) => (
                                <span key={i} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full text-sm hover:bg-gray-50 cursor-pointer shadow-sm transition">
                                    {skill}
                                </span>
                            ))}
                            {(!user.skills || user.skills.length === 0) && <span className="text-gray-500 italic">No skills added yet.</span>}
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">Activity</h3>
            {posts.length > 0 ? (
                posts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
                <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow">No recent activity</div>
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

                            {/* Image Uploads */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 border overflow-hidden">
                                            {profilePicFile ? (
                                                <img src={URL.createObjectURL(profilePicFile)} className="w-full h-full object-cover" />
                                            ) : user.profilePic ? (
                                                <img src={`http://localhost:5000${user.profilePic}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{user.name?.[0]}</div>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={e => setProfilePicFile(e.target.files[0])} className="text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-12 rounded bg-gray-100 border overflow-hidden">
                                            {coverImageFile ? (
                                                <img src={URL.createObjectURL(coverImageFile)} className="w-full h-full object-cover" />
                                            ) : user.coverImage ? (
                                                <img src={`http://localhost:5000${user.coverImage}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Cover</div>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={e => setCoverImageFile(e.target.files[0])} className="text-sm" />
                                    </div>
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
