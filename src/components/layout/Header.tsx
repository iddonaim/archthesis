import { Link, useLocation } from 'react-router-dom'
import { Home, Image, Plus, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import LanguageToggle from '@/components/common/LanguageToggle'

export default function Header() {
  const location = useLocation()
  const { t } = useTranslation()

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/gallery', label: t('nav.gallery'), icon: Image },
    { path: '/create', label: t('nav.create'), icon: Plus },
    { path: '/admin', label: t('nav.admin'), icon: Shield }
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
    <header className="bg-white/85 backdrop-blur-md border-b border-ink/5 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, '/')}
            className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            {t('brand.short')}
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={(e) => handleNavClick(e, path)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-200',
                  isActive(path)
                    ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                    : 'text-ink-light hover:bg-ink/5'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
            <LanguageToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
