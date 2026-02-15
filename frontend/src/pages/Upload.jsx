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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Medical Document</h1>
        <p className="text-gray-600 mt-1">Upload and digitize your medical records with OCR</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full font-semibold
                ${step >= num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {step > num ? <Check className="h-5 w-5" /> : num}
              </div>
              {num < 3 && (
                <div className={`w-24 h-1 mx-2 ${step > num ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Upload</span>
          <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Preview & Edit</span>
          <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Confirm</span>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
            `}
          >
            <input {...getInputProps()} />
            <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop your document'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: PNG, JPG, PDF (Max 10MB)
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Edit */}
      {step === 2 && !uploading && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Document Preview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Preview</label>
                {preview && (
                  file?.type.includes('image') ? (
                    <img src={preview} alt="Document" className="rounded-lg border border-gray-200 w-full" />
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-8 text-center">
                      <File className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{file?.name}</p>
                    </div>
                  )
                )}
              </div>

              {/* OCR Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Extracted Text</label>
                  {!isEditing ? (
                    <button onClick={handleTextEdit} className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  ) : (
                    <button onClick={handleSaveEdit} className="text-sm text-green-600 hover:text-green-700 flex items-center">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                  )}
                </div>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full h-64 p-4 border rounded-lg ${isEditing ? 'border-primary-500 bg-white' : 'border-gray-200 bg-gray-50'}`}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital/Clinic</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={metadata.date}
                  onChange={handleMetadataChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis / Disease</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicines (comma separated)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (comma separated)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tests (comma separated)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
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
        <div className="card text-center py-12">
          <LoadingSpinner size="large" className="mb-4" />
          <p className="text-gray-600">Processing your document...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}
    </div>
  )
}

export default Upload
