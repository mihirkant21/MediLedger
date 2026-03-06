import { Menu, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-40 transform transition-transform duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-text-muted hover:text-text-main hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="ml-4 lg:ml-0">
              {/* Title shifted to sidebar */}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surfaceHover transition-all duration-300"
              >
                <div className="h-8 w-8 rounded-full bg-primary-600 shadow-[0_0_10px_rgba(20,184,166,0.3)] flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-text-main">{user?.name || 'User'}</p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-xl border border-border py-1 z-20 animate-slide-up origin-top-right">
                    <button className="w-full text-left px-4 py-2 text-sm text-text-main hover:bg-surfaceHover flex items-center transition-colors">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </button>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
