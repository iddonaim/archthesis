import { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '@/stores/useEditorStore'
import Button from '@/components/common/Button'
import { MapPin, Loader2, X } from 'lucide-react'
import type { Location } from '@/types/editor'

interface LocationResult {
  lat: string
  lon: string
  display_name: string
}

export default function LocationPanel() {
  const { selectedLocation, setSelectedLocation, username, setUsername } = useEditorStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false)
  const [customLocationText, setCustomLocationText] = useState('')

  // Debounced search function
  const searchLocation = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setResults([])
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=il`
      )
      const data: LocationResult[] = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Location search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        searchLocation(searchQuery)
      } else {
        setResults([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, searchLocation])

  const handleSelectLocation = (result: LocationResult) => {
    const location: Location = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
      addToMeme: true,
      showInGallery: true,
      hideFromGallery: false,
      x: 400,
      y: 500,
      fontSize: 24,
      color: '#FFFFFF',
      rotation: 0
    }

    setSelectedLocation(location)
    setSearchQuery('')
    setResults([])
  }

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('הדפדפן שלך לא תומך במיקום')
      return
    }

    setIsLoadingCurrent(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await response.json()

          setSelectedLocation({
            latitude,
            longitude,
            display_name: data.display_name,
            addToMeme: true,
            showInGallery: true,
            hideFromGallery: false,
            x: 400,
            y: 500,
            fontSize: 24,
            color: '#FFFFFF',
            rotation: 0
          })
        } catch (error) {
          console.error('Geolocation error:', error)
          alert('שגיאה באיתור המיקום')
        } finally {
          setIsLoadingCurrent(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('לא ניתן לקבל את המיקום שלך')
        setIsLoadingCurrent(false)
      }
    )
  }

  const handleClearLocation = () => {
    setSelectedLocation(null)
    setSearchQuery('')
    setResults([])
    setCustomLocationText('')
  }

  const handleCustomLocation = () => {
    if (!customLocationText.trim()) return

    const location: Location = {
      latitude: 0,
      longitude: 0,
      display_name: customLocationText.trim(),
      addToMeme: true,
      showInGallery: true,
      hideFromGallery: false,
      x: 400,
      y: 500,
      fontSize: 24,
      color: '#FFFFFF',
      rotation: 0
    }

    setSelectedLocation(location)
    setCustomLocationText('')
  }

  // Get simplified location name (street + city)
  const getSimplifiedName = (displayName: string) => {
    const parts = displayName.split(',').map(p => p.trim())
    // Try to get street and city (typically first 2 parts)
    return parts.slice(0, 2).join(', ')
  }

  // Get short format for displaying on meme (street + city only)
  const getShortFormat = (displayName: string) => {
    const parts = displayName.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`
    }
    return parts[0] || displayName
  }

  const handleLocationOptionChange = (option: 'addToMeme' | 'showInGallery' | 'hideFromGallery', checked: boolean) => {
    if (!selectedLocation) return

    const updates: Partial<Location> = { [option]: checked }

    // Mutually exclusive: hideFromGallery overrides BOTH other options
    if (option === 'hideFromGallery' && checked) {
      updates.showInGallery = false
      updates.addToMeme = false
    } else if ((option === 'showInGallery' || option === 'addToMeme') && checked) {
      updates.hideFromGallery = false
    }

    setSelectedLocation({ ...selectedLocation, ...updates })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">מיקום ושם משתמש</h3>

      {/* Username Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          שם משתמש (אופציונלי)
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="הזינו שם משתמש..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          השם יופיע בגלריה מתחת לגיחוך שלכם
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-semibold text-gray-900 mb-3">מיקום</h4>

      {/* Current Location Button */}
      <Button
        variant="secondary"
        onClick={handleCurrentLocation}
        disabled={isLoadingCurrent}
        className="w-full flex items-center justify-center gap-2"
      >
        {isLoadingCurrent ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>מאתר...</span>
          </>
        ) : (
          <>
            <MapPin size={18} />
            <span>המיקום שלי</span>
          </>
        )}
      </Button>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          חיפוש מיקום
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="הקלד שם עיר, רחוב או מקום..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Custom Location Input */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700">
          מיקום מותאם אישית
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customLocationText}
            onChange={(e) => setCustomLocationText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomLocation()
              }
            }}
            placeholder="הזן טקסט מיקום כלשהו..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button
            variant="primary"
            onClick={handleCustomLocation}
            disabled={!customLocationText.trim()}
            className="px-4"
          >
            הוסף
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          הזן טקסט חופשי שיוצג כמיקום (ללא קואורדינטות GPS)
        </p>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectLocation(result)}
              className="w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">
                {result.display_name.split(',')[0]}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {result.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchQuery.length >= 3 && results.length === 0 && !isSearching && (
        <div className="text-center py-4 text-gray-500 text-sm">
          לא נמצאו תוצאות
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                <MapPin size={16} />
                <span>מיקום נבחר</span>
              </div>
              <div className="text-sm text-green-700 mb-2">
                {getSimplifiedName(selectedLocation.display_name)}
              </div>
              <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-green-200">
                <strong>על הגיחוך:</strong> {getShortFormat(selectedLocation.display_name)}
              </div>
            </div>
            <button
              onClick={handleClearLocation}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="הסר מיקום"
            >
              <X size={18} />
            </button>
          </div>

          {/* Location Visibility Options */}
          <div className="space-y-3 pt-3 border-t border-green-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLocation.addToMeme || false}
                onChange={(e) => handleLocationOptionChange('addToMeme', e.target.checked)}
                className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={selectedLocation.hideFromGallery}
              />
              <div className={selectedLocation.hideFromGallery ? 'opacity-50' : ''}>
                <div className="text-sm font-medium text-gray-900">
                  הוסף מיקום לתמונה
                </div>
                <div className="text-xs text-gray-600">
                  המיקום יופיע על התמונה (ניתן לגרור ולשנות גודל)
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLocation.showInGallery || false}
                onChange={(e) => handleLocationOptionChange('showInGallery', e.target.checked)}
                className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                disabled={selectedLocation.hideFromGallery}
              />
              <div className={selectedLocation.hideFromGallery ? 'opacity-50' : ''}>
                <div className="text-sm font-medium text-gray-900">
                  הצג בגלריה
                </div>
                <div className="text-xs text-gray-600">
                  המיקום יופיע מתחת לגיחוך בגלריה
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLocation.hideFromGallery || false}
                onChange={(e) => handleLocationOptionChange('hideFromGallery', e.target.checked)}
                className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  הסתר מהגלריה, לשימוש מחקרי בלבד
                </div>
                <div className="text-xs text-gray-600">
                  המיקום יהיה זמין רק בקונסול הניהול
                </div>
              </div>
            </label>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
