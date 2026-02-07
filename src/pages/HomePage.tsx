import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/common/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import FeaturedCarousel from '@/components/home/FeaturedCarousel'
import ContactModal from '@/components/common/ContactModal'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, Image, Zap, HelpCircle, Users, MessageSquare, Database, Mail } from 'lucide-react'

export default function HomePage() {
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-4 animate-fade-in">
            מגחכים על העיר
          </h1>
          <p className="text-xl md:text-3xl font-bold mb-6 max-w-3xl mx-auto leading-relaxed">
            יוצרים מם ומשפיעים על המרחב העירוני
          </p>
          <p className="text-xl md:text-2xl font-bold mb-6 max-w-2xl mx-auto leading-relaxed">
            אם אפשר לצחוק על המרחב שבו אנחנו חיים, אפשר גם לדבר עליו, לבקר אותו ואולי אפילו לשנות אותו!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => navigate('/create')}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Sparkles className="ml-2 h-6 w-6" />
              צור גיחוך חדש
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/gallery')}
              className="border-white text-white hover:bg-white/10"
            >
              <Image className="ml-2 h-6 w-6" />
              לגלריית הגיחוכים
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const element = document.getElementById('what-is-this')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="border-white text-white hover:bg-white/10"
            >
              <HelpCircle className="ml-2 h-6 w-6" />
              מה קורה כאן?
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-2 text-white text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-1">1️⃣</div>
              <h4 className="font-bold mb-1 text-lg">מסתכלים מסביב</h4>
              <p className="text-base leading-snug opacity-95">
                מעלים תמונה שצילמתם בעיר, או בוחרים תבנית מם מהמאגר
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-2 text-white text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-1">2️⃣</div>
              <h4 className="font-bold mb-1 text-lg">אומרים משהו</h4>
              <p className="text-base leading-snug opacity-95">
                מוסיפים את האמירה שלכם עם טקסט, אימוג'י, תיאור, תגיות ומיקום
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-2 text-white text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-1">3️⃣</div>
              <h4 className="font-bold mb-1 text-lg">משתפים ומשפיעים!</h4>
              <p className="text-base leading-snug opacity-95">
                הכנתם מם? שתפו אותו - הפעם השיתוף שלכם יכול להשפיע על המרחב!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Memes Carousel */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">
            גיחוכים אחרונים מהקהילה
          </h2>
          <div className="max-w-4xl mx-auto">
            <FeaturedCarousel />
          </div>
        </div>
      </section>

      {/* What's Happening Here Section */}
      <section id="what-is-this" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">מה קורה כאן?</h2>

          {/* Intro Text */}
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <p className="text-lg font-semibold leading-relaxed text-gray-800 mb-4">
              האתר הזה נולד מתוך הרעיון שממים הם לא רק בדיחה — הם כלי תקשורת, ביקורת, הפצה והשתתפות. כאן אנחנו מנסים להשתמש בהם כדי לדבר על המרחב, על אדריכלות ועל איך היא נראית, מרגישה ומתפקדת בחיים האמתיים.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              *פרויקט גמר באדריכלות, אוניברסיטת תל־אביב
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-12">
            {/* What do we do? */}
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-100 p-4 rounded-full">
                    <Sparkles className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-center">אז מה עושים?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  יוצרים מם על המרחב או בעזרתו - מעלים תמונה או בוחרים תבנית, מוסיפים טקסט, אימוג׳י ותגיות (האשטאגים), וכמובן... משתפים!
                </p>
              </CardContent>
            </Card>

            {/* How does it work? */}
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-center">כולם מוזמנים להשתתף!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  באמת כולם - כל מי שמרגיש שיש לו מה להגיד על העיר יכול לתרום.
                  לא צריך ידע מוקדם - רק עין חדה, וקצת חוש הומור!
                </p>
              </CardContent>
            </Card>

            {/* Why does it matter? */}
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-purple-100 p-4 rounded-full">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-center">למה זה משנה?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  המרחב הבנוי משפיע על כולנו, אבל רוב הזמן השיח עליו סגור בידי מומחים. הפרויקט בוחן כיצד ממים יכולים לפתוח את השיח הזה — ולאפשר ביקורת נגישה, ישירה ומשתתפת.
                </p>
              </CardContent>
            </Card>

            {/* What happens with the data? */}
            <Card hover>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Database className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-center">מה קורה עם המידע?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  זהו מחקר אקדמי. כל המידע נאסף באופן אנונימי למטרות מחקר בלבד.
                  לפרטים מלאים ראו את{' '}
                  <button
                    onClick={() => navigate('/privacy')}
                    className="text-primary hover:underline font-semibold"
                  >
                    מדיניות הפרטיות
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
              className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
            >
              <Mail className="ml-2 h-5 w-5" />
              יש לכם שאלות? צרו קשר
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-primary to-secondary py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <Zap className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">מוכנים להתחיל?</h2>
          <Button
            size="lg"
            onClick={() => navigate('/create')}
            className="bg-white text-primary hover:bg-gray-100"
          >
            צרו את הממ הראשון שלכם
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
