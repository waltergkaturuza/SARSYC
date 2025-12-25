'use client'

import { FiFacebook, FiTwitter, FiLinkedin, FiMail, FiLink } from 'react-icons/fi'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
}

export default function ShareButtons({ url, title, description = '', className = '' }: ShareButtonsProps) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://x.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}&hashtags=SARSYCVI`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${fullUrl}`)}`,
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Share:</span>
      
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110"
        aria-label="Share on Facebook"
      >
        <FiFacebook className="w-5 h-5" />
      </a>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-all hover:scale-110"
        aria-label="Share on Twitter"
      >
        <FiTwitter className="w-5 h-5" />
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-all hover:scale-110"
        aria-label="Share on LinkedIn"
      >
        <FiLinkedin className="w-5 h-5" />
      </a>

      <a
        href={shareLinks.email}
        className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-all hover:scale-110"
        aria-label="Share via Email"
      >
        <FiMail className="w-5 h-5" />
      </a>

      <button
        onClick={handleCopyLink}
        className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-all hover:scale-110"
        aria-label="Copy link"
      >
        <FiLink className="w-5 h-5" />
      </button>
    </div>
  )
}

