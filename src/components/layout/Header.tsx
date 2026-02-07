import { Link, useLocation } from 'react-router-dom'
import { Home, Image, Plus, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'דף הבית', icon: Home },
    { path: '/gallery', label: 'גלריה', icon: Image },
    { path: '/create', label: 'צור גיחוך', icon: Plus },
    { path: '/admin', label: 'ניהול', icon: Shield }
  ]

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    // Check if CreatePage has unsaved work
    if ((window as any).checkUnsavedWork) {
      const canNavigate = (window as any).checkUnsavedWork(path)
      if (!canNavigate) {
        e.preventDefault()
      }
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, '/')}
            className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            גיחוך והגחה
          </Link>

          {/* Navigation */}
          <nav className="flex gap-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={(e) => handleNavClick(e, path)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200',
                  isActive(path)
                    ? 'bg-gradient-to-r from-primary to-red-400 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
