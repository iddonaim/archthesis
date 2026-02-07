import { useState, useEffect } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TrendingUp, Tag, MapPin, Image, Calendar, BarChart3, QrCode } from 'lucide-react'

interface Meme {
  id: string
  tags?: string[]
  location?: {
    display_name: string
  }
  originSource?: string
  createdAt: any
  [key: string]: any
}

interface TagCount {
  tag: string
  count: number
}

interface LocationCount {
  location: string
  count: number
}

interface OriginCount {
  origin: string
  count: number
}

export default function Analytics() {
  const [, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [totalMemes, setTotalMemes] = useState(0)
  const [topTags, setTopTags] = useState<TagCount[]>([])
  const [topLocations, setTopLocations] = useState<LocationCount[]>([])
  const [originSources, setOriginSources] = useState<OriginCount[]>([])
  const [memesToday, setMemesToday] = useState(0)
  const [memesThisWeek, setMemesThisWeek] = useState(0)

  useEffect(() => {
    const q = query(collection(db, 'memes'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meme[]

      setMemes(memesData)
      setTotalMemes(memesData.length)

      // Calculate analytics
      calculateTagStats(memesData)
      calculateLocationStats(memesData)
      calculateOriginStats(memesData)
      calculateTimeStats(memesData)

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const calculateTagStats = (memesData: Meme[]) => {
    const tagCounts: Record<string, number> = {}

    memesData.forEach(meme => {
      meme.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setTopTags(sortedTags)
  }

  const calculateLocationStats = (memesData: Meme[]) => {
    const locationCounts: Record<string, number> = {}

    memesData.forEach(meme => {
      if (meme.location?.display_name) {
        const location = meme.location.display_name
        locationCounts[location] = (locationCounts[location] || 0) + 1
      }
    })

    const sortedLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setTopLocations(sortedLocations)
  }

  const calculateOriginStats = (memesData: Meme[]) => {
    const originCounts: Record<string, number> = {}

    memesData.forEach(meme => {
      const origin = meme.originSource || 'link'
      originCounts[origin] = (originCounts[origin] || 0) + 1
    })

    const sortedOrigins = Object.entries(originCounts)
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count)

    setOriginSources(sortedOrigins)
  }

  const calculateTimeStats = (memesData: Meme[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    let todayCount = 0
    let weekCount = 0

    memesData.forEach(meme => {
      if (meme.createdAt) {
        const memeDate = meme.createdAt.toDate ? meme.createdAt.toDate() : new Date(meme.createdAt)

        if (memeDate >= today) {
          todayCount++
        }
        if (memeDate >= weekAgo) {
          weekCount++
        }
      }
    })

    setMemesToday(todayCount)
    setMemesThisWeek(weekCount)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">טוען נתונים סטטיסטיים...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">סטטיסטיקות</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Image className="w-6 h-6" />}
          title="סך הכל גיחוכים"
          value={totalMemes}
          color="bg-blue-500"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          title="גיחוכים היום"
          value={memesToday}
          color="bg-green-500"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="גיחוכים השבוע"
          value={memesThisWeek}
          color="bg-purple-500"
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="ממוצע יומי"
          value={memesThisWeek > 0 ? Math.round(memesThisWeek / 7) : 0}
          color="bg-orange-500"
        />
      </div>

      {/* QR Code Origins */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold">מקורות תנועה</h3>
        </div>
        {originSources.length > 0 ? (
          <div className="space-y-3">
            {originSources.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-300">
                    {idx + 1}
                  </span>
                  <span className="font-medium">
                    {item.origin === 'link' ? '🔗 קישור ישיר' : `📍 QR: ${item.origin}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{
                        width: `${(item.count / originSources[0].count) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-600 w-8">
                    {item.count}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({Math.round((item.count / totalMemes) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">אין נתונים</p>
        )}
      </div>

      {/* Top Tags and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tags */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-secondary" />
            <h3 className="text-lg font-bold">תגיות פופולריות</h3>
          </div>
          {topTags.length > 0 ? (
            <div className="space-y-3">
              {topTags.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-300">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{item.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{
                          width: `${(item.count / topTags[0].count) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-600 w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">אין נתונים</p>
          )}
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">מיקומים פופולריים</h3>
          </div>
          {topLocations.length > 0 ? (
            <div className="space-y-3">
              {topLocations.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-300">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {item.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(item.count / topLocations[0].count) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-600 w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">אין נתונים</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
  color: string
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
