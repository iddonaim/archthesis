import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import { Link } from 'react-router-dom'

interface ConsentModalProps {
  isOpen: boolean
  onAccept: () => void
}

export default function ConsentModal({ isOpen, onAccept }: ConsentModalProps) {
  const { t } = useTranslation('modals')
  // MODULAR: Set to false to disable checkbox requirement (just notification mode)
  const REQUIRE_CHECKBOX = false

  const [hasAccepted, setHasAccepted] = useState(false)

  const handleAccept = () => {
    // If checkbox is required, check if accepted; otherwise just proceed
    if (!REQUIRE_CHECKBOX || hasAccepted) {
      // Save to both localStorage (permanent) and sessionStorage (session backup for iOS)
      localStorage.setItem('hasAcceptedTerms', 'true')
      sessionStorage.setItem('hasAcceptedTerms', 'true')
      onAccept()
    }
  }

  if (!isOpen) return null

  return (
    // Full-screen overlay - brute force approach
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Modal content */}
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="max-w-2xl mx-auto">
        {/* Headline */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          {t('consent.title')}
        </h2>

        {/* Body */}
        <div className="space-y-4 mb-6 text-start">
          <p className="text-base md:text-lg leading-relaxed">
            {t('consent.intro')}
          </p>

          <p className="text-base md:text-lg leading-relaxed">
            {t('consent.goalLine1')}
            <br />
            {t('consent.goalLine2')}
          </p>

          {/* How it works */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg my-6">
            <h3 className="font-bold text-lg md:text-xl mb-4">{t('consent.howTitle')}</h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-primary text-black rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
                <span className="text-sm md:text-base leading-relaxed">{t('consent.step1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-secondary text-black rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
                <span className="text-sm md:text-base leading-relaxed">{t('consent.step2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-accent text-black rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
                <span className="text-sm md:text-base leading-relaxed">{t('consent.step3')}</span>
              </li>
            </ol>
          </div>

          {/* MODULAR CHECKBOX SECTION - Shows only if REQUIRE_CHECKBOX is true */}
          {REQUIRE_CHECKBOX && (
            <div className="flex items-start gap-3 my-6 p-3 md:p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms-checkbox" className="cursor-pointer text-sm md:text-base leading-relaxed">
                {t('consent.checkboxLabel')}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="text-primary hover:underline font-semibold"
                >
                  {t('consent.checkboxLink')}
                </Link>
              </label>
            </div>
          )}
        </div>

        {/* Button */}
        <div className="text-center mt-4">
          <Button
            size="lg"
            onClick={handleAccept}
            disabled={REQUIRE_CHECKBOX && !hasAccepted}
            className="w-full md:w-auto md:min-w-[250px]"
          >
            {t('consent.accept')}
          </Button>
        </div>
      </div>
    </div>
  </div>
  )
}
