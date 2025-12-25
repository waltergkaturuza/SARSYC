import { FiMapPin, FiHome, FiCoffee, FiInfo } from 'react-icons/fi'
import Link from 'next/link'

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

export default function VenuePage() {
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
              Everything you need to know about visiting Windhoek, Namibia
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
                  Windhoek International Convention Centre
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  A state-of-the-art facility in the heart of Windhoek, equipped with modern conference amenities
                  and accessibility features.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Address</div>
                      <div className="text-gray-600">123 Independence Avenue<br />Windhoek, Namibia</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiInfo className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Facilities</div>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Main plenary hall (capacity: 600)</li>
                        <li>• 4 breakout rooms (capacity: 100 each)</li>
                        <li>• Exhibition area</li>
                        <li>• WiFi throughout</li>
                        <li>• Wheelchair accessible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                  <div className="text-center text-white">
                    <FiMapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Interactive Map</p>
                    <p className="text-sm opacity-75 mt-2">Google Maps integration coming soon</p>
                  </div>
                </div>
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
            We've negotiated special rates with these hotels for SARSYC VI participants
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
            <h2 className="section-title">Getting to Windhoek</h2>

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
            <h2 className="section-title">Explore Windhoek</h2>
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

