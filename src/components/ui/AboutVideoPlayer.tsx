'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiMaximize,
  FiMinimize,
  FiPause,
  FiPlay,
  FiVolume2,
  FiVolumeX,
  FiSkipBack,
  FiSkipForward,
} from 'react-icons/fi'

export type VideoQualitySource = {
  label: string
  src: string
}

type AboutVideoPlayerProps = {
  sources: VideoQualitySource[]
  title?: string
  className?: string
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AboutVideoPlayer({
  sources,
  title = 'SARSYC documentary',
  className = '',
}: AboutVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const resumeRef = useRef<{ time: number; playing: boolean } | null>(null)
  const [qualityIndex, setQualityIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showQuality, setShowQuality] = useState(false)

  const activeSource = sources[qualityIndex] ?? sources[0]

  const play = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      await video.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTime = () => setCurrentTime(video.currentTime)
    const onMeta = () => {
      setDuration(video.duration || 0)
      const resume = resumeRef.current
      if (resume) {
        video.currentTime = resume.time
        resumeRef.current = null
        if (resume.playing) void play()
      }
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    video.addEventListener('timeupdate', onTime)
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('durationchange', onMeta)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    void play()

    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('durationchange', onMeta)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [play, activeSource?.src])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void play()
    else video.pause()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const seekBy = (delta: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), video.duration || 0)
  }

  const onSeek = (value: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value
    setCurrentTime(value)
  }

  const changeQuality = (index: number) => {
    const video = videoRef.current
    if (video) {
      resumeRef.current = { time: video.currentTime, playing: !video.paused }
    }
    setQualityIndex(index)
    setShowQuality(false)
  }

  const toggleFullscreen = async () => {
    const el = containerRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) await el.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      // Fullscreen may be blocked by the browser
    }
  }

  if (!activeSource) return null

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl ${className}`}
    >
      <video
        key={activeSource.src}
        ref={videoRef}
        src={activeSource.src}
        className="aspect-video w-full object-cover bg-black"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={title}
        onClick={togglePlay}
      />

      {muted && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-3 right-3 z-20 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/80"
        >
          Tap for sound
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-3 pt-10 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="mb-2 h-1.5 w-full cursor-pointer accent-amber-400"
          aria-label="Seek"
        />

        <div className="flex flex-wrap items-center gap-2 text-white">
          <button
            type="button"
            onClick={togglePlay}
            className="rounded-lg p-2 hover:bg-white/15"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => seekBy(-10)}
            className="rounded-lg p-2 hover:bg-white/15"
            aria-label="Rewind 10 seconds"
          >
            <FiSkipBack className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => seekBy(10)}
            className="rounded-lg p-2 hover:bg-white/15"
            aria-label="Forward 10 seconds"
          >
            <FiSkipForward className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="rounded-lg p-2 hover:bg-white/15"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <FiVolumeX className="h-5 w-5" /> : <FiVolume2 className="h-5 w-5" />}
          </button>

          <span className="ml-1 text-xs text-white/80 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="relative ml-auto flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => sources.length > 1 && setShowQuality((v) => !v)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:bg-white/15"
                aria-haspopup="listbox"
                aria-expanded={showQuality}
                disabled={sources.length < 2}
              >
                {activeSource.label}
              </button>
              {showQuality && sources.length > 1 && (
                <ul
                  role="listbox"
                  className="absolute bottom-full right-0 mb-1 min-w-[5.5rem] overflow-hidden rounded-lg border border-white/15 bg-slate-900/95 py-1 shadow-xl backdrop-blur-md"
                >
                  {sources.map((source, index) => (
                    <li key={source.src}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === qualityIndex}
                        onClick={() => changeQuality(index)}
                        className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 ${
                          index === qualityIndex ? 'font-semibold text-amber-300' : 'text-white'
                        }`}
                      >
                        {source.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-lg p-2 hover:bg-white/15"
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <FiMinimize className="h-5 w-5" /> : <FiMaximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
