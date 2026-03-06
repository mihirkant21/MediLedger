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
      const params = {}
      if (filter !== 'all') {
        params.documentType = filter
      }
      const result = await documentService.getTimeline(params)
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
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${filter === type
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
      <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {Object.entries(groupedDocuments).map(([date, docs]) => (
          <div key={date} className="relative">
            <div className="flex items-center mb-6 pl-2">
              <Calendar className="h-6 w-6 text-primary-500 mr-3 animate-pulse-slow" />
              <h2 className="text-xl font-semibold text-text-main bg-background pr-4">{date}</h2>
              <div className="absolute left-10 mt-6 bottom-0 w-[2px] bg-gradient-to-b from-primary-500/50 to-transparent -z-10"></div>
            </div>

            <div className="space-y-6">
              {docs.map((doc, index) => (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/document/${doc._id}`)}
                  className="timeline-item cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                >
                  <div className="card hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary-500/0 before:to-primary-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 relative z-10">
                        <div className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-500 group-hover:border-primary-500/50">
                          <FileText className="h-6 w-6 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-text-main group-hover:text-primary-400 transition-colors">{doc.title || 'Untitled'}</h3>
                          <div className="inline-block px-2 py-1 mt-1 rounded-md bg-surfaceHover border border-border text-xs text-primary-300">
                            {doc.documentType}
                          </div>
                          {doc.doctorName && (
                            <p className="text-sm text-text-muted mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-primary-500"></span>
                              Dr. {doc.doctorName}
                            </p>
                          )}
                          {doc.ocrText && (
                            <p className="text-sm text-text-muted mt-3 line-clamp-2 bg-background p-2 rounded-lg border border-border/50">{doc.ocrText}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start space-y-0 sm:space-y-2 relative z-10 w-full sm:w-auto">
                        {doc.blockchainVerified && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                        <span className="text-sm text-text-muted font-medium bg-surfaceHover px-2 py-1 rounded border border-border">
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
        <div className="card text-center py-16 animate-fade-in">
          <Clock className="h-16 w-16 text-text-muted mx-auto mb-6 animate-float" />
          <p className="text-text-muted text-lg">No documents found matching your criteria</p>
        </div>
      )}
    </div>
  )
}

export default Timeline
