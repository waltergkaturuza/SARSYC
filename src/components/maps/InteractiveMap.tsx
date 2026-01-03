'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiMap, FiLayers, FiMaximize2, FiNavigation } from 'react-icons/fi'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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
}

interface InteractiveMapProps {
  venue: VenueLocation
  className?: string
  height?: string
  showControls?: boolean
}

type MapLayer = 'street' | 'satellite' | 'terrain' | 'hybrid'

// Component to handle map layer changes
function MapLayerController({ layer }: { layer: MapLayer }) {
  const map = useMap()
  const [tileLayer, setTileLayer] = useState<L.TileLayer | null>(null)
  const [overlayLayer, setOverlayLayer] = useState<L.TileLayer | null>(null)

  useEffect(() => {
    // Remove existing layers
    if (tileLayer) {
      map.removeLayer(tileLayer)
    }
    if (overlayLayer) {
      map.removeLayer(overlayLayer)
    }

    let newTileLayer: L.TileLayer | null = null
    let newOverlayLayer: L.TileLayer | null = null

    // Add new layer based on selection
    switch (layer) {
      case 'satellite':
        newTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 20,
          minZoom: 1,
          crossOrigin: true,
        })
        newTileLayer.addTo(map)
        break
      case 'terrain':
        newTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenTopoMap',
          maxZoom: 20,
          minZoom: 1,
          subdomains: ['a', 'b', 'c'],
          crossOrigin: true,
        })
        newTileLayer.addTo(map)
        break
      case 'hybrid':
        // Hybrid: Satellite with labels overlay
        newTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 20,
          minZoom: 1,
          crossOrigin: true,
        })
        newTileLayer.addTo(map)
        
        newOverlayLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 20,
          minZoom: 1,
          opacity: 0.7,
          crossOrigin: true,
        })
        newOverlayLayer.addTo(map)
        break
      default: // street
        newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 20,
          minZoom: 1,
          subdomains: ['a', 'b', 'c'],
          crossOrigin: true,
        })
        newTileLayer.addTo(map)
    }

    setTileLayer(newTileLayer)
    setOverlayLayer(newOverlayLayer)

    // Force a redraw to ensure tiles load
    setTimeout(() => {
      map.invalidateSize()
      if (newTileLayer) {
        newTileLayer.redraw()
      }
    }, 100)
  }, [map, layer])

  return null
}

// Component to handle zoom changes
function ZoomController({ zoom }: { zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setZoom(zoom)
  }, [map, zoom])

  return null
}

// Component to handle map initialization
function MapInitializer() {
  const map = useMap()

  useEffect(() => {
    // Ensure map is properly sized and tiles load
    const initializeMap = () => {
      map.invalidateSize()
      
      // Force tile reload after delays to ensure they load
      setTimeout(() => {
        map.invalidateSize()
        map.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            layer.redraw()
          }
        })
      }, 200)
      
      setTimeout(() => {
        map.invalidateSize()
      }, 500)
    }

    initializeMap()
    
    // Also invalidate on window resize
    window.addEventListener('resize', initializeMap)
    
    return () => {
      window.removeEventListener('resize', initializeMap)
    }
  }, [map])

  return null
}

export default function InteractiveMap({
  venue,
  className = '',
  height = '600px',
  showControls = true,
}: InteractiveMapProps) {
  const [currentLayer, setCurrentLayer] = useState<MapLayer>('street')
  const [zoomLevel, setZoomLevel] = useState(venue.zoomLevel || 15)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const layers: { value: MapLayer; label: string }[] = [
    { value: 'street', label: 'Street Map' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'terrain', label: 'Terrain' },
    { value: 'hybrid', label: 'Hybrid' },
  ]

  const handleOpenInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof window === 'undefined') {
    return (
      <div
        className={`bg-gray-200 rounded-2xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 w-full"
        style={{ height, minHeight: '400px', position: 'relative' }}
      >
        <MapContainer
          center={[venue.latitude, venue.longitude]}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          maxZoom={20}
          minZoom={1}
          zoomControl={true}
          whenReady={(map) => {
            // Ensure map is properly sized when ready
            setTimeout(() => {
              map.target.invalidateSize()
            }, 100)
            setTimeout(() => {
              map.target.invalidateSize()
            }, 500)
          }}
        >
          {/* Default TileLayer - shown initially, then replaced by MapLayerController */}
          {currentLayer === 'street' && (
            <TileLayer
              key="default-street"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              subdomains={['a', 'b', 'c']}
              maxZoom={20}
              minZoom={1}
            />
          )}
          
          <MapLayerController layer={currentLayer} />
          <ZoomController zoom={zoomLevel} />
          <MapInitializer />

          <Marker
            position={[venue.latitude, venue.longitude]}
            icon={L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-gray-900 mb-1">{venue.venueName}</h3>
                {venue.conferenceEdition && (
                  <p className="text-xs text-gray-600 mb-1">{venue.conferenceEdition}</p>
                )}
                {venue.address && (
                  <p className="text-sm text-gray-700 mb-1">{venue.address}</p>
                )}
                <p className="text-xs text-gray-500">
                  {venue.city}, {venue.country}
                </p>
                {venue.description && (
                  <p className="text-xs text-gray-600 mt-2">{venue.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          {/* Layer Selector */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <div className="flex items-center gap-2 mb-2 px-2">
              <FiLayers className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Map Type</span>
            </div>
            <div className="flex flex-col gap-1">
              {layers.map((layer) => (
                <button
                  key={layer.value}
                  onClick={() => setCurrentLayer(layer.value)}
                  className={`px-3 py-1.5 text-xs rounded transition-all text-left ${
                    currentLayer === layer.value
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <div className="flex items-center gap-2 mb-2 px-2">
              <FiMap className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Zoom</span>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 20))}
                className="px-3 py-1.5 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Zoom In
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 1))}
                className="px-3 py-1.5 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Zoom Out
              </button>
              <div className="px-3 py-1 text-xs text-gray-600 text-center border-t border-gray-200 mt-1 pt-1">
                Level: {zoomLevel}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <button
              onClick={handleDirections}
              className="w-full px-3 py-2 text-xs rounded bg-primary-600 text-white hover:bg-primary-700 transition-all flex items-center justify-center gap-2 mb-1"
            >
              <FiNavigation className="w-4 h-4" />
              Get Directions
            </button>
            <button
              onClick={handleOpenInMaps}
              className="w-full px-3 py-2 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <FiMaximize2 className="w-4 h-4" />
              Open in Maps
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

