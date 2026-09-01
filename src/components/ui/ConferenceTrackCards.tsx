'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiCheck } from 'react-icons/fi'

export type ConferenceTrack = {
  number: string
  title: string
  description: string
  color: string
  textColor: string
  topics?: string[]
}

function WritingPen({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex align-middle ml-0.5 animate-pulse ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-[1em] w-[1em] drop-shadow-sm" fill="none">
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
  )
}

function TypeWithPen({
  text,
  active,
  speed = 22,
  className = '',
  as: Tag = 'span',
  onDone,
}: {
  text: string
  active: boolean
  speed?: number
  className?: string
  as?: 'span' | 'p' | 'h3'
  onDone?: () => void
}) {
  const [count, setCount] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!active) {
      setCount(0)
      doneRef.current = false
      return
    }
    if (count >= text.length) {
      if (!doneRef.current) {
        doneRef.current = true
        onDone?.()
      }
      return
    }
    const timer = window.setTimeout(() => setCount((c) => c + 1), speed)
    return () => window.clearTimeout(timer)
  }, [active, count, text, speed, onDone])

  const writing = active && count < text.length

  return (
    <Tag className={className}>
      {text.slice(0, count)}
      {writing ? <WritingPen /> : null}
    </Tag>
  )
}

function TrackCard({
  track,
  index,
  showTopics,
  showExploreLink,
  titleSizeClass,
  cardPaddingClass,
  detailed,
}: {
  track: ConferenceTrack
  index: number
  showTopics?: boolean
  showExploreLink?: boolean
  titleSizeClass: string
  cardPaddingClass: string
  detailed?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'title' | 'description' | 'topics' | 'done'>('idle')
  const [topicIndex, setTopicIndex] = useState(0)

  useEffect(() => {
    const node = cardRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const start = window.setTimeout(() => setPhase('title'), index * 120)
    return () => window.clearTimeout(start)
  }, [visible, index])

  const onTitleDone = useCallback(() => setPhase('description'), [])
  const onDescriptionDone = useCallback(() => {
    if (showTopics && track.topics && track.topics.length > 0) {
      setPhase('topics')
      setTopicIndex(0)
    } else {
      setPhase('done')
    }
  }, [showTopics, track.topics])

  const onTopicDone = useCallback(() => {
    const topics = track.topics || []
    setTopicIndex((current) => {
      if (current + 1 >= topics.length) {
        window.setTimeout(() => setPhase('done'), 0)
        return current
      }
      return current + 1
    })
  }, [track.topics])

  const titleTyping = phase === 'title'
  const titleDone = phase === 'description' || phase === 'topics' || phase === 'done'
  const descriptionTyping = phase === 'description'
  const descriptionDone = phase === 'topics' || phase === 'done'

  const body = (
    <>
      <div
        className={`inline-block bg-gradient-to-r ${track.color} text-white text-sm font-bold px-3 py-1 rounded-full mb-4`}
      >
        Track {track.number}
      </div>

      {titleDone ? (
        <h3 className={`${titleSizeClass} font-bold mb-3 ${track.textColor}`}>{track.title}</h3>
      ) : (
        <TypeWithPen
          as="h3"
          text={track.title}
          active={titleTyping}
          speed={28}
          className={`${titleSizeClass} font-bold mb-3 ${track.textColor} min-h-[1.5em]`}
          onDone={onTitleDone}
        />
      )}

      {descriptionDone ? (
        <p className={`text-justify leading-relaxed ${track.textColor} ${showTopics ? 'mb-6' : ''}`}>
          {track.description}
        </p>
      ) : (
        <TypeWithPen
          as="p"
          text={track.description}
          active={descriptionTyping}
          speed={16}
          className={`text-justify leading-relaxed ${track.textColor} ${showTopics ? 'mb-6' : ''} min-h-[3em]`}
          onDone={onDescriptionDone}
        />
      )}

      {showTopics && track.topics && (phase === 'topics' || phase === 'done') && (
        <div className="space-y-2">
          <p className={`text-sm font-semibold mb-2 ${track.textColor}`}>Key Topics:</p>
          <ul className={detailed ? 'grid md:grid-cols-2 gap-2' : 'space-y-2'}>
            {track.topics.map((topic, i) => {
              const reveal = phase === 'done' || i < topicIndex
              const typing = phase === 'topics' && i === topicIndex
              if (!reveal && !typing) return null
              return (
                <li key={topic} className={`text-sm flex items-start ${track.textColor}`}>
                  {detailed ? (
                    <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  ) : (
                    <span className="mr-2 mt-1">•</span>
                  )}
                  {typing ? (
                    <TypeWithPen text={topic} active speed={14} className="flex-1" onDone={onTopicDone} />
                  ) : (
                    <span className="flex-1">{topic}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {showExploreLink && phase === 'done' && (
        <Link
          href={`/programme?track=${track.number}`}
          className={`inline-flex items-center gap-2 font-medium hover:gap-3 transition-all mt-6 ${track.textColor}`}
        >
          Explore Track {track.number}
          <FiArrowRight className="w-4 h-4" />
        </Link>
      )}
    </>
  )

  return (
    <div
      ref={cardRef}
      className={`group relative card overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white/95 backdrop-blur-sm ${cardPaddingClass} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {detailed ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div
            className={`w-24 h-24 bg-gradient-to-br ${track.color} rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0`}
          >
            {track.number}
          </div>
          <div className="flex-1 min-w-0">{body}</div>
        </div>
      ) : (
        body
      )}
    </div>
  )
}

type ConferenceTrackCardsProps = {
  tracks: ConferenceTrack[]
  variant?: 'grid' | 'stack'
  showTopics?: boolean
  showExploreLink?: boolean
  detailed?: boolean
}

export default function ConferenceTrackCards({
  tracks,
  variant = 'grid',
  showTopics = false,
  showExploreLink = false,
  detailed = false,
}: ConferenceTrackCardsProps) {
  const gridClass =
    variant === 'stack' ? 'grid gap-8' : 'grid md:grid-cols-2 gap-5 md:gap-8'

  return (
    <div className={gridClass}>
      {tracks.map((track, index) => (
        <TrackCard
          key={track.number}
          track={track}
          index={index}
          showTopics={showTopics}
          showExploreLink={showExploreLink}
          detailed={detailed}
          titleSizeClass={detailed ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}
          cardPaddingClass={detailed ? 'p-8 lg:p-10' : 'p-5 md:p-8'}
        />
      ))}
    </div>
  )
}
