import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload as UploadIcon, File, X, Check, Edit2, Save } from 'lucide-react'
import { documentService } from '../services/documentService'
import { ocrService } from '../services/ocrService'
import { blockchainService } from '../services/blockchainService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Upload = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState(1) // 1: upload, 2: preview/edit, 3: confirm
  const [uploading, setUploading] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [editedText, setEditedText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [metadata, setMetadata] = useState({
    title: '',
    documentType: 'prescription',
    patientName: '',
    patientAge: '',
    patientGender: '',
    doctorName: '',
    hospitalName: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)

      // Start OCR processing
      processOCR(selectedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const processOCR = async (file) => {
    setUploading(true)
    try {
      const result = await ocrService.extractText(file)
      setOcrText(result.text || '')
      setEditedText(result.text || '')

      // Auto-fill metadata if possible
      if (result.metadata) {
        setMetadata(prev => ({
          ...prev,
          ...result.metadata
        }))
      }

      setStep(2)
      toast.success('OCR completed successfully!')
    } catch (error) {
      console.error('OCR failed:', error)
      toast.error('OCR processing failed. You can still upload the file.')
      setStep(2)
    } finally {
      setUploading(false)
    }
  }

  const handleMetadataChange = (e) => {
    setMetadata({
      ...metadata,
      [e.target.name]: e.target.value
    })
  }

  const handleTextEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    toast.success('Changes saved')
  }

  const handleConfirm = async () => {
    setUploading(true)
    try {
      // Upload document
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify(metadata))
      formData.append('ocrText', editedText)

      const uploadResult = await documentService.uploadDocument(
        formData,
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log('Upload progress:', percentCompleted)
        }
      )

      // Hash and register on blockchain
      try {
        await blockchainService.registerOnChain({ documentId: uploadResult.document._id })
        toast.success('Document uploaded and verified on blockchain!')
      } catch (blockchainError) {
        console.error('Blockchain verification failed:', blockchainError)
        toast.success('Document uploaded (blockchain verification pending)')
      }

      navigate('/dashboard')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setStep(1)
    setOcrText('')
    setEditedText('')
    setMetadata({
      title: '',
      documentType: 'prescription',
      patientName: '',
      patientAge: '',
      patientGender: '',
      doctorName: '',
      hospitalName: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }



  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
          Upload Medical Document
          <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse-slow shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
        </h1>
        <p className="text-text-muted mt-1">Upload and digitize your medical records with OCR</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-500
                ${step >= num ? 'bg-primary-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'bg-surfaceHover text-text-muted border border-border'}
              `}>
                {step > num ? <Check className="h-5 w-5" /> : num}
              </div>
              {num < 3 && (
                <div className={`w-24 h-1 mx-2 transition-all duration-500 ${step > num ? 'bg-primary-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-border'}`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm max-w-[300px] mx-auto">
          <span className={step >= 1 ? 'text-primary-400 font-medium' : 'text-text-muted'}>Upload</span>
          <span className={step >= 2 ? 'text-primary-400 font-medium' : 'text-text-muted'}>Preview & Edit</span>
          <span className={step >= 3 ? 'text-primary-400 font-medium' : 'text-text-muted'}>Confirm</span>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card animate-slide-up">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group
              ${isDragActive ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_30px_rgba(20,184,166,0.15)] scale-[1.02]' : 'border-border hover:border-primary-500/50 hover:bg-surfaceHover/50'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <input {...getInputProps()} />
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-surfaceHover p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <UploadIcon className="h-10 w-10 text-primary-400 group-hover:text-primary-300 transition-colors" />
              </div>
              <p className="text-lg font-medium text-text-main mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag & drop your document'}
              </p>
              <p className="text-sm text-text-muted mb-4">
                or click to browse
              </p>
              <p className="text-xs text-text-muted">
                Supported formats: PNG, JPG, PDF (Max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Edit */}
      {step === 2 && !uploading && (
        <div className="space-y-6 animate-slide-up">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 text-text-main flex items-center gap-2">
              <File className="h-5 w-5 text-primary-500" />
              Document Preview
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-text-main mb-3">File Preview</label>
                {preview && (
                  file?.type.includes('image') ? (
                    <div className="relative rounded-xl overflow-hidden border border-border shadow-[0_0_20px_rgba(0,0,0,0.5)] group">
                      <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <img src={preview} alt="Document" className="w-full transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl p-8 text-center bg-surfaceHover/50 transition-all hover:bg-surfaceHover">
                      <File className="h-16 w-16 text-primary-400 mx-auto mb-4 animate-float" />
                      <p className="text-sm text-text-main font-medium">{file?.name}</p>
                    </div>
                  )
                )}
              </div>

              {/* OCR Text */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-text-main">Extracted Text</label>
                  {!isEditing ? (
                    <button onClick={handleTextEdit} className="text-sm text-primary-400 hover:text-primary-300 flex items-center transition-colors bg-primary-500/10 px-3 py-1.5 rounded-lg border border-primary-500/20 hover:border-primary-500/50 hover:shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      Edit Text
                    </button>
                  ) : (
                    <button onClick={handleSaveEdit} className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <Save className="h-4 w-4 mr-1.5" />
                      Save Extract
                    </button>
                  )}
                </div>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  disabled={!isEditing}
                  className={`flex-1 w-full min-h-[300px] p-5 rounded-xl transition-all duration-300 ${isEditing ? 'border border-primary-500/50 bg-surface shadow-[0_0_15px_rgba(20,184,166,0.1)] text-text-main focus:ring-2 focus:ring-primary-500 outline-none' : 'border border-border bg-surfaceHover text-text-muted resize-none scrollbar-thin scrollbar-thumb-border'}`}
                  placeholder="No text extracted..."
                />
              </div>
            </div>
          </div>

          {/* Metadata Form */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Document Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={metadata.title}
                  onChange={handleMetadataChange}
                  className="input-field"
                  placeholder="e.g., Blood Test Results"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Document Type</label>
                <select
                  name="documentType"
                  value={metadata.documentType}
                  onChange={handleMetadataChange}
                  className="input-field"
                >
                  <option value="prescription">Prescription</option>
                  <option value="lab-report">Lab Report</option>
                  <option value="xray">X-Ray</option>
                  <option value="mri">MRI</option>
                  <option value="ct-scan">CT Scan</option>
                  <option value="doctor-note">Doctor's Note</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Doctor Name</label>
                <input
                  type="text"
                  name="doctorName"
                  value={metadata.doctorName}
                  onChange={handleMetadataChange}
                  className="input-field"
                  placeholder="Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Hospital/Clinic</label>
                <input
                  type="text"
                  name="hospitalName"
                  value={metadata.hospitalName}
                  onChange={handleMetadataChange}
                  className="input-field"
                  placeholder="General Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={metadata.date}
                  onChange={handleMetadataChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main mb-2">Diagnosis / Disease</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={metadata.diagnosis || ''}
                  onChange={handleMetadataChange}
                  className="input-field"
                  placeholder="e.g., Type 2 Diabetes"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main mb-2">Medicines (comma separated)</label>
                <textarea
                  name="medicines"
                  value={Array.isArray(metadata.medicines) ? metadata.medicines.join(', ') : (metadata.medicines || '')}
                  onChange={(e) => setMetadata({ ...metadata, medicines: e.target.value.split(',').map(s => s.trim()) })}
                  className="input-field"
                  rows="2"
                  placeholder="e.g., Metformin 500mg, Atorvastatin 10mg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main mb-2">Symptoms (comma separated)</label>
                <textarea
                  name="symptoms"
                  value={Array.isArray(metadata.symptoms) ? metadata.symptoms.join(', ') : (metadata.symptoms || '')}
                  onChange={(e) => setMetadata({ ...metadata, symptoms: e.target.value.split(',').map(s => s.trim()) })}
                  className="input-field"
                  rows="2"
                  placeholder="e.g., Fatigue, Thirst"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main mb-2">Tests (comma separated)</label>
                <textarea
                  name="tests"
                  value={Array.isArray(metadata.tests) ? metadata.tests.join(', ') : (metadata.tests || '')}
                  onChange={(e) => setMetadata({ ...metadata, tests: e.target.value.split(',').map(s => s.trim()) })}
                  className="input-field"
                  rows="2"
                  placeholder="e.g., HbA1c, Lipid Profile"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={metadata.notes}
                  onChange={handleMetadataChange}
                  className="input-field"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button onClick={handleReset} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleConfirm} className="btn-primary">
              Upload & Verify on Blockchain
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="card text-center py-16 animate-pulse-slow">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            </div>
          </div>
          <p className="text-text-main font-medium text-lg">Processing your document...</p>
          <p className="text-sm text-primary-400 mt-2">AI is evaluating the content. This may take a few moments.</p>
        </div>
      )}
    </div>
  )
}

export default Upload
