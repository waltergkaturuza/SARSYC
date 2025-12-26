import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { 
  FiSettings, FiSave, FiGlobe, FiMail, FiCalendar, FiMapPin 
} from 'react-icons/fi'

export const revalidate = 0

export default async function SettingsPage() {
  const payload = await getPayloadClient()

  // Fetch site settings
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-1">Configure global site settings and conference information</p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-8">
          {/* Conference Info */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <FiCalendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Conference Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conference Name</label>
                <input
                  type="text"
                  defaultValue={siteSettings?.conferenceName || 'SARSYC VI'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <input
                  type="text"
                  defaultValue={siteSettings?.theme || 'Align for Action'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  defaultValue={siteSettings?.startDate || '2026-08-05'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  defaultValue={siteSettings?.endDate || '2026-08-07'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Venue Info */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <FiMapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Venue Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                <input
                  type="text"
                  defaultValue="Windhoek International Convention Centre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  defaultValue="Windhoek"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  defaultValue="Namibia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  defaultValue="123 Independence Avenue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <FiMail className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  defaultValue={siteSettings?.contactEmail || 'info@sarsyc.org'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={siteSettings?.contactPhone || '+264 61 123 4567'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  defaultValue="support@sarsyc.org"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Email</label>
                <input
                  type="email"
                  defaultValue="registration@sarsyc.org"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <FiGlobe className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  defaultValue="https://www.facebook.com/SARSYC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  defaultValue="https://www.instagram.com/sarsyc2026/"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">X (Twitter)</label>
                <input
                  type="url"
                  defaultValue="https://x.com/SARSYC2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                <input
                  type="url"
                  defaultValue="https://www.tiktok.com/@sarsyc2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <button className="btn-primary flex items-center gap-2">
              <FiSave className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Changes to these settings will affect the entire website. 
          Make sure to review carefully before saving.
        </p>
      </div>
    </div>
  )
}


