'use client'

import { FiTwitter, FiLinkedin, FiGlobe } from 'react-icons/fi'

interface SocialLinksProps {
  twitter?: string | null
  linkedin?: string | null
  website?: string | null
  variant?: 'card' | 'profile'
}

export default function SocialLinks({ twitter, linkedin, website, variant = 'card' }: SocialLinksProps) {
  if (!twitter && !linkedin && !website) {
    return null
  }

  const getTwitterUrl = (handle: string) => {
    if (handle.startsWith('http://') || handle.startsWith('https://')) {
      return handle
    }
    return `https://twitter.com/${handle.replace('@', '')}`
  }

  const getGenericUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  if (variant === 'profile') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Connect:</p>
        {twitter && (
          <a
            href={getTwitterUrl(twitter)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 hover:text-sky-500 transition-colors cursor-pointer"
          >
            <FiTwitter className="w-5 h-5" />
            <span className="text-sm">{twitter}</span>
          </a>
        )}
        {linkedin && (
          <a
            href={getGenericUrl(linkedin)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <FiLinkedin className="w-5 h-5" />
            <span className="text-sm">LinkedIn</span>
          </a>
        )}
        {website && (
          <a
            href={getGenericUrl(website)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
          >
            <FiGlobe className="w-5 h-5" />
            <span className="text-sm">Website</span>
          </a>
        )}
      </div>
    )
  }

  // Card variant (for listing page)
  return (
    <div className="flex gap-3 pt-2 border-t border-gray-100 relative z-20">
      {twitter && (
        <a
          href={getTwitterUrl(twitter)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary-600 transition-colors cursor-pointer relative z-20 p-1 -m-1"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <FiTwitter className="w-5 h-5" />
        </a>
      )}
      {linkedin && (
        <a
          href={getGenericUrl(linkedin)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary-600 transition-colors cursor-pointer relative z-20 p-1 -m-1"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <FiLinkedin className="w-5 h-5" />
        </a>
      )}
      {website && (
        <a
          href={getGenericUrl(website)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary-600 transition-colors cursor-pointer relative z-20 p-1 -m-1"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <FiGlobe className="w-5 h-5" />
        </a>
      )}
    </div>
  )
}

