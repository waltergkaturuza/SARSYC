'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const slides = [
  {
    src: '/home-new/HOMEPAGE.jpg',
    alt: 'SARSYC conference homepage highlight',
  },
  {
    src: '/home-new/hmp.jpg',
    alt: 'SARSYC participants and partners',
  },
  {
    src: '/home-new/webforlifepostvi.jpg',
    alt: 'Web for Life Post VI campaign visual',
  },
]

const INTERVAL_MS = 6000

type HeroImageSliderProps = {
  className?: string
}

export default function HeroImageSlider({ className = '' }: HeroImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className={`relative w-full h-full min-h-[280px] overflow-hidden bg-slate-900/30 ${className}`.trim()}
    >
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
            quality={100}
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 60vw"
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
              index === activeIndex ? 'w-6 bg-primary-400' : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Show slide ${index + 1} of ${slides.length}`}
            aria-current={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
