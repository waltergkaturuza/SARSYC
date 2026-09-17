'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export type OrathonFlyerSlide = {
  src: string
  alt: string
}

const FALLBACK_SLIDES: OrathonFlyerSlide[] = [
  {
    src: '/orathon/zimbabwe.png',
    alt: 'Orathon 2026 Zimbabwe flyer',
  },
  {
    src: '/orathon/namibia.png',
    alt: 'Orathon 2026 Namibia flyer',
  },
]

const INTERVAL_MS = 5000

type OrathonFlyerSliderProps = {
  className?: string
  slides?: OrathonFlyerSlide[]
}

function isUsableSrc(src: string): boolean {
  if (!src) return false
  if (src.includes('/api/media/file/')) return false
  return true
}

export default function OrathonFlyerSlider({
  className = '',
  slides,
}: OrathonFlyerSliderProps) {
  const sanitize = (list: OrathonFlyerSlide[]) =>
    list.filter((s) => isUsableSrc(s.src))

  const initial = sanitize(slides && slides.length > 0 ? slides : FALLBACK_SLIDES)
  const [items, setItems] = useState(initial.length > 0 ? initial : FALLBACK_SLIDES)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const next = sanitize(slides && slides.length > 0 ? slides : FALLBACK_SLIDES)
    setItems(next.length > 0 ? next : FALLBACK_SLIDES)
    setActiveIndex(0)
  }, [slides])

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [items.length])

  const handleImageError = (failedSrc: string) => {
    setItems((prev) => {
      const remaining = prev.filter((s) => s.src !== failedSrc)
      if (remaining.length > 0) return remaining
      return FALLBACK_SLIDES
    })
  }

  if (items.length === 0) {
    return (
      <div
        className={`relative w-full aspect-[3/4] max-h-[640px] rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 bg-slate-950 flex items-center justify-center text-white/70 text-sm ${className}`.trim()}
      >
        Flyer coming soon
      </div>
    )
  }

  return (
    <div
      className={`relative w-full aspect-[3/4] max-h-[640px] rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 bg-slate-950 ${className}`.trim()}
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
            unoptimized
            onError={() => handleImageError(slide.src)}
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
