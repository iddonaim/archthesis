import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import MemeManagementTable from '@/components/admin/MemeManagementTable'
import Analytics from '@/components/admin/Analytics'
import ContactMessagesTable from '@/components/admin/ContactMessagesTable'
import Button from '@/components/common/Button'
import { Image, BarChart3, LogOut, Shield, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { APP_VERSION, BUILD_DATE } from '@/version'

type Tab = 'analytics' | 'memes' | 'messages'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics')
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('התנתקת בהצלחה')
      navigate('/')
    } catch (error) {
      toast.error('שגיאה בהתנתקות')
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary text-white p-3 rounded-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">פאנל ניהול</h1>
                  <p className="text-sm text-gray-600">
                    מחובר כ: {user?.email} • {APP_VERSION} ({BUILD_DATE})
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                התנתק
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                סטטיסטיקות
              </button>
              <button
                onClick={() => setActiveTab('memes')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'memes'
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Image className="w-5 h-5" />
                ניהול גיחוכים
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Mail className="w-5 h-5" />
                הודעות קשר
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto px-4 py-8">
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'memes' && <MemeManagementTable />}
          {activeTab === 'messages' && <ContactMessagesTable />}
        </div>
      </div>
    </Layout>
  )
}
