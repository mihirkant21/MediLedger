import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { documentService } from '../services/documentService'
import LoadingSpinner from '../components/LoadingSpinner'

const DocumentDetail = () => {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocument()
  }, [id])

  const fetchDocument = async () => {
    try {
      const doc = await documentService.getDocument(id)
      setDocument(doc)
    } catch (error) {
      console.error('Failed to fetch document:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-3xl font-bold text-text-main">{document?.title || 'Document Details'}</h1>
        <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse-slow shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
      </div>

      <div className="card min-h-[400px] flex items-center justify-center animate-slide-up bg-surface/80 backdrop-blur-xl border border-border" style={{ animationDelay: '0.1s' }}>
        <p className="text-text-muted text-lg flex flex-col items-center gap-4">
          <span className="p-4 bg-surfaceHover rounded-full border border-border shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <svg className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          No document content to display
        </p>
      </div>
    </div>
  )
}

export default DocumentDetail
