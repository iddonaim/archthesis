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
            className="text-xl sm:text-2xl font-black bg-bubblegum bg-clip-text text-transparent hover:scale-105 transition-transform shrink min-w-0"
          >
            {t('brand.short')}
          </Link>

          {/* Navigation - compact paddings below sm so the header's minimum
              width fits narrow phones; overflowing the viewport widens the
              mobile layout viewport and drops fixed bottom bars off-screen. */}
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={(e) => handleNavClick(e, path)}
                className={cn(
                  'flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full font-semibold transition-all duration-200',
                  isActive(path)
                    ? 'bg-pastel-pink/60 text-ink ring-1 ring-pop-pink/40'
                    : 'text-ink-light hover:bg-pastel-lilac/50'
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
