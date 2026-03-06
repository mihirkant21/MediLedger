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
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border border-blue-500/20'
    },
    {
      title: 'Recent Uploads',
      value: stats.recentUploads,
      icon: Upload,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border border-emerald-500/20'
    },
    {
      title: 'Verified on Chain',
      value: stats.verifiedDocuments,
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border border-purple-500/20'
    },
    {
      title: 'Pending OCR',
      value: stats.pendingOCR,
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border border-orange-500/20'
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
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
          Dashboard
          <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse-slow shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
        </h1>
        <p className="text-text-muted mt-1">Welcome back! Here's an overview of your medical records.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-text-muted">{stat.title}</p>
                <p className="text-3xl font-bold text-text-main mt-2 group-hover:text-primary-400 transition-colors">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={() => navigate('/upload')}
          className="card group hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl group-hover:bg-primary-500/20 group-hover:border-primary-500/50 transition-all duration-300 group-hover:scale-110">
              <Upload className="h-8 w-8 text-primary-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-text-main group-hover:text-primary-400 transition-colors">Upload Document</h3>
              <p className="text-sm text-text-muted">Add new medical record</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/timeline')}
          className="card group hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-300 group-hover:scale-110">
              <Calendar className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-text-main group-hover:text-emerald-400 transition-colors">View Timeline</h3>
              <p className="text-sm text-text-muted">See chronological history</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/verify')}
          className="card group hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl group-hover:bg-purple-500/20 group-hover:border-purple-500/50 transition-all duration-300 group-hover:scale-110">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-text-main group-hover:text-purple-400 transition-colors">Verify Document</h3>
              <p className="text-sm text-text-muted">Check blockchain proof</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Documents */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-main">Recent Documents</h2>
          <button
            onClick={() => navigate('/timeline')}
            className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            View All →
          </button>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-text-muted mx-auto mb-4 animate-float" />
            <p className="text-text-muted">No documents yet</p>
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
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border bg-surfaceHover/30 rounded-xl hover:bg-surfaceHover cursor-pointer transition-all duration-300 hover:border-primary-500/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)] gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-500/10 border border-primary-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 group-hover:border-primary-500/50">
                    <FileText className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-main group-hover:text-primary-400 transition-colors">{doc.title || 'Untitled Document'}</h3>
                    <p className="text-sm text-text-muted">
                      {new Date(doc.createdAt).toLocaleDateString()} • {doc.documentType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.blockchainVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${doc.ocrStatus === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                      doc.ocrStatus === 'processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                        'bg-surfaceHover text-text-muted border-border'
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
