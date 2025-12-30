import { useState } from 'react'

export default function PostJob() {
    const [job, setJob] = useState({ title: '', company: '', location: '', description: '' })

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Post Job:', job)
    }

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Job Title</label>
                    <input
                        type="text"
                        value={job.title}
                        onChange={(e) => setJob({ ...job, title: e.target.value })}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Company Name</label>
                    <input
                        type="text"
                        value={job.company}
                        onChange={(e) => setJob({ ...job, company: e.target.value })}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Location</label>
                    <input
                        type="text"
                        value={job.location}
                        onChange={(e) => setJob({ ...job, location: e.target.value })}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">Description</label>
                    <textarea
                        value={job.description}
                        onChange={(e) => setJob({ ...job, description: e.target.value })}
                        className="w-full border p-2 rounded h-32"
                        required
                    ></textarea>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                    Post Job
                </button>
            </form>
        </div>
    )
}
