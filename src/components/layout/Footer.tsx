import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ContactModal from '@/components/common/ContactModal'
import { APP_VERSION, BUILD_DATE } from '@/version'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <>
      <footer className="bg-pastel-blush border-t-[3px] border-ink/10 text-ink mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-start">
            {/* About */}
            <div>
              <h3 className="text-xl font-black mb-4 bg-bubblegum bg-clip-text text-transparent">
                {t('brand.name')}
              </h3>
              <p className="text-ink-light/80 text-sm leading-relaxed">
                {t('footer.description')}
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="font-semibold mb-4">{t('footer.navigation')}</h4>
              <ul className="space-y-2 text-ink-light/80 text-sm">
                <li>
                  <Link to="/" className="hover:text-pop-pink transition-colors">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-pop-pink transition-colors">
                    {t('nav.gallery')}
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="hover:text-pop-pink transition-colors">
                    {t('nav.create')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-ink-light/80 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-pop-pink transition-colors">
                    {t('footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-pop-pink transition-colors">
                    {t('footer.terms')}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="hover:text-pop-pink transition-colors"
                  >
                    {t('footer.contact')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Credits */}
            <div>
              <h4 className="font-semibold mb-4">{t('footer.details')}</h4>
              <div className="text-ink-light/80 text-sm space-y-1">
                <p>{t('footer.thesisProject')}</p>
                <p>{t('footer.university')}</p>
                <p className="mt-3">{t('footer.creator')}</p>
                <p className="text-xs">{t('footer.builtWith')}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-ink/10 mt-8 pt-6 text-center text-ink-light/70 text-sm space-y-2">
            <p>{t('footer.copyright', { year: currentYear })}</p>
            <p className="text-xs text-ink-light/60">
              {APP_VERSION} • {BUILD_DATE}
            </p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        source="footer"
      />
    </>
  )
}
