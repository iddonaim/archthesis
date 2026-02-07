import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/common/Button'
import ContactModal from '@/components/common/ContactModal'
import { ArrowRight, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import privacyContent from '@/data/privacyContent.json'

export default function PrivacyPage() {
  const navigate = useNavigate()
  const [showContactModal, setShowContactModal] = useState(false)

  // Helper function to render bold text from markdown-style **text**
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  // Helper to render list items (handles both strings and objects with label/text)
  const renderListItem = (item: any) => {
    if (typeof item === 'string') {
      return renderText(item)
    }
    if (item.label && item.text) {
      return (
        <>
          <strong>{item.label}</strong> {renderText(item.text)}
        </>
      )
    }
    return null
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-primary hover:underline font-semibold mb-8"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לדף הבית
        </button>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {privacyContent.title}
        </h1>

        {/* Last Updated Notice */}
        <div className="bg-blue-50 border-r-4 border-blue-400 p-4 mb-8 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>עדכון אחרון:</strong> {privacyContent.lastUpdated}
          </p>
        </div>

        {/* TL;DR Section */}
        {privacyContent.tldr && (
          <div className="mb-12 p-8 bg-gradient-to-l from-primary/10 via-secondary/5 to-accent/5 rounded-2xl border-2 border-primary/20 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              {privacyContent.tldr.title}
            </h2>
            <div className="space-y-6">
              {privacyContent.tldr.sections.map((section: any, index: number) => (
                <div key={index} className="bg-white/80 p-5 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-3 text-primary">
                    {section.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {renderText(section.content)}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact Button at End of TL;DR */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Mail size={24} />
                <span>צור קשר</span>
              </button>
            </div>

            {/* Separator */}
            <div className="mt-10 mb-6 border-t-2 border-gray-300"></div>
            <p className="text-center text-gray-600 font-semibold text-lg">
              מדיניות הפרטיות המלאה ←
            </p>
          </div>
        )}

        {/* Main Sections */}
        {privacyContent.sections.map((section: any) => (
          <div key={section.id}>
            <h2 className="text-3xl font-bold mt-12 mb-6">{section.title}</h2>

            {/* Section intro content */}
            {section.content && (
              <p className="mb-4 leading-relaxed text-gray-700">
                {renderText(section.content)}
              </p>
            )}

            {/* Section subtitle */}
            {section.subtitle && (
              <h3 className="text-xl font-semibold mt-6 mb-4">{section.subtitle}</h3>
            )}

            {/* Direct list (for sections without subsections) */}
            {section.list && (
              <ul className="list-disc mr-8 mb-6 space-y-2 text-gray-700">
                {section.list.map((item: any, idx: number) => (
                  <li key={idx}>{renderListItem(item)}</li>
                ))}
              </ul>
            )}

            {/* Note box */}
            {section.note && (
              <div className="bg-gray-100 border-r-4 border-primary p-6 rounded-lg mb-8">
                <p>
                  <strong>{section.note.label}</strong> {renderText(section.note.text)}
                </p>
              </div>
            )}

            {/* Warning box */}
            {section.warning && (
              <div className="bg-gray-100 border-r-4 border-primary p-6 rounded-lg mb-8">
                <p>
                  <strong>{section.warning}</strong>
                </p>
              </div>
            )}

            {/* Subsections */}
            {section.subsections?.map((subsection: any, idx: number) => (
              <div key={idx}>
                <h3 className="text-2xl font-semibold mt-8 mb-4">{subsection.title}</h3>
                {subsection.content && (
                  <p className="mb-4 leading-relaxed text-gray-700">
                    {renderText(subsection.content)}
                  </p>
                )}
                {subsection.list && (
                  <ul className="list-disc mr-8 mb-6 space-y-2 text-gray-700">
                    {subsection.list.map((item: any, listIdx: number) => (
                      <li key={listIdx}>{renderListItem(item)}</li>
                    ))}
                  </ul>
                )}
                {subsection.warnings && (
                  <div className="bg-yellow-50 border-r-4 border-yellow-500 p-6 rounded-lg mb-6 space-y-3">
                    {subsection.warnings.map((warning: string, wIdx: number) => (
                      <p key={wIdx} className="text-gray-800">
                        <strong className="text-yellow-700">⚠️ {warning}</strong>
                      </p>
                    ))}
                  </div>
                )}
                {subsection.note && (
                  <div className="bg-gray-100 border-r-4 border-primary p-6 rounded-lg mb-8">
                    <p>
                      <strong>{subsection.note.label}</strong> {renderText(subsection.note.text)}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Third party services */}
            {section.services && (
              <ul className="list-disc mr-8 mb-6 space-y-3 text-gray-700">
                {section.services.map((service: string, idx: number) => (
                  <li key={idx}>{renderText(service)}</li>
                ))}
              </ul>
            )}

            {/* Contact section - show contact info with button */}
            {section.id === 'contact' && section.contactInfo && (
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-r-4 border-primary p-8 rounded-xl mb-8">
                <div className="space-y-3 mb-6">
                  <p className="text-lg">
                    <strong>שם:</strong> {section.contactInfo.name}
                  </p>
                  <p className="text-lg">
                    <strong>מוסד:</strong> {section.contactInfo.institution}
                  </p>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
                  >
                    <Mail size={24} />
                    <span>צור קשר</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}

        {/* Consent Statement */}
        {privacyContent.consent && (
          <div className="mt-12 p-8 bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary rounded-xl shadow-lg">
            <p className="text-lg leading-relaxed text-gray-800 text-center font-semibold">
              {renderText(privacyContent.consent.text)}
            </p>
          </div>
        )}

        {/* Creator Footer */}
        {privacyContent.creator && (
          <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center text-gray-600 space-y-2">
            <p className="font-bold text-gray-800">{privacyContent.creator.name}</p>
            <p>{privacyContent.creator.institution}</p>
            <p className="text-sm text-gray-500">{privacyContent.creator.technology}</p>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        source="privacy_page"
      />
    </Layout>
  )
}
