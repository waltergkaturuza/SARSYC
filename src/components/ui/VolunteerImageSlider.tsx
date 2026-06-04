'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const slides = [
  { src: '/Volunteer/Volunteers.jpg', alt: 'SARSYC volunteers at the conference' },
  { src: '/Volunteer/Volunteera2.jpg', alt: 'Volunteers supporting SARSYC VI' },
  { src: '/Volunteer/volunteers3.jpg', alt: 'Volunteer team at SARSYC' },
  { src: '/Volunteer/VOL4.jpg', alt: 'SARSYC VI volunteer activities' },
]

const INTERVAL_MS = 5000

export default function VolunteerImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] lg:h-full rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 bg-gray-100">
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          aria-hidden={index !== activeIndex}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            quality={90}
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      ))}

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'w-6 bg-white shadow' : 'w-2 bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Show volunteer photo ${index + 1} of ${slides.length}`}
            aria-current={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
