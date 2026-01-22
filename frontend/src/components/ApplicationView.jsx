import { FileText } from 'lucide-react'

export default function ApplicationView({ applicantDetails, resume, resumeUrl, coverLetter, responses }) {
    // Determine resume source for preview
    const getResumePreviewUrl = () => {
        if (resume && typeof resume !== 'string') {
            return URL.createObjectURL(resume)
        }
        if (resumeUrl) {
            return resumeUrl.startsWith('http') ? resumeUrl : `http://localhost:5000${resumeUrl}`
        }
        return null
    }

    const previewUrl = getResumePreviewUrl()

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Application Review</h3>

            <div className="space-y-6">
                {/* Resume Preview */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText size={18} /> Resume Preview
                    </h4>
                    {previewUrl ? (
                        <div className="aspect-[4/5] w-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 relative group">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full"
                                title="Resume Preview"
                            />
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm italic">No resume available for preview.</div>
                    )}
                </div>

                {/* Details Review */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <h4 className="font-bold text-gray-700 mb-2">Contact Info</h4>
                        <p className="text-sm font-medium">{applicantDetails.name}</p>
                        <p className="text-sm text-gray-500">{applicantDetails.email}</p>
                        <p className="text-sm text-gray-500">{applicantDetails.phone}</p>
                    </div>

                    {coverLetter && (
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 md:col-span-2">
                            <h4 className="font-bold text-gray-700 mb-2">Cover Letter</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{coverLetter}</p>
                        </div>
                    )}

                    {responses && ((Array.isArray(responses) && responses.length > 0) || (typeof responses === 'object' && Object.keys(responses).length > 0)) && (
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 md:col-span-2">
                            <h4 className="font-bold text-gray-700 mb-2">Screening Answers</h4>
                            <div className="space-y-2">
                                {Array.isArray(responses) ? (
                                    responses.map((resp, i) => (
                                        <div key={i}>
                                            <p className="text-xs text-gray-500 font-semibold">{resp.questionText}</p>
                                            <p className="text-sm font-bold text-blue-600">{resp.answer}</p>
                                        </div>
                                    ))
                                ) : (
                                    Object.entries(responses).map(([q, a], i) => (
                                        <div key={i}>
                                            <p className="text-xs text-gray-500 font-semibold">{q}</p>
                                            <p className="text-sm font-bold text-blue-600">{a}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
