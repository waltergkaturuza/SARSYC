'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export type OrathonFlyerSlide = {
  src: string
  alt: string
}

const FALLBACK_SLIDES: OrathonFlyerSlide[] = [
  {
    src: '/orathon/Orathon Flyer Harare 02 (1).png',
    alt: 'Orathon 2026 Harare flyer',
  },
  {
    src: '/orathon/Orathon Flyer Namibia.rv02 (1).png',
    alt: 'Orathon 2026 Namibia flyer',
  },
]

const INTERVAL_MS = 5000

type OrathonFlyerSliderProps = {
  className?: string
  slides?: OrathonFlyerSlide[]
}

export default function OrathonFlyerSlider({
  className = '',
  slides,
}: OrathonFlyerSliderProps) {
  const items = slides && slides.length > 0 ? slides : FALLBACK_SLIDES
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [items.length])

  useEffect(() => {
    setActiveIndex(0)
  }, [items.length])

  return (
    <div
      className={`relative w-full aspect-[3/4] max-h-[640px] rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 bg-gray-100 ${className}`.trim()}
    >
      {items.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
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
            className="object-contain object-center bg-slate-950"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={slide.src.startsWith('http')}
          />
        </div>
      ))}

      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {items.map((slide, index) => (
            <button
              key={`${slide.src}-dot-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-white shadow' : 'w-2 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Show Orathon flyer ${index + 1} of ${items.length}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
