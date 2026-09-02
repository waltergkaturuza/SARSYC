'use client'

import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const slides = [
  {
    number: '1',
    title: 'Connect',
    description:
      'Network with 500+ young leaders, researchers, policymakers, development partners, and the private sector from across Southern Africa.',
    badgeClass: 'bg-gradient-primary text-white',
  },
  {
    number: '2',
    title: 'Learn',
    description:
      'Engage with cutting-edge research, best practices, and innovative solutions in youth health and education.',
    badgeClass: 'bg-gradient-secondary text-white',
  },
  {
    number: '3',
    title: 'Act',
    description:
      'Develop actionable strategies and commitments to drive real change in youth health and education outcomes.',
    badgeClass: 'bg-gradient-accent text-gray-900',
  },
]

const INTERVAL_MS = 5000

export default function ConnectLearnActSlider() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [paused])

  const goTo = (index: number) => setActiveIndex(index)
  const prev = () => setActiveIndex((i) => (i - 1 + slides.length) % slides.length)
  const next = () => setActiveIndex((i) => (i + 1) % slides.length)

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false)
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-xl min-h-[180px]">
        {slides.map((item, index) => (
          <div
            key={item.number}
            className={`p-5 md:p-6 transition-opacity duration-500 ${
              index === activeIndex
                ? 'relative opacity-100'
                : 'pointer-events-none absolute inset-0 opacity-0'
            }`}
            role="group"
            aria-roledescription="slide"
            aria-hidden={index !== activeIndex}
            aria-label={`${item.number}. ${item.title}`}
          >
            <div
              className={`w-10 h-10 ${item.badgeClass} rounded-lg flex items-center justify-center text-xl font-bold mb-3 shadow-lg`}
            >
              {item.number}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-primary-300 mb-2">{item.title}</h3>
            <p className="text-sm md:text-base text-white/75 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={prev}
          className="rounded-lg border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Connect Learn Act slides">
          {slides.map((item, index) => (
            <button
              key={item.number}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show ${item.title}`}
              onClick={() => goTo(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex ? 'w-7 bg-amber-400' : 'w-2.5 bg-white/35 hover:bg-white/55'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          className="rounded-lg border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          aria-label="Next slide"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
