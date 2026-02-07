import { Trophy } from 'lucide-react'
import MemeCard from './MemeCard'
import type { Meme } from '@/types/meme'

interface TopMemesSectionProps {
  memes: Meme[]
}

export default function TopMemesSection({ memes }: TopMemesSectionProps) {
  // Get top 3 memes by likes
  const topMemes = [...memes]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3)

  if (topMemes.length === 0) {
    return null
  }

  return (
    <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-500 p-3 rounded-full shadow-md">
          <Trophy size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-amber-900">
            הגיחוכים המובילים
          </h2>
          <p className="text-amber-700">
            הגיחוכים שקיבלו הכי הרבה לבבות החודש
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topMemes.map((meme, index) => (
          <div key={meme.id} className="relative">
            {/* Medal badge */}
            {index === 0 && (
              <div className="absolute -top-3 -right-3 z-10 bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                🥇
              </div>
            )}
            {index === 1 && (
              <div className="absolute -top-3 -right-3 z-10 bg-gray-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                🥈
              </div>
            )}
            {index === 2 && (
              <div className="absolute -top-3 -right-3 z-10 bg-amber-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                🥉
              </div>
            )}

            <div className="transform hover:scale-105 transition-transform">
              <MemeCard meme={meme} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
