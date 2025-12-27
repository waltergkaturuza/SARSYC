/**
 * EmptyState Component
 * Displays a friendly message when there's no data to show
 */

import { ReactNode } from 'react'
import { FiInbox, FiSearch, FiFileText, FiUsers, FiCalendar, FiImage } from 'react-icons/fi'

type IconType = 'inbox' | 'search' | 'file' | 'users' | 'calendar' | 'image'

interface EmptyStateProps {
  icon?: IconType | ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    href?: string
  }
  className?: string
}

const iconMap: Record<IconType, React.ComponentType<{ className?: string }>> = {
  inbox: FiInbox,
  search: FiSearch,
  file: FiFileText,
  users: FiUsers,
  calendar: FiCalendar,
  image: FiImage,
}

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon as IconType] : null
  const CustomIcon = typeof icon !== 'string' ? icon : null

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        {IconComponent && <IconComponent className="w-10 h-10 text-gray-400" />}
        {CustomIcon && <div className="w-10 h-10 text-gray-400">{CustomIcon}</div>}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-6">{description}</p>
      
      {action && (
        <a
          href={action.href}
          onClick={action.onClick}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}

