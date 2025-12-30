export default function JobCard({ job }) {
    return (
        <div className="bg-white shadow p-5 rounded hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
            <p className="text-gray-600 font-medium">{job.company}</p>
            <p className="text-sm text-gray-500 mt-1">{job.location}</p>
            <p className="text-gray-700 mt-3 line-clamp-2">{job.description}</p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                Apply
            </button>
        </div>
    )
}
