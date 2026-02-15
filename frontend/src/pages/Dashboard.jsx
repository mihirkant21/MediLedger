import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Upload, Clock, Shield, TrendingUp, Calendar } from 'lucide-react'
import { documentService } from '../services/documentService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    recentUploads: 0,
    verifiedDocuments: 0,
    pendingOCR: 0
  })
  const [recentDocuments, setRecentDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const documents = await documentService.getAllDocuments({ limit: 5, sort: '-createdAt' })
      setRecentDocuments(documents.documents || [])
      
      // Calculate stats
      setStats({
        totalDocuments: documents.total || 0,
        recentUploads: documents.documents?.filter(d => {
          const uploadDate = new Date(d.createdAt)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return uploadDate > weekAgo
        }).length || 0,
        verifiedDocuments: documents.documents?.filter(d => d.blockchainVerified).length || 0,
        pendingOCR: documents.documents?.filter(d => d.ocrStatus === 'pending').length || 0
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Recent Uploads',
      value: stats.recentUploads,
      icon: Upload,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Verified on Chain',
      value: stats.verifiedDocuments,
      icon: Shield,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending OCR',
      value: stats.pendingOCR,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your medical records.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 text-white ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/upload')}
          className="card hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Upload className="h-8 w-8 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Upload Document</h3>
              <p className="text-sm text-gray-600">Add new medical record</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/timeline')}
          className="card hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-4 rounded-lg group-hover:bg-green-200 transition-colors">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">View Timeline</h3>
              <p className="text-sm text-gray-600">See chronological history</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/verify')}
          className="card hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-4 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Verify Document</h3>
              <p className="text-sm text-gray-600">Check blockchain proof</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Documents */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
          <button
            onClick={() => navigate('/timeline')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </button>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No documents yet</p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary mt-4"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDocuments.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/document/${doc._id}`)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.title || 'Untitled Document'}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()} • {doc.documentType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.blockchainVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    doc.ocrStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                    doc.ocrStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.ocrStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
