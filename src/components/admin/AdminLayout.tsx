'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, FiUsers, FiFileText, FiMic, FiCalendar, 
  FiFolder, FiMessageSquare, FiHeart, FiSettings,
  FiMenu, FiX, FiLogOut, FiSearch
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
    name: 'Settings',
    href: '/admin/settings',
    icon: FiSettings,
    description: 'Site configuration',
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              S6
            </div>
            <div>
              <div className="font-bold text-gray-900">SARSYC VI</div>
              <div className="text-xs text-gray-500">Admin Panel</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
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

