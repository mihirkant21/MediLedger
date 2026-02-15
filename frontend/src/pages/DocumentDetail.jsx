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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">{document?.title}</h1>
      {/* Add full document view here */}
    </div>
  )
}

export default DocumentDetail
