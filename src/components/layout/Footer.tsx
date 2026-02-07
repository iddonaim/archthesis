import { useState } from 'react'
import { Link } from 'react-router-dom'
import ContactModal from '@/components/common/ContactModal'
import { APP_VERSION, BUILD_DATE } from '@/version'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <>
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-right">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                מכונת הגיחוך וההגחה
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                פלטפורמה לביקורת אדריכלית דרך יצירת ממים.
                הפכו תצפיות לממים, וממים לשינוי אמיתי!
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="font-semibold mb-4">ניווט</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    דף הבית
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-primary transition-colors">
                    גלריה
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="hover:text-primary transition-colors">
                    צור גיחוך
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4">משפטי</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    פרטיות
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="hover:text-primary transition-colors"
                  >
                    יצירת קשר
                  </button>
                </li>
              </ul>
            </div>

            {/* Credits */}
            <div>
              <h4 className="font-semibold mb-4">פרטים</h4>
              <div className="text-gray-400 text-sm space-y-1">
                <p>פרויקט גמר באדריכלות</p>
                <p>אוניברסיטת תל אביב</p>
                <p className="mt-3">יוצר: עידו נעים</p>
                <p className="text-xs">נבנה עם Claude (Anthropic) - Sonnet 4.5</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm space-y-2">
            <p>© {currentYear} מכונת הגיחוך וההגחה. כל הזכויות שמורות.</p>
            <p className="text-xs text-gray-600">
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
