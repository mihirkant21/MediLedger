import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { documentService } from '../services/documentService'
import LoadingSpinner from '../components/LoadingSpinner'
import { FileText, Shield, User, File, Clock, Download, ArrowLeft, Activity, Trash2, Edit2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

const DocumentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

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

  const handleDownload = async (fileIndex = null) => {
    try {
      toast.loading('Preparing download...', { id: 'download-toast' })
      const res = await documentService.getDownloadUrl(document._id, fileIndex)
      if (res.downloadUrl) {
        toast.success('Download started', { id: 'download-toast' })
        const link = window.document.createElement('a')
        link.href = res.downloadUrl
        
        let targetFileName = document.fileName || 'document'
        if (fileIndex !== null && document.files && document.files[fileIndex]) {
          targetFileName = document.files[fileIndex].fileName || targetFileName
        }
        
        link.setAttribute('download', targetFileName)
        link.style.display = 'none'
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
      } else {
        throw new Error('No download URL returned')
      }
    } catch (err) {
      console.error('Download failed:', err)
      toast.error('Failed to start download', { id: 'download-toast' })
      // Fallback
      if (fileIndex !== null && document.files && document.files[fileIndex]) {
        window.open(document.files[fileIndex].fileUrl, '_blank')
      } else if (document.fileUrl) {
        window.open(document.fileUrl, '_blank')
      }
    }
  }

  const startEditing = () => {
    setEditForm({
      title: document.title || '',
      documentType: document.documentType || 'other',
      date: document.date || document.createdAt || new Date().toISOString(),
      doctorName: document.doctorName || '',
      hospitalName: document.hospitalName || '',
      patientName: document.patientName || '',
      patientAge: document.patientAge || '',
      patientGender: document.patientGender || '',
      diagnosis: document.diagnosis || '',
      medicines: document.medicines?.join(', ') || '',
      symptoms: document.symptoms?.join(', ') || '',
      tests: document.tests?.join(', ') || '',
      notes: document.notes || ''
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    setLoading(true)
    try {
      const payload = { ...editForm }
      payload.medicines = payload.medicines ? payload.medicines.split(',').map(s => s.trim()).filter(Boolean) : []
      payload.symptoms = payload.symptoms ? payload.symptoms.split(',').map(s => s.trim()).filter(Boolean) : []
      payload.tests = payload.tests ? payload.tests.split(',').map(s => s.trim()).filter(Boolean) : []
      if (payload.date) payload.date = payload.date.split('T')[0]

      const result = await documentService.updateDocument(document._id, payload)
      setDocument(result.data || result.document || document)
      setIsEditing(false)
      toast.success('Document updated successfully!')
    } catch (err) {
      console.error('Failed to update document:', err)
      toast.error('Failed to update document')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      setLoading(true)
      try {
        await documentService.deleteDocument(document._id)
        toast.success('Document deleted successfully')
        navigate('/dashboard')
      } catch (err) {
        console.error('Failed to delete document:', err)
        toast.error('Failed to delete document')
        setLoading(false)
      }
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
          {isEditing ? (
             <input type="text" name="title" value={editForm.title} onChange={handleFormChange} className="input-field text-xl font-bold max-w-sm" placeholder="Document Title" />
          ) : (
            <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
              {document.title || 'Untitled Document'}
              {document.blockchainVerified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Shield className="h-4 w-4 mr-1" />
                  Verified
                </span>
              )}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-surfaceHover text-text-muted rounded-xl border border-border hover:bg-surface transition-colors flex items-center gap-2">
                <X className="h-5 w-5" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button onClick={handleSaveEdit} className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <Save className="h-5 w-5" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={startEditing} className="p-2 bg-surfaceHover text-primary-400 rounded-xl border border-border hover:bg-surface transition-colors flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button onClick={handleDelete} className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Files List Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-main flex items-center gap-2">
                <File className="h-5 w-5 text-primary-500" />
                Attached Files
              </h2>
              {fileUrl && (!document.files || document.files.length === 0) && (
                <button onClick={handleDownload} className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2 transition-transform hover:scale-105">
                  <Download className="h-4 w-4" /> Download
                </button>
              )}
            </div>
            
            <div className="grid gap-4">
              {(document.files && document.files.length > 0) ? (
                // Multi-file layout
                document.files.map((fileObj, index) => {
                  const url = fileObj.fileUrl || (fileObj.filePath ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/${fileObj.filePath.replace(/\\/g, '/')}` : null)
                  const isImg = fileObj.mimeType?.includes('image') || fileObj.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)
                  const isPdfFile = fileObj.mimeType?.includes('pdf') || fileObj.fileName?.match(/\.pdf$/i)

                  return (
                    <div key={index} className="bg-surfaceHover border border-border rounded-xl p-4 flex flex-col gap-4">
                      <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-border">
                         <div className="flex flex-col flex-1 truncate pr-4">
                           <span className="font-medium text-text-main text-sm truncate">{fileObj.fileName || `Attachment ${index + 1}`}</span>
                           <span className="text-xs text-primary-400 capitalize mt-0.5">{fileObj.documentType || 'Other'}</span>
                         </div>
                         <button onClick={() => handleDownload(index)} className="btn-secondary py-1 px-3 text-xs flex items-center gap-2 flex-shrink-0">
                            <Download className="h-3 w-3" /> Download
                         </button>
                      </div>
                      <div className="bg-surface shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] rounded-lg min-h-[300px] flex items-center justify-center p-2 overflow-hidden">
                        {isImg ? (
                          <img src={url} alt={fileObj.fileName} className="max-w-full max-h-[600px] object-contain rounded" />
                        ) : isPdfFile ? (
                          <iframe src={url} className="w-full h-[500px] bg-white rounded" title={fileObj.fileName} />
                        ) : (
                          <div className="text-center text-text-muted py-10">
                            <File className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Preview format unsupported</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                // Normal Single File Layout (Backwards compatibility)
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
                      <p>No attached files</p>
                    </div>
                  )}
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
                {isEditing ? (
                  <select name="documentType" value={editForm.documentType} onChange={handleFormChange} className="input-field text-sm">
                    <option value="prescription">Prescription</option>
                    <option value="lab-report">Lab Report</option>
                    <option value="xray">X-Ray</option>
                    <option value="mri">MRI</option>
                    <option value="ct-scan">CT Scan</option>
                    <option value="doctor-note">Doctor's Note</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <span className="font-medium text-text-main flex items-center gap-2">
                    <span className="capitalize">{document.documentType}</span>
                  </span>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-text-muted mb-1">Date</span>
                {isEditing ? (
                  <input type="date" name="date" value={editForm.date?.split('T')[0] || ''} onChange={handleFormChange} className="input-field text-sm" />
                ) : (
                  <span className="font-medium text-text-main flex items-center gap-2">
                    <Clock className="h-4 w-4 text-text-muted" />
                    {document.date ? new Date(document.date).toLocaleDateString() : new Date(document.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {(document.doctorName || document.hospitalName || isEditing) && (
                <>
                  <div className="h-px bg-border my-2"></div>
                  {(document.doctorName || isEditing) && (
                    <div className="flex flex-col">
                      <span className="text-sm text-text-muted mb-1">Doctor</span>
                      {isEditing ? (
                        <input type="text" name="doctorName" value={editForm.doctorName} onChange={handleFormChange} className="input-field text-sm" placeholder="Doctor Name" />
                      ) : (
                        <span className="font-medium text-text-main">Dr. {document.doctorName}</span>
                      )}
                    </div>
                  )}
                  {(document.hospitalName || isEditing) && (
                    <div className="flex flex-col">
                      <span className="text-sm text-text-muted mb-1">Hospital/Clinic</span>
                      {isEditing ? (
                        <input type="text" name="hospitalName" value={editForm.hospitalName} onChange={handleFormChange} className="input-field text-sm" placeholder="Hospital Name" />
                      ) : (
                        <span className="font-medium text-text-main">{document.hospitalName}</span>
                      )}
                    </div>
                  )}
                </>
              )}

              {(document.patientName || isEditing) && (
                <>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex flex-col">
                    <span className="text-sm text-text-muted mb-1">Patient Name</span>
                    {isEditing ? (
                       <input type="text" name="patientName" value={editForm.patientName} onChange={handleFormChange} className="input-field text-sm" placeholder="Patient Name" />
                    ) : (
                      <span className="font-medium text-text-main flex items-center gap-2">
                        <User className="h-4 w-4 text-text-muted" />
                        {document.patientName} {document.patientAge ? `(${document.patientAge} ${document.patientGender || ''})` : ''}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-text-muted mb-1">Age</span>
                        <input type="text" name="patientAge" value={editForm.patientAge} onChange={handleFormChange} className="input-field text-sm" placeholder="Age" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-text-muted mb-1">Gender</span>
                        <select name="patientGender" value={editForm.patientGender} onChange={handleFormChange} className="input-field text-sm">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Medical Info */}
          {(document.diagnosis || document.medicines?.length > 0 || document.symptoms?.length > 0 || document.tests?.length > 0 || isEditing) && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Medical Info
              </h2>
              <div className="space-y-4">
                {(document.diagnosis || isEditing) && (
                  <div>
                    <span className="text-sm text-text-muted block mb-1">Diagnosis</span>
                    {isEditing ? (
                       <input type="text" name="diagnosis" value={editForm.diagnosis} onChange={handleFormChange} className="input-field text-sm" placeholder="Diagnosis" />
                    ) : (
                      <span className="font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md text-emerald-500 inline-block">{document.diagnosis}</span>
                    )}
                  </div>
                )}
                {(document.symptoms?.length > 0 || isEditing) && (
                  <div>
                    <span className="text-sm text-text-muted block mb-1">Symptoms (comma separated)</span>
                    {isEditing ? (
                       <input type="text" name="symptoms" value={editForm.symptoms} onChange={handleFormChange} className="input-field text-sm" placeholder="e.g. Fever, Cough" />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {document.symptoms.map((s, i) => (
                          <span key={i} className="text-sm bg-surfaceHover border border-border px-2 py-1 rounded text-text-main">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {(document.medicines?.length > 0 || isEditing) && (
                  <div>
                    <span className="text-sm text-text-muted block mb-1">Medicines (comma separated)</span>
                    {isEditing ? (
                       <input type="text" name="medicines" value={editForm.medicines} onChange={handleFormChange} className="input-field text-sm" placeholder="e.g. Paracetamol" />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {document.medicines.map((m, i) => (
                          <span key={i} className="text-sm bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded text-blue-400">{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {(document.tests?.length > 0 || isEditing) && (
                  <div>
                    <span className="text-sm text-text-muted block mb-1">Tests (comma separated)</span>
                    {isEditing ? (
                      <input type="text" name="tests" value={editForm.tests} onChange={handleFormChange} className="input-field text-sm" placeholder="e.g. Blood Test" />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {document.tests.map((t, i) => (
                          <span key={i} className="text-sm bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded text-purple-400">{t}</span>
                        ))}
                      </div>
                    )}
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
