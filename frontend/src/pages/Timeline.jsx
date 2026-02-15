import { useState, useEffect } from 'react'
import { Calendar, FileText, Shield, Clock } from 'lucide-react'
import { documentService } from '../services/documentService'
import LoadingSpinner from '../components/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

const Timeline = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDocuments()
  }, [filter])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const result = await documentService.getTimeline({ documentType: filter !== 'all' ? filter : undefined })
      setDocuments(result.documents || [])
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupByDate = (docs) => {
    const grouped = {}
    docs.forEach(doc => {
      const date = new Date(doc.date || doc.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(doc)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const groupedDocuments = groupByDate(documents)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medical Timeline</h1>
        <p className="text-gray-600 mt-1">Chronological view of your medical history</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4 overflow-x-auto">
          {['all', 'prescription', 'lab-report', 'xray', 'mri', 'doctor-note'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filter === type 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedDocuments).map(([date, docs]) => (
          <div key={date}>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">{date}</h2>
            </div>
            
            <div className="space-y-4">
              {docs.map(doc => (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/document/${doc._id}`)}
                  className="timeline-item cursor-pointer"
                >
                  <div className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doc.title || 'Untitled'}</h3>
                          <p className="text-sm text-gray-600 mt-1">{doc.documentType}</p>
                          {doc.doctorName && (
                            <p className="text-sm text-gray-500 mt-1">Dr. {doc.doctorName}</p>
                          )}
                          {doc.ocrText && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{doc.ocrText}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {doc.blockchainVerified && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(doc.date || doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="card text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents found</p>
        </div>
      )}
    </div>
  )
}

export default Timeline
