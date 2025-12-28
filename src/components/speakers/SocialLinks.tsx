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

  if (variant === 'profile') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Connect:</p>
        {twitter && (
          <a
            href={`https://twitter.com/${twitter.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 hover:text-sky-500 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(`https://twitter.com/${twitter.replace('@', '')}`, '_blank', 'noopener,noreferrer')
            }}
          >
            <FiTwitter className="w-5 h-5" />
            <span className="text-sm">{twitter}</span>
          </a>
        )}
        {linkedin && (
          <a
            href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const url = linkedin.startsWith('http') ? linkedin : `https://${linkedin}`
              window.open(url, '_blank', 'noopener,noreferrer')
            }}
          >
            <FiLinkedin className="w-5 h-5" />
            <span className="text-sm">LinkedIn</span>
          </a>
        )}
        {website && (
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const url = website.startsWith('http') ? website : `https://${website}`
              window.open(url, '_blank', 'noopener,noreferrer')
            }}
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
          href={`https://twitter.com/${twitter.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary-600 transition-colors cursor-pointer relative z-20"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            window.open(`https://twitter.com/${twitter.replace('@', '')}`, '_blank', 'noopener,noreferrer')
          }}
        >
          <FiTwitter className="w-5 h-5" />
        </a>
      )}
      {linkedin && (
        <a
          href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary-600 transition-colors cursor-pointer relative z-20"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const url = linkedin.startsWith('http') ? linkedin : `https://${linkedin}`
            window.open(url, '_blank', 'noopener,noreferrer')
          }}
        >
          <FiLinkedin className="w-5 h-5" />
        </a>
      )}
      {website && (
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary-600 transition-colors cursor-pointer relative z-20"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const url = website.startsWith('http') ? website : `https://${website}`
            window.open(url, '_blank', 'noopener,noreferrer')
          }}
        >
          <FiGlobe className="w-5 h-5" />
        </a>
      )}
    </div>
  )
}

