'use client'

import { FiDownload, FiImage, FiFileText, FiInfo } from 'react-icons/fi'
import Image from 'next/image'
import Link from 'next/link'

const mediaAssets = [
  {
    name: 'SARSYC VI Logo',
    description: 'High-resolution logo in PNG format',
    format: 'PNG',
    size: '2.5 MB',
    download: '/partners/saywhat logo (1).png', // Use actual logo when available
  },
  {
    name: 'Conference Brand Guidelines',
    description: 'Complete brand guidelines including colors, fonts, and usage',
    format: 'PDF',
    size: '1.8 MB',
    download: '#',
  },
  {
    name: 'Press Kit Fact Sheet',
    description: 'Quick reference fact sheet with key conference information',
    format: 'PDF',
    size: '500 KB',
    download: '#',
  },
  {
    name: 'Conference Photos',
    description: 'High-resolution photos from past editions',
    format: 'ZIP',
    size: '45 MB',
    download: '#',
  },
]

export default function MediaKitPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Media Kit
            </h1>
            <p className="text-xl text-white/90">
              Download logos, fact sheets, and media resources
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <FiInfo className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Media Kit Usage Guidelines</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    These resources are provided for media use in covering SARSYC VI. Please:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Use logos and materials in accordance with our brand guidelines</li>
                    <li>Credit SAYWHAT/SARSYC when using images or content</li>
                    <li>Do not alter logos or modify colors without permission</li>
                    <li>Contact us for custom media requests or interviews</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {mediaAssets.map((asset, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {asset.format === 'PNG' || asset.format === 'ZIP' ? (
                          <FiImage className="w-6 h-6 text-primary-600" />
                        ) : (
                          <FiFileText className="w-6 h-6 text-primary-600" />
                        )}
                        <h3 className="text-xl font-bold text-gray-900">{asset.name}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{asset.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Format: {asset.format}</span>
                        <span>Size: {asset.size}</span>
                      </div>
                    </div>
                    <a
                      href={asset.download}
                      download
                      className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                      <FiDownload className="w-5 h-5" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 card p-8 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Additional Resources?</h3>
              <p className="text-gray-600 mb-4">
                For custom media requests, interview opportunities, or high-resolution images, please contact our communications team.
              </p>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Media Contact</p>
                <p className="text-primary-600">
                  <a href="mailto:saywhat@mweb.co.zw" className="hover:underline">
                    saywhat@mweb.co.zw
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}



