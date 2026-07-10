'use client'

import { useState } from 'react'
import { FiFacebook, FiTwitter, FiLinkedin, FiMail, FiLink } from 'react-icons/fi'
import { SiWhatsapp, SiTiktok } from 'react-icons/si'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
  showLabel?: boolean
}

export default function ShareButtons({
  url,
  title,
  description = '',
  className = '',
  showLabel = true,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const fullUrl =
    typeof window !== 'undefined'
      ? url.startsWith('http')
        ? url
        : `${window.location.origin}${url}`
      : url

  const shareText = description ? `${title}\n\n${description}` : title

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://x.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}&hashtags=SARSYCVI`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${fullUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description ? `${description}\n\n` : ''}${fullUrl}`)}`,
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      window.prompt('Copy this link:', fullUrl)
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: description || title, url: fullUrl })
        return
      } catch {
        // User cancelled or share failed — fall back to copy.
      }
    }
    await copyLink()
  }

  const handleTikTokShare = async () => {
    await copyLink()
  }

  const buttonClass =
    'w-10 h-10 rounded-full text-white flex items-center justify-center transition-all hover:scale-110'

  return (
    <div className={className}>
      {showLabel && <span className="text-sm font-medium text-gray-700 mr-3">Share:</span>}

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}
          aria-label="Share on Facebook"
        >
          <FiFacebook className="w-5 h-5" />
        </a>

        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-sky-500 hover:bg-sky-600`}
          aria-label="Share on X (Twitter)"
        >
          <FiTwitter className="w-5 h-5" />
        </a>

        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-blue-700 hover:bg-blue-800`}
          aria-label="Share on LinkedIn"
        >
          <FiLinkedin className="w-5 h-5" />
        </a>

        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-green-500 hover:bg-green-600`}
          aria-label="Share on WhatsApp"
        >
          <SiWhatsapp className="w-5 h-5" />
        </a>

        <button
          type="button"
          onClick={handleTikTokShare}
          className={`${buttonClass} bg-black hover:bg-gray-800`}
          aria-label="Copy link for TikTok"
          title="Copy link for TikTok"
        >
          <SiTiktok className="w-5 h-5" />
        </button>

        <a
          href={shareLinks.email}
          className={`${buttonClass} bg-gray-500 hover:bg-gray-600`}
          aria-label="Share via Email"
        >
          <FiMail className="w-5 h-5" />
        </a>

        <button
          type="button"
          onClick={() => copyLink()}
          className={`${buttonClass} bg-gray-200 text-gray-700 hover:bg-gray-300`}
          aria-label="Copy link"
        >
          <FiLink className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNativeShare}
          className={`${buttonClass} bg-primary-600 hover:bg-primary-700`}
          aria-label="Share using device menu"
        >
          <span className="text-xs font-semibold">···</span>
        </button>

        {copied && (
          <span className="text-sm text-green-600 font-medium" role="status">
            Link copied!
          </span>
        )}
      </div>
    </div>
  )
}
