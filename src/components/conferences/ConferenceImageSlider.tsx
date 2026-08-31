'use client'

import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { ConferenceGallerySlide } from '@/lib/conferenceMedia'

type Props = {
  images: ConferenceGallerySlide[]
  title?: string
  className?: string
  aspectClassName?: string
}

export default function ConferenceImageSlider({
  images,
  title,
  className = '',
  aspectClassName = 'aspect-[16/10]',
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const count = images.length
  const multi = count > 1

  useEffect(() => {
    setActiveIndex(0)
  }, [images])

  useEffect(() => {
    if (!multi) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [multi, count])

  if (count === 0) return null

  const goTo = (index: number) => {
    setActiveIndex((index + count) % count)
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className={`relative ${aspectClassName} bg-slate-100`}>
        {images.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        {title && (
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent p-4">
            <p className="text-white text-sm font-semibold">{title}</p>
          </div>
        )}

        {multi && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-md transition hover:bg-white"
              aria-label="Previous image"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow-md transition hover:bg-white"
              aria-label="Next image"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {(multi || images[activeIndex]?.caption) && (
        <div className="flex flex-col items-center gap-2 p-3">
          {images[activeIndex]?.caption && (
            <p className="text-sm text-gray-600 text-center">{images[activeIndex].caption}</p>
          )}
          {multi && (
            <div className="flex items-center justify-center gap-2">
              {images.map((image, index) => (
                <button
                  key={`${image.src}-dot-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex ? 'w-8 bg-primary-600' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Show image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
