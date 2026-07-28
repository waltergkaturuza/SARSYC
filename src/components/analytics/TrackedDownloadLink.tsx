'use client'

import { FiDownload } from 'react-icons/fi'
import { trackEvent } from '@/components/analytics/AnalyticsTracker'

type Props = {
  href: string
  label: string
  className?: string
  source?: string
}

export default function TrackedDownloadLink({
  href,
  label,
  className,
  source = 'news-download',
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={className}
      onClick={() =>
        trackEvent('download', {
          fileName: label,
          source,
          label,
        })
      }
    >
      <FiDownload className="w-5 h-5" />
      {label}
    </a>
  )
}
