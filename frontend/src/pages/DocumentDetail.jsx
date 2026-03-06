import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { documentService } from '../services/documentService'
import LoadingSpinner from '../components/LoadingSpinner'
import { FileText, Shield, User, File, Clock, Download, ArrowLeft, Activity } from 'lucide-react'

const DocumentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDocument()
  }, [id])

  const fetchDocument = async () => {
    try {
      const result = await documentService.getDocument(id)
      setDocument(result.document || result)
    } catch (err) {
      console.error('Failed to fetch document:', err)
      setError('Failed to load document details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner size="large" />
  
  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-text-muted text-lg">{error || 'Document not found'}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go Back</button>
      </div>
    )
  }

  const fileUrl = document.fileUrl || (document.filePath ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/${document.filePath.replace(/\\/g, '/')}` : null)

  const isImage = document.mimeType?.includes('image') || document.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)
  const isPdf = document.mimeType?.includes('pdf') || document.fileName?.match(/\.pdf$/i)

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-surfaceHover rounded-xl border border-border hover:bg-surface transition-colors">
            <ArrowLeft className="h-5 w-5 text-text-muted" />
          </button>
          <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
            {document.title || 'Untitled Document'}
            {document.blockchainVerified && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Shield className="h-4 w-4 mr-1" />
                Verified
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* File Preview Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-main flex items-center gap-2">
                <File className="h-5 w-5 text-primary-500" />
                Document File
              </h2>
              {fileUrl && (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2">
                  <Download className="h-4 w-4" /> Download
                </a>
              )}
            </div>
            
            <div className="bg-surface/50 border border-border rounded-xl min-h-[400px] flex items-center justify-center p-4">
              {fileUrl ? (
                isImage ? (
                  <img src={fileUrl} alt={document.title} className="max-w-full max-h-[800px] rounded-lg shadow-lg object-contain" />
                ) : isPdf ? (
                  <iframe src={fileUrl} className="w-full h-[600px] rounded-lg bg-white" title={document.title} />
                ) : (
                  <div className="text-center text-text-muted">
                    <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>File preview not available for this format</p>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline mt-2 inline-block">Click here to open</a>
                  </div>
                )
              ) : (
                <div className="text-center text-text-muted">
                  <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No file viewing link available</p>
                </div>
              )}
            </div>
          </div>

          {/* OCR text */}
          {document.ocrText && (
            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-500" />
                Extracted Text (OCR)
              </h2>
              <div className="bg-surface/50 border border-border rounded-xl p-4 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-sm text-text-muted">
                {document.ocrText}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Metadata Card */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-500" />
              Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-text-muted mb-1">Document Type</span>
                <span className="font-medium text-text-main flex items-center gap-2">
                  <span className="capitalize">{document.documentType}</span>
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-text-muted mb-1">Date</span>
                <span className="font-medium text-text-main flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-muted" />
                  {document.date ? new Date(document.date).toLocaleDateString() : new Date(document.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {(document.doctorName || document.hospitalName) && (
                <>
                  <div className="h-px bg-border my-2"></div>
                  {document.doctorName && (
                    <div className="flex flex-col">
                      <span className="text-sm text-text-muted mb-1">Doctor</span>
                      <span className="font-medium text-text-main">Dr. {document.doctorName}</span>
                    </div>
                  )}
                  {document.hospitalName && (
                    <div className="flex flex-col">
                      <span className="text-sm text-text-muted mb-1">Hospital/Clinic</span>
                      <span className="font-medium text-text-main">{document.hospitalName}</span>
                    </div>
                  )}
                </>
              )}

              {(document.patientName) && (
                <>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex flex-col">
                    <span className="text-sm text-text-muted mb-1">Patient</span>
                    <span className="font-medium text-text-main flex items-center gap-2">
                      <User className="h-4 w-4 text-text-muted" />
                      {document.patientName} {document.patientAge ? `(${document.patientAge} ${document.patientGender || ''})` : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Medical Info */}
          {(document.diagnosis || document.medicines?.length > 0 || document.symptoms?.length > 0 || document.tests?.length > 0) && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Medical Info
              </h2>
              <div className="space-y-4">
                {document.diagnosis && (
                  <div>
                    <span className="text-sm text-text-muted block mb-1">Diagnosis</span>
                    <span className="font-medium text-text-main bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md text-emerald-400 inline-block">{document.diagnosis}</span>
                  </div>
                )}
                {document.symptoms?.length > 0 && (
                  <div>
                    <span className="text-sm text-text-muted block mb-1">Symptoms</span>
                    <div className="flex flex-wrap gap-2">
                      {document.symptoms.map((s, i) => (
                        <span key={i} className="text-sm bg-surfaceHover border border-border px-2 py-1 rounded text-text-main">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {document.medicines?.length > 0 && (
                  <div>
                    <span className="text-sm text-text-muted block mb-1">Medicines</span>
                    <div className="flex flex-wrap gap-2">
                      {document.medicines.map((m, i) => (
                        <span key={i} className="text-sm bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded text-blue-400">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
                {document.tests?.length > 0 && (
                  <div>
                    <span className="text-sm text-text-muted block mb-1">Tests</span>
                    <div className="flex flex-wrap gap-2">
                      {document.tests.map((t, i) => (
                        <span key={i} className="text-sm bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded text-purple-400">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blockchain Info */}
          {document.blockchainHash && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Blockchain Proof
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-text-muted mb-1">Document Hash</span>
                  <span className="font-mono text-xs p-2 bg-surfaceHover rounded border border-border break-all text-text-main max-w-full">
                    {document.blockchainHash}
                  </span>
                </div>
                {document.blockchainTxHash && (
                  <div className="flex flex-col">
                    <span className="text-sm text-text-muted mb-1">Transaction</span>
                    <span className="font-mono text-xs p-2 bg-surfaceHover rounded border border-border break-all text-purple-400 max-w-full">
                      {document.blockchainTxHash}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentDetail
