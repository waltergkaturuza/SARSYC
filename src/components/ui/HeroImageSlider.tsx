'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const slides = [
  {
    src: '/homepage-hero-team.jpg',
    alt: 'SARSYC VI participants at a regional conference',
  },
  {
    src: '/SARSYC Homepage3.jpg',
    alt: 'SARSYC youth delegates celebrating at a regional conference',
  },
]

const INTERVAL_MS = 6000

export default function HeroImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] overflow-hidden shadow-2xl lg:shadow-md lg:rounded-l-3xl ring-1 ring-gray-200/80 lg:ring-gray-200 bg-white">
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
            quality={95}
            className="object-contain object-center lg:object-left"
            sizes="(max-width: 1024px) 100vw, 56vw"
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
              index === activeIndex ? 'w-6 bg-primary-600' : 'w-2 bg-gray-400/80 hover:bg-gray-500'
            }`}
            aria-label={`Show slide ${index + 1} of ${slides.length}`}
            aria-current={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
