import { useState, useEffect } from 'react'
import axios from 'axios'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'

export default function Feed() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/posts')
            setPosts(res.data)
            setLoading(false)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts])
    }

    return (
        <div className="max-w-xl mx-auto">
            <CreatePost onPostCreated={handlePostCreated} />

            {loading ? (
                <div className="text-center py-4">Loading feed...</div>
            ) : (
                posts.map(post => (
                    <PostCard key={post._id} post={post} />
                ))
            )}
        </div>
    )
}
