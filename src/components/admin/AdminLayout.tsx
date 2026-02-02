'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, FiUsers, FiFileText, FiMic, FiCalendar, 
  FiFolder, FiMessageSquare, FiHeart, FiSettings, FiShield,
  FiMenu, FiX, FiLogOut, FiSearch, FiChevronLeft, FiChevronRight,
  FiAward, FiActivity, FiMail, FiInbox
} from 'react-icons/fi'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: FiHome,
    description: 'Overview and stats',
  },
  {
    name: 'Registrations',
    href: '/admin/registrations',
    icon: FiUsers,
    description: 'Manage participants',
  },
  {
    name: 'Abstracts',
    href: '/admin/abstracts',
    icon: FiFileText,
    description: 'Review submissions',
  },
  {
    name: 'Speakers',
    href: '/admin/speakers',
    icon: FiMic,
    description: 'Manage speakers',
  },
  {
    name: 'Youth Steering Committee',
    href: '/admin/youth-steering-committee',
    icon: FiUsers,
    description: 'Manage committee members',
  },
  {
    name: 'Sessions',
    href: '/admin/sessions',
    icon: FiCalendar,
    description: 'Programme schedule',
  },
  {
    name: 'Resources',
    href: '/admin/resources',
    icon: FiFolder,
    description: 'Upload materials',
  },
  {
    name: 'News',
    href: '/admin/news',
    icon: FiMessageSquare,
    description: 'Publish articles',
  },
  {
    name: 'Partners',
    href: '/admin/partners',
    icon: FiHeart,
    description: 'Manage sponsors',
  },
  {
    name: 'Sponsorship Tiers',
    href: '/admin/sponsorship-tiers',
    icon: FiAward,
    description: 'Manage pricing tiers',
  },
  {
    name: 'Partnership Inquiries',
    href: '/admin/partnership-inquiries',
    icon: FiHeart,
    description: 'Partnership requests',
  },
  {
    name: 'Newsletter Subscribers',
    href: '/admin/newsletter-subscriptions',
    icon: FiMail,
    description: 'Email subscribers',
  },
  {
    name: 'Contact Messages',
    href: '/admin/contact-messages',
    icon: FiInbox,
    description: 'Contact form submissions',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: FiShield,
    description: 'Manage admin users',
  },
  {
    name: 'Audit Trail',
    href: '/admin/audit-logs',
    icon: FiActivity,
    description: 'System activity logs',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: FiSettings,
    description: 'Site configuration',
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile only
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Desktop: closed by default

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true')
    }
  }, [])

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('admin-sidebar-collapsed', String(newState))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-primary-600/30">
              S6
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <div className="font-bold text-gray-900 whitespace-nowrap text-lg">SARSYC VI</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">Admin Panel</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-all hover:scale-110"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <FiChevronRight className="w-6 h-6" /> : <FiChevronLeft className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 min-h-0">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg transition-all group relative ${
                    sidebarCollapsed ? 'justify-center px-4 py-4' : 'px-4 py-3.5'
                  } ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className={`font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </div>
                      <div className={`text-xs truncate whitespace-nowrap ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-300">{item.description}</div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-gray-200 p-3 flex-shrink-0">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all group relative ${
              sidebarCollapsed ? 'justify-center px-4 py-4' : 'px-4 py-3.5'
            }`}
            title={sidebarCollapsed ? 'Back to Site' : undefined}
          >
            <FiLogOut className="w-6 h-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap">Back to Site</span>}
            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                Back to Site
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-96">
              <FiSearch className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">Admin User</div>
              <div className="text-xs text-gray-500">admin@sarsyc.org</div>
            </div>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

