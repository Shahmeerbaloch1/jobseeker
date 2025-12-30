import { useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { Link } from 'react-router-dom'

export default function Sidebar() {
    const { user } = useContext(UserContext)
    if (!user) return null

    return (
        <div className="bg-white rounded-lg shadow p-4 h-fit sticky top-20">
            <div className="flex flex-col items-center border-b pb-4">
                {user.profilePic ? (
                    <img src={`http://localhost:5000${user.profilePic}`} alt="Profile" className="w-16 h-16 rounded-full object-cover mb-2" />
                ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-gray-500 text-2xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                )}
                <h3 className="font-bold text-lg">{user.name}</h3>
                <p className="text-gray-500 text-sm text-center">{user.headline || 'Add a headline'}</p>
            </div>
            <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Connections</span>
                    <span className="font-bold text-blue-600">{user.connections?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Profile Views</span>
                    <span className="font-bold text-blue-600">0</span>
                </div>
            </div>
            <div className="mt-4 border-t pt-4">
                <Link to="/my-items" className="flex items-center space-x-2 text-gray-600 hover:text-black font-semibold text-sm">
                    <span>🔖 My Items</span>
                </Link>
            </div>
        </div>
    )
}
