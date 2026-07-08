import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '@/components/layout/Layout'
import Button from '@/components/common/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import FeaturedCarousel from '@/components/home/FeaturedCarousel'
import ContactModal from '@/components/common/ContactModal'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, Image, Zap, HelpCircle, Users, MessageSquare, Database, Mail } from 'lucide-react'

export default function HomePage() {
  const { t } = useTranslation('home')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showContactModal, setShowContactModal] = useState(false)

  // Origin tracking for QR codes and organic spread
  useEffect(() => {
    const ref = searchParams.get('ref')

    if (ref) {
      // QR code scan - save specific location (e.g., "florentin", "university")
      localStorage.setItem('user_origin', ref)
      console.log('Origin captured from QR:', ref)
    } else if (!localStorage.getItem('user_origin')) {
      // Organic visit via link - mark as "link" (only if no origin exists yet)
      localStorage.setItem('user_origin', 'link')
      console.log('Origin captured: organic link')
    }
  }, [searchParams])

  return (
    <>
    <Layout>
      {/* Hero Section — bubblegum pop: pastel blobs + big gradient headline */}
      <section className="relative overflow-hidden bg-pastel-blush py-20 md:py-24">
        <div className="pointer-events-none absolute -top-20 start-[8%] h-64 w-64 rounded-full bg-pastel-pink blur-2xl opacity-80" />
        <div className="pointer-events-none absolute top-24 -end-20 h-72 w-72 rounded-full bg-pastel-teal blur-2xl opacity-80" />
        <div className="pointer-events-none absolute -bottom-24 start-[30%] h-72 w-72 rounded-full bg-pastel-lilac blur-2xl opacity-80" />
        <div className="pointer-events-none absolute bottom-8 end-[26%] h-40 w-40 rounded-full bg-pastel-butter blur-xl opacity-90" />
        <div className="pointer-events-none absolute top-14 end-[14%] text-6xl rotate-12 select-none">😎</div>
        <div className="pointer-events-none absolute bottom-16 start-[10%] text-6xl -rotate-12 select-none">💬</div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-5 animate-fade-in bg-bubblegum bg-clip-text text-transparent pb-2">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-3xl font-bold mb-4 max-w-3xl mx-auto leading-relaxed text-ink">
            {t('hero.subtitle1')}
          </p>
          <p className="text-lg md:text-xl text-ink-light/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle2')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => navigate('/create')}
            >
              <Sparkles className="me-2 h-6 w-6" />
              {t('hero.ctaCreate')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/gallery')}
            >
              <Image className="me-2 h-6 w-6" />
              {t('hero.ctaGallery')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const element = document.getElementById('what-is-this')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="hover:bg-pastel-teal/40"
            >
              <HelpCircle className="me-2 h-6 w-6" />
              {t('hero.ctaInfo')}
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {([1, 2, 3] as const).map((step) => {
              const tones = {
                1: { tilt: '-rotate-1', badge: 'bg-pop-pink' },
                2: { tilt: 'rotate-1', badge: 'bg-pop-teal' },
                3: { tilt: '-rotate-1', badge: 'bg-pop-yellow' },
              }[step]
              return (
                <div
                  key={step}
                  className={`bg-white rounded-2xl border-[3px] border-ink shadow-[5px_5px_0_#20242E] p-5 text-center ${tones.tilt} transition-transform hover:rotate-0 hover:-translate-y-1`}
                >
                  <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink font-black text-lg text-ink ${tones.badge}`}>
                    {step}
                  </div>
                  <h4 className="font-bold mb-1 text-lg text-ink">{t(`steps.step${step}Title`)}</h4>
                  <p className="text-base leading-snug text-ink-light/90">
                    {t(`steps.step${step}Body`)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Memes Carousel */}
      <section className="py-12 bg-paper">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">
            {t('latest')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <FeaturedCarousel />
          </div>
        </div>
      </section>

      {/* What's Happening Here Section */}
      <section id="what-is-this" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">{t('whatsHappening.title')}</h2>

          {/* Intro Text */}
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <p className="text-lg font-semibold leading-relaxed text-gray-800 mb-4">
              {t('whatsHappening.intro')}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('whatsHappening.academicNote')}
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-12">
            {/* What do we do? */}
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary-50 p-4 rounded-full ring-1 ring-primary-100">
                    <Sparkles className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <CardTitle className="text-center">{t('cards.whatTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  {t('cards.whatBody')}
                </p>
              </CardContent>
            </Card>

            {/* How does it work? */}
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-secondary-50 p-4 rounded-full ring-1 ring-secondary-100">
                    <Users className="h-8 w-8 text-secondary-600" />
                  </div>
                </div>
                <CardTitle className="text-center">{t('cards.whoTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  {t('cards.whoBody')}
                </p>
              </CardContent>
            </Card>

            {/* Why does it matter? */}
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-accent-100 p-4 rounded-full ring-1 ring-accent-300/50">
                    <MessageSquare className="h-8 w-8 text-accent-700" />
                  </div>
                </div>
                <CardTitle className="text-center">{t('cards.whyTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  {t('cards.whyBody')}
                </p>
              </CardContent>
            </Card>

            {/* What happens with the data? */}
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-ink/5 p-4 rounded-full ring-1 ring-ink/10">
                    <Database className="h-8 w-8 text-ink-light" />
                  </div>
                </div>
                <CardTitle className="text-center">{t('cards.dataTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  {t('cards.dataBody')}
                  <button
                    onClick={() => navigate('/privacy')}
                    className="text-primary hover:underline font-semibold"
                  >
                    {t('cards.dataPrivacyLink')}
                  </button>
                  .
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setShowContactModal(true)}
            >
              <Mail className="me-2 h-5 w-5" />
              {t('contactCta')}
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden bg-bubblegum py-12">
        <div className="relative container mx-auto px-4 text-center text-white">
          <Zap className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">{t('finalCta.title')}</h2>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/create')}
          >
            {t('finalCta.button')}
          </Button>
        </div>
      </section>
    </Layout>

    {/* Contact Modal */}
    <ContactModal
      isOpen={showContactModal}
      onClose={() => setShowContactModal(false)}
      source="homepage"
    />
    </>
  )
}
