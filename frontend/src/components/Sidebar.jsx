import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  Clock,
  Shield,
  X,
  FileText
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload Document' },
    { to: '/timeline', icon: Clock, label: 'Timeline' },
    { to: '/verify', icon: Shield, label: 'Verify Document' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-surface/95 backdrop-blur-xl border-r border-border shadow-[0_0_15px_rgba(0,0,0,0.5)]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full ">
          {/* Header */}
          <div className="relative flex items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-gradient"><span className="text-green-500">Medi</span>Ledger</h1>
            <button
              onClick={onClose}
              className="absolute right-4 lg:hidden p-2 rounded-md text-text-muted hover:text-text-main hover:bg-surfaceHover transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
                    ? 'bg-primary-500/20 text-primary-400 font-medium shadow-[0_0_10px_rgba(20,184,166,0.1)] border border-primary-500/20'
                    : 'text-text-muted hover:text-text-main hover:bg-surfaceHover'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="bg-surfaceHover border border-border rounded-lg p-4 relative overflow-hidden group hover:border-primary-500/50 transition-colors duration-300">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-primary-500/10 rounded-full blur-xl group-hover:bg-primary-500/20 transition-all"></div>
              <div className="flex items-center mb-2 relative z-10">
                <Shield className="h-5 w-5 text-primary-400 mr-2 group-hover:text-primary-300 transition-colors" />
                <h3 className="font-semibold text-sm text-text-main group-hover:text-primary-300 transition-colors">Blockchain Secured</h3>
              </div>
              <p className="text-xs text-text-muted relative z-10 transition-colors group-hover:text-text-main">
                All your medical records are encrypted and verified on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
