'use client'

import { useState, useEffect } from 'react'
import { FiMapPin, FiHome, FiCoffee, FiInfo, FiLoader } from 'react-icons/fi'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const InteractiveMap = dynamic(() => import('@/components/maps/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 rounded-2xl flex items-center justify-center" style={{ height: '500px' }}>
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})
import { showToast } from '@/lib/toast'

const hotels = [
  {
    name: 'Movenpick Hotel Windhoek',
    category: '5-Star',
    distance: 'Approx. 7 km from NIPAM',
    price: 'Check latest rates',
    features: ['City views', 'Restaurant', 'Conference-friendly'],
    bookingUrl: 'https://all.accor.com/hotel/B1Q8/index.en.shtml',
  },
  {
    name: 'Mercure Hotel Windhoek',
    category: '4-Star',
    distance: 'Approx. 7 km from NIPAM',
    price: 'Check latest rates',
    features: ['Pool', 'Restaurant', 'Business facilities'],
    bookingUrl: 'https://all.accor.com/hotel/B1R0/index.en.shtml',
  },
  {
    name: 'Hilton Windhoek',
    category: '5-Star',
    distance: 'Approx. 5 km from NIPAM',
    price: 'Check latest rates',
    features: ['Rooftop pool', 'Gym', 'Central location'],
    bookingUrl: 'https://www.hilton.com/en/hotels/wdhhitw-hilton-windhoek/',
  },
]

const attractions = [
  {
    name: 'Namibia Craft Centre',
    link: 'https://www.tripadvisor.com/Attraction_Review-g293821-d1507535-Reviews-Namibia_Craft_Centre-Windhoek_Khomas_Region.html',
  },
  {
    name: 'National Museum of Namibia',
    link: 'https://www.tripadvisor.com/Attraction_Review-g293821-d2113555-Reviews-National_Museum_of_Namibia-Windhoek_Khomas_Region.html',
  },
  {
    name: 'Christuskirche (Christ Church)',
    link: 'https://en.wikipedia.org/wiki/Christuskirche,_Windhoek',
  },
  {
    name: 'Independence Memorial Museum',
    link: 'https://en.wikipedia.org/wiki/Independence_Memorial_Museum',
  },
  {
    name: "Joe's Beerhouse",
    link: 'https://www.tripadvisor.com/Restaurant_Review-g293821-d798877-Reviews-Joe_s_Beerhouse-Windhoek_Khomas_Region.html',
  },
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
            venueName: 'Namibia Institute of Public Administration and Management (NIPAM)',
            city: 'Windhoek',
            country: 'Namibia',
            address: 'Paul Nash Street, Khomasdal, Windhoek, Namibia',
            latitude: -22.6025484,
            longitude: 17.0922144,
            zoomLevel: 15,
            conferenceEdition: 'SARSYC VI',
            description: 'NIPAM is the official SARSYC VI venue, offering modern training and conference facilities in Windhoek.',
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
        venueName: 'Namibia Institute of Public Administration and Management (NIPAM)',
        city: 'Windhoek',
        country: 'Namibia',
        address: 'Paul Nash Street, Khomasdal, Windhoek, Namibia',
        latitude: -22.6025484,
        longitude: 17.0922144,
        zoomLevel: 15,
        conferenceEdition: 'SARSYC VI',
        description: 'NIPAM is the official SARSYC VI venue, offering modern training and conference facilities in Windhoek.',
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
      <section className="bg-slate-800 text-white py-8 md:py-10">
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

              {/* Venue Map */}
              <div className="w-full h-[600px] lg:h-[700px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4369.209186741202!2d17.092214375301378!3d-22.602548379470328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1c0b1ad1fb90430b%3A0xc22a1c3456400167!2sNamibian%20Institute%20Of%20Public%20Administration%20And%20Management!5e1!3m2!1sen!2szw!4v1783587513593!5m2!1sen!2szw"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="rounded-2xl"
                  title="NIPAM location map"
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

                <a
                  href={hotel.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-sm inline-flex items-center justify-center"
                >
                  Book Now
                </a>
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
                    <li>• No conference-organized shuttle service; use taxis, ride-hailing, or hotel-arranged transfers</li>
                    <li>• Taxi to city center: ~$30-40 USD</li>
                    <li>• Car rental available at airport</li>
                  </ul>
                </div>
              </div>
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
                <a
                  key={attraction.name}
                  href={attraction.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCoffee className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">{attraction.name}</span>
                </a>
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
