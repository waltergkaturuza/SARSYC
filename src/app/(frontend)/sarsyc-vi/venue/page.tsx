'use client'

import { useState, useEffect } from 'react'
import { FiMapPin, FiHome, FiCoffee, FiInfo, FiLoader } from 'react-icons/fi'
import Link from 'next/link'
import InteractiveMap from '@/components/maps/InteractiveMap'
import { showToast } from '@/lib/toast'

const hotels = [
  {
    name: 'Windhoek Hilton',
    category: '5-Star',
    distance: '2 km from venue',
    price: '$150-200/night',
    features: ['Free WiFi', 'Breakfast included', 'Airport shuttle'],
  },
  {
    name: 'Avani Windhoek Hotel',
    category: '4-Star',
    distance: '1.5 km from venue',
    price: '$100-150/night',
    features: ['Pool', 'Restaurant', 'Gym'],
  },
  {
    name: 'Town Lodge Windhoek',
    category: '3-Star',
    distance: '3 km from venue',
    price: '$60-90/night',
    features: ['Budget-friendly', 'Clean rooms', 'Central location'],
  },
]

const attractions = [
  'Namibia Craft Centre',
  'National Museum of Namibia',
  'Christuskirche (Christ Church)',
  'Independence Memorial Museum',
  'Joe\'s Beerhouse (famous restaurant)',
]

interface VenueLocation {
  id: string
  venueName: string
  city: string
  country: string
  address?: string
  latitude: number
  longitude: number
  zoomLevel?: number
  description?: string
  conferenceEdition?: string
  facilities?: Array<{ facility: string }>
}

export default function VenuePage() {
  const [venue, setVenue] = useState<VenueLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVenue()
  }, [])

  const fetchVenue = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to get current conference venue first
      const response = await fetch('/api/venue-locations?current=true')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch venue location')
      }

      if (result.venues && result.venues.length > 0) {
        setVenue(result.venues[0])
      } else {
        // Fallback: Try to get SARSYC VI venue
        const fallbackResponse = await fetch('/api/venue-locations?edition=VI')
        const fallbackResult = await fallbackResponse.json()
        
        if (fallbackResult.venues && fallbackResult.venues.length > 0) {
          setVenue(fallbackResult.venues[0])
        } else {
          // Default fallback venue (Windhoek)
          setVenue({
            id: 'default',
            venueName: 'Windhoek International Convention Centre',
            city: 'Windhoek',
            country: 'Namibia',
            address: '123 Independence Avenue, Windhoek, Namibia',
            latitude: -22.5597,
            longitude: 17.0832,
            zoomLevel: 15,
            conferenceEdition: 'SARSYC VI',
            description: 'A state-of-the-art facility in the heart of Windhoek, equipped with modern conference amenities and accessibility features.',
            facilities: [
              { facility: 'Main plenary hall (capacity: 600)' },
              { facility: '4 breakout rooms (capacity: 100 each)' },
              { facility: 'Exhibition area' },
              { facility: 'WiFi throughout' },
              { facility: 'Wheelchair accessible' },
            ],
          })
        }
      }
    } catch (err: any) {
      console.error('Error fetching venue:', err)
      setError(err.message || 'Failed to load venue information')
      // Set default fallback venue
      setVenue({
        id: 'default',
        venueName: 'Windhoek International Convention Centre',
        city: 'Windhoek',
        country: 'Namibia',
        address: '123 Independence Avenue, Windhoek, Namibia',
        latitude: -22.5597,
        longitude: 17.0832,
        zoomLevel: 15,
        conferenceEdition: 'SARSYC VI',
        description: 'A state-of-the-art facility in the heart of Windhoek, equipped with modern conference amenities and accessibility features.',
        facilities: [
          { facility: 'Main plenary hall (capacity: 600)' },
          { facility: '4 breakout rooms (capacity: 100 each)' },
          { facility: 'Exhibition area' },
          { facility: 'WiFi throughout' },
          { facility: 'Wheelchair accessible' },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading venue information...</p>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load venue information</p>
          <button onClick={fetchVenue} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Venue & Accommodation
            </h1>
            <p className="text-xl text-white/90">
              Everything you need to know about visiting {venue.city}, {venue.country}
            </p>
          </div>
        </div>
      </section>

      {/* Conference Venue */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <h2 className="section-title">Conference Venue</h2>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {venue.venueName}
                </h3>
                {venue.conferenceEdition && (
                  <p className="text-sm text-primary-600 font-semibold mb-2">
                    {venue.conferenceEdition}
                  </p>
                )}
                <p className="text-lg text-gray-600 mb-6">
                  {venue.description || 'A state-of-the-art facility equipped with modern conference amenities and accessibility features.'}
                </p>

                <div className="space-y-4">
                  {venue.address && (
                    <div className="flex items-start gap-3">
                      <FiMapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Address</div>
                        <div className="text-gray-600 whitespace-pre-line">{venue.address}</div>
                        <div className="text-gray-600">{venue.city}, {venue.country}</div>
                      </div>
                    </div>
                  )}

                  {venue.facilities && venue.facilities.length > 0 && (
                    <div className="flex items-start gap-3">
                      <FiInfo className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Facilities</div>
                        <ul className="text-gray-600 text-sm space-y-1">
                          {venue.facilities.map((facility, index) => (
                            <li key={index}>• {typeof facility === 'string' ? facility : facility.facility}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Map */}
              <div>
                <InteractiveMap
                  venue={venue}
                  height="500px"
                  showControls={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accommodation */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">Recommended Accommodation</h2>
          <p className="section-subtitle">
            We've negotiated special rates with these hotels for {venue.conferenceEdition || 'SARSYC VI'} participants
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {hotels.map((hotel) => (
              <div key={hotel.name} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 bg-primary-100 text-primary-600 rounded-full">
                    {hotel.category}
                  </span>
                  <FiHome className="w-6 h-6 text-gray-400" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{hotel.distance}</p>
                <div className="text-2xl font-bold text-primary-600 mb-4">{hotel.price}</div>

                <ul className="space-y-2 mb-6">
                  {hotel.features.map((feature) => (
                    <li key={feature} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="btn-primary w-full text-sm">
                  Book Now
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Use booking code <strong className="text-primary-600">SARSYC2026</strong> for special rates
            </p>
          </div>
        </div>
      </section>

      {/* Getting to Windhoek */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title">Getting to {venue.city}</h2>

            <div className="card p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">By Air</h3>
                  <p className="text-gray-600 mb-4">
                    <strong>Hosea Kutako International Airport (WDH)</strong> is located 45 km east of Windhoek.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Direct flights from Johannesburg, Cape Town, Victoria Falls, Frankfurt</li>
                    <li>• Airport shuttle service available (pre-book during registration)</li>
                    <li>• Taxi to city center: ~$30-40 USD</li>
                    <li>• Car rental available at airport</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-3">✈️ Airport Shuttle Service</h4>
              <p className="text-gray-700 mb-3">
                We're providing complimentary shuttle service from the airport to designated hotels for registered participants.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Dates:</strong> August 4-5, 2026</li>
                <li>• <strong>Times:</strong> Every 2 hours (10:00 AM - 8:00 PM)</li>
                <li>• <strong>Booking:</strong> Select shuttle option during registration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Windhoek */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title">Explore {venue.city}</h2>
            <p className="section-subtitle">
              Make the most of your visit with these local attractions
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {attractions.map((attraction) => (
                <div key={attraction} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCoffee className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">{attraction}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/faq" className="text-primary-600 font-medium hover:underline">
                More questions? Check our FAQ →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
