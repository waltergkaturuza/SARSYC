'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const cultureNightImages = [
  {
    src: '/night culture/Culturenight1.jpg',
    alt: 'SARSYC culture night celebration',
  },
  {
    src: '/night culture/Culture Night.jpg',
    alt: 'Culture night performances at SARSYC',
  },
  {
    src: '/night culture/culture night4.jpg',
    alt: 'Southern African cultural celebration at SARSYC',
  },
]

export default function CultureNightImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % cultureNightImages.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const goTo = (index: number) => {
    setActiveIndex((index + cultureNightImages.length) % cultureNightImages.length)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-gray-100">
        {cultureNightImages.map((image, index) => (
          <div
            key={image.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
              priority={index === 0}
            />
          </div>
        ))}

        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent p-4">
          <p className="text-white text-sm font-semibold">Culture Night Highlights</p>
          <p className="text-white/80 text-xs">Southern African music, dance, and arts</p>
        </div>

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
      </div>

      <div className="flex items-center justify-center gap-2 p-4">
        {cultureNightImages.map((image, index) => (
          <button
            key={`${image.src}-dot`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex ? 'w-8 bg-primary-600' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Show image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
