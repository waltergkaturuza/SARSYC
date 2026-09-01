'use client'

import { useEffect, useRef, useState } from 'react'

export type ConferenceTrack = {
  number: string
  title: string
  description: string
  color: string
  textColor: string
}

function PenStroke({ active, delayMs }: { active: boolean; delayMs: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-5 bottom-3 h-8 overflow-visible" aria-hidden>
      <svg viewBox="0 0 320 28" className="h-full w-full" preserveAspectRatio="none">
        <path
          className={`track-pen-stroke ${active ? 'is-drawn' : ''}`}
          d="M8 18 C 48 8, 88 24, 128 14 S 208 6, 248 16 S 300 22, 312 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          pathLength={1}
          style={{ animationDelay: `${delayMs}ms` }}
        />
      </svg>
      <span
        className={`track-pen-tip ${active ? 'is-drawn' : ''}`}
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 drop-shadow-sm" fill="none">
          <path
            d="M14.5 4.5l5 5L9 20H4v-5L14.5 4.5z"
            fill="#1e3a5f"
            stroke="#0f172a"
            strokeWidth="1"
          />
          <path d="M13 6l5 5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 20l3-1" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  )
}

function TrackCard({
  track,
  index,
  visible,
}: {
  track: ConferenceTrack
  index: number
  visible: boolean
}) {
  const delayMs = index * 180

  return (
    <div
      className={`group relative card overflow-hidden p-5 pb-10 hover:shadow-2xl transition-all duration-500 bg-white/95 backdrop-blur-sm ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div
        className={`inline-block bg-gradient-to-r ${track.color} text-white text-sm font-bold px-3 py-1 rounded-full mb-4`}
      >
        Track {track.number}
      </div>
      <h3 className={`relative text-xl font-bold mb-3 inline-block max-w-full ${track.textColor}`}>
        {track.title}
        <span
          className={`track-title-underline ${visible ? 'is-drawn' : ''}`}
          style={{ animationDelay: `${delayMs + 120}ms` }}
          aria-hidden
        />
      </h3>
      <p className={`text-justify leading-relaxed ${track.textColor}`}>
        {track.description}
      </p>
      <div className={`${track.textColor} opacity-70 group-hover:opacity-100 transition-opacity`}>
        <PenStroke active={visible} delayMs={delayMs + 200} />
      </div>
    </div>
  )
}

export default function ConferenceTrackCards({ tracks }: { tracks: ConferenceTrack[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="grid md:grid-cols-2 gap-5">
      {tracks.map((track, index) => (
        <TrackCard key={track.number} track={track} index={index} visible={visible} />
      ))}
    </div>
  )
}
