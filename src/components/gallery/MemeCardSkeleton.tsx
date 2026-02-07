import Card, { CardContent, CardFooter } from '@/components/common/Card'

export default function MemeCardSkeleton() {
  return (
    <Card>
      <CardContent>
        {/* Image skeleton */}
        <div className="w-full aspect-[4/3] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse bg-[length:200%_100%]"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </CardContent>

      <CardFooter>
        <div className="w-full space-y-3">
          {/* Tags skeleton */}
          <div className="flex gap-1.5">
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
          </div>

          {/* Location skeleton */}
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />

          {/* Actions skeleton */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </CardFooter>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </Card>
  )
}
