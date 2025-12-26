import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  FiEdit, FiArrowLeft, FiMail, FiPhone, FiMapPin, FiBriefcase, 
  FiCheckCircle, FiXCircle, FiClock, FiDownload, FiCalendar,
  FiUser, FiGlobe, FiHome, FiShield, FiPlane, FiHeart, FiFileText,
  FiImage, FiPaperclip
} from 'react-icons/fi'
import Image from 'next/image'
import { format } from 'date-fns'
import RegistrationActionButtons from '@/components/admin/RegistrationActionButtons'

export const revalidate = 0

interface RegistrationDetailPageProps {
  params: {
    id: string
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  waived: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
}

const securityColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  cleared: 'bg-green-100 text-green-800',
  flagged: 'bg-red-100 text-red-800',
}

const visaStatusColors: Record<string, string> = {
  'not-applied': 'bg-gray-100 text-gray-800',
  'applied-pending': 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  denied: 'bg-red-100 text-red-800',
}

const categoryLabels: Record<string, string> = {
  student: 'Student/Youth Delegate',
  researcher: 'Young Researcher',
  policymaker: 'Policymaker/Government Official',
  partner: 'Development Partner',
  observer: 'Observer',
}

const genderLabels: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  'prefer-not-to-say': 'Prefer not to say',
}

const idTypeLabels: Record<string, string> = {
  'national-id': 'National ID',
  'drivers-license': 'Driver\'s License',
  other: 'Other Government ID',
}

export default async function RegistrationDetailPage({ params }: RegistrationDetailPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const registration = await payload.findByID({
      collection: 'registrations',
      id: params.id,
      depth: 2,
    })

    return (
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/registrations" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Registrations</span>
          </Link>
          <div className="flex gap-3">
            <Link href={`/admin/registrations/${params.id}/edit`} className="btn-primary flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit Registration
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Registration Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80 mb-1">Registration ID</div>
                    <div className="text-2xl font-bold font-mono">{registration.registrationId || 'N/A'}</div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-4">
                  {registration.firstName} {registration.lastName}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[registration.status] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {registration.status?.charAt(0).toUpperCase() + registration.status?.slice(1) || 'Pending'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    paymentColors[registration.paymentStatus] || 'bg-gray-100 text-gray-800'
                  }`}>
                    Payment: {registration.paymentStatus?.charAt(0).toUpperCase() + registration.paymentStatus?.slice(1) || 'Pending'}
                  </span>
                  {registration.securityCheckStatus && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      securityColors[registration.securityCheckStatus] || 'bg-gray-100 text-gray-800'
                    }`}>
                      Security: {registration.securityCheckStatus?.replace('-', ' ')?.charAt(0).toUpperCase() + registration.securityCheckStatus?.replace('-', ' ')?.slice(1) || 'Pending'}
                    </span>
                  )}
                  {registration.isInternational && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      International
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FiUser className="w-6 h-6" />
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiMail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="font-medium text-gray-900 break-words">{registration.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiPhone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500 mb-1">Phone</div>
                    <div className="font-medium text-gray-900">{registration.phone || 'N/A'}</div>
                  </div>
                </div>

                {registration.dateOfBirth && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(registration.dateOfBirth), 'PPP')}
                      </div>
                    </div>
                  </div>
                )}

                {registration.gender && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <FiUser className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500 mb-1">Gender</div>
                      <div className="font-medium text-gray-900">
                        {genderLabels[registration.gender] || registration.gender}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiGlobe className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500 mb-1">Country of Residence</div>
                    <div className="font-medium text-gray-900">{registration.country || 'N/A'}</div>
                  </div>
                </div>

                {registration.nationality && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <FiGlobe className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500 mb-1">Nationality</div>
                      <div className="font-medium text-gray-900">{registration.nationality}</div>
                    </div>
                  </div>
                )}

                {registration.city && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <FiMapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500 mb-1">City</div>
                      <div className="font-medium text-gray-900">{registration.city}</div>
                    </div>
                  </div>
                )}

                {registration.address && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <FiHome className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500 mb-1">Full Address</div>
                      <div className="font-medium text-gray-900 whitespace-pre-wrap">{registration.address}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FiBriefcase className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500 mb-1">Organization</div>
                    <div className="font-medium text-gray-900 break-words">{registration.organization || 'N/A'}</div>
                  </div>
                </div>

                {registration.organizationPosition && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <FiBriefcase className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500 mb-1">Position/Title</div>
                      <div className="font-medium text-gray-900">{registration.organizationPosition}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Identity Documents */}
            {(registration.isInternational || registration.nationalIdNumber) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiFileText className="w-6 h-6" />
                  Identity Documents
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registration.isInternational && (
                    <>
                      {registration.passportNumber && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Passport Number</div>
                          <div className="font-medium text-gray-900 font-mono">{registration.passportNumber}</div>
                        </div>
                      )}
                      {registration.passportExpiry && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Passport Expiry</div>
                          <div className="font-medium text-gray-900">
                            {format(new Date(registration.passportExpiry), 'PPP')}
                          </div>
                        </div>
                      )}
                      {registration.passportIssuingCountry && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Issuing Country</div>
                          <div className="font-medium text-gray-900">{registration.passportIssuingCountry}</div>
                        </div>
                      )}
                      {registration.passportScan && (
                        <div className="p-4 bg-gray-50 rounded-lg md:col-span-3">
                          <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                            <FiImage className="w-4 h-4" />
                            Passport Scan/Copy
                          </div>
                          {typeof registration.passportScan === 'object' && registration.passportScan.url ? (
                            <div className="mt-2">
                              <a
                                href={registration.passportScan.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-2"
                              >
                                <FiPaperclip className="w-4 h-4" />
                                {registration.passportScan.mimeType === 'application/pdf' 
                                  ? 'View Passport Scan (PDF)' 
                                  : 'View Passport Scan'}
                              </a>
                              {registration.passportScan.mimeType?.startsWith('image/') && (
                                <div className="mt-3 max-w-md">
                                  <Image
                                    src={registration.passportScan.url}
                                    alt="Passport Scan"
                                    width={600}
                                    height={400}
                                    className="rounded-lg border border-gray-300"
                                  />
                                </div>
                              )}
                              {registration.passportScan.filename && (
                                <div className="text-xs text-gray-500 mt-1">
                                  File: {registration.passportScan.filename}
                                </div>
                              )}
                            </div>
                          ) : typeof registration.passportScan === 'string' ? (
                            <div className="mt-2">
                              <a
                                href={registration.passportScan}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                              >
                                <FiPaperclip className="w-4 h-4" />
                                View Passport Scan
                              </a>
                            </div>
                          ) : (
                            <div className="text-gray-500 italic">No passport scan uploaded</div>
                          )}
                        </div>
                      )}
                      {registration.visaRequired && (
                        <>
                          {registration.visaStatus && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Visa Status</div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                visaStatusColors[registration.visaStatus] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {registration.visaStatus?.replace('-', ' ')?.split(' ')?.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || registration.visaStatus}
                              </span>
                            </div>
                          )}
                          {registration.visaApplicationDate && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Visa Application Date</div>
                              <div className="font-medium text-gray-900">
                                {format(new Date(registration.visaApplicationDate), 'PPP')}
                              </div>
                            </div>
                          )}
                          {registration.visaNumber && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-500 mb-1">Visa Number</div>
                              <div className="font-medium text-gray-900 font-mono">{registration.visaNumber}</div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {!registration.isInternational && registration.nationalIdNumber && (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">National ID Number</div>
                        <div className="font-medium text-gray-900 font-mono">{registration.nationalIdNumber}</div>
                      </div>
                      {registration.nationalIdType && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">ID Type</div>
                          <div className="font-medium text-gray-900">
                            {idTypeLabels[registration.nationalIdType] || registration.nationalIdType}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Next of Kin / Emergency Contact */}
            {(registration.emergencyContactName || registration.emergencyContactPhone) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiUser className="w-6 h-6" />
                  Next of Kin / Emergency Contact
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registration.emergencyContactName && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Full Name</div>
                      <div className="font-medium text-gray-900">{registration.emergencyContactName}</div>
                    </div>
                  )}
                  {registration.emergencyContactRelationship && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Relationship</div>
                      <div className="font-medium text-gray-900 capitalize">
                        {typeof registration.emergencyContactRelationship === 'string' 
                          ? registration.emergencyContactRelationship.replace(/-/g, ' ')
                          : registration.emergencyContactRelationship}
                      </div>
                    </div>
                  )}
                  {registration.emergencyContactPhone && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                      <div className="font-medium text-gray-900">{registration.emergencyContactPhone}</div>
                    </div>
                  )}
                  {registration.emergencyContactEmail && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Email Address</div>
                      <div className="font-medium text-gray-900 break-words">{registration.emergencyContactEmail}</div>
                    </div>
                  )}
                  {registration.emergencyContactAddress && (
                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-2 lg:col-span-3">
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <FiHome className="w-4 h-4" />
                        Full Home Address
                      </div>
                      <div className="font-medium text-gray-900 whitespace-pre-wrap">{registration.emergencyContactAddress}</div>
                    </div>
                  )}
                  {(registration.emergencyContactCity || registration.emergencyContactCountry) && (
                    <>
                      {registration.emergencyContactCity && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">City</div>
                          <div className="font-medium text-gray-900">{registration.emergencyContactCity}</div>
                        </div>
                      )}
                      {registration.emergencyContactCountry && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Country</div>
                          <div className="font-medium text-gray-900">{registration.emergencyContactCountry}</div>
                        </div>
                      )}
                      {registration.emergencyContactPostalCode && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Postal/ZIP Code</div>
                          <div className="font-medium text-gray-900">{registration.emergencyContactPostalCode}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Travel Information */}
            {(registration.arrivalDate || registration.departureDate || registration.flightNumber || registration.accommodationRequired) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiPlane className="w-6 h-6" />
                  Travel Information
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registration.arrivalDate && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Arrival Date</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(registration.arrivalDate), 'PPP')}
                      </div>
                    </div>
                  )}
                  {registration.departureDate && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Departure Date</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(registration.departureDate), 'PPP')}
                      </div>
                    </div>
                  )}
                  {registration.flightNumber && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Flight Number</div>
                      <div className="font-medium text-gray-900 font-mono">{registration.flightNumber}</div>
                    </div>
                  )}
                  {registration.travelInsuranceProvider && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Travel Insurance Provider</div>
                      <div className="font-medium text-gray-900">{registration.travelInsuranceProvider}</div>
                    </div>
                  )}
                  {registration.travelInsurancePolicyNumber && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Travel Insurance Policy Number</div>
                      <div className="font-medium text-gray-900 font-mono">{registration.travelInsurancePolicyNumber}</div>
                    </div>
                  )}
                  {registration.travelInsuranceExpiry && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Travel Insurance Expiry</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(registration.travelInsuranceExpiry), 'PPP')}
                      </div>
                    </div>
                  )}
                  {registration.visaInvitationLetterRequired !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-3">
                      <div className="text-sm text-gray-500 mb-1">Visa Invitation Letter Required</div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        registration.visaInvitationLetterRequired 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {registration.visaInvitationLetterRequired ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {registration.accommodationRequired && (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg md:col-span-3">
                        <div className="text-sm text-gray-500 mb-1">Accommodation Required</div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Yes
                        </span>
                      </div>
                      {registration.accommodationPreferences && (
                        <div className="p-4 bg-gray-50 rounded-lg md:col-span-3">
                          <div className="text-sm text-gray-500 mb-1">Accommodation Preferences</div>
                          <div className="font-medium text-gray-900 whitespace-pre-wrap">{registration.accommodationPreferences}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Health & Insurance */}
            {(registration.hasHealthInsurance || registration.medicalConditions || registration.bloodType) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiHeart className="w-6 h-6" />
                  Health & Insurance
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registration.hasHealthInsurance && (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Health Insurance</div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Yes
                        </span>
                      </div>
                      {registration.insuranceProvider && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Insurance Provider</div>
                          <div className="font-medium text-gray-900">{registration.insuranceProvider}</div>
                        </div>
                      )}
                      {registration.insurancePolicyNumber && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Policy Number</div>
                          <div className="font-medium text-gray-900 font-mono">{registration.insurancePolicyNumber}</div>
                        </div>
                      )}
                    </>
                  )}
                  {registration.bloodType && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Blood Type</div>
                      <div className="font-medium text-gray-900 uppercase">
                        {registration.bloodType?.replace('-', '').replace('positive', '+').replace('negative', '-')}
                      </div>
                    </div>
                  )}
                  {registration.medicalConditions && (
                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-3">
                      <div className="text-sm text-gray-500 mb-1">Medical Conditions/Allergies</div>
                      <div className="font-medium text-gray-900 whitespace-pre-wrap">{registration.medicalConditions}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Check */}
            {registration.securityCheckStatus && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FiShield className="w-6 h-6" />
                  Security Check
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      securityColors[registration.securityCheckStatus] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {registration.securityCheckStatus?.replace('-', ' ')?.split(' ')?.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || registration.securityCheckStatus}
                    </span>
                  </div>
                  {registration.securityCheckNotes && (
                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Notes</div>
                      <div className="font-medium text-gray-900 whitespace-pre-wrap">{registration.securityCheckNotes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Registration Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Details</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Participation Category</div>
                  <div className="font-medium text-gray-900">
                    {categoryLabels[registration.category] || registration.category || 'N/A'}
                  </div>
                </div>

                {registration.dietaryRestrictions && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Dietary Restrictions</div>
                    <div className="font-medium text-gray-900">
                      {Array.isArray(registration.dietaryRestrictions)
                        ? registration.dietaryRestrictions.join(', ')
                        : registration.dietaryRestrictions}
                    </div>
                  </div>
                )}

                {registration.tshirtSize && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">T-Shirt Size</div>
                    <div className="font-medium text-gray-900 uppercase">{registration.tshirtSize}</div>
                  </div>
                )}

                {registration.accessibilityNeeds && (
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-3">
                    <div className="text-sm text-gray-500 mb-1">Accessibility Requirements</div>
                    <div className="font-medium text-gray-900 whitespace-pre-wrap">{registration.accessibilityNeeds}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Actions</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Registration Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[registration.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {registration.status === 'confirmed' && <FiCheckCircle className="w-4 h-4 mr-1" />}
                      {registration.status === 'cancelled' && <FiXCircle className="w-4 h-4 mr-1" />}
                      {registration.status === 'pending' && <FiClock className="w-4 h-4 mr-1" />}
                      {registration.status?.charAt(0).toUpperCase() + registration.status?.slice(1) || 'Pending'}
                    </span>
                  </div>
                  <RegistrationActionButtons 
                    registrationId={registration.id} 
                    status={registration.status || 'pending'}
                  />
                </div>

                {registration.notes && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500 mb-2">Admin Notes</div>
                    <div className="text-gray-900 whitespace-pre-wrap">{registration.notes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Tracking</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registration ID:</span>
                  <code className="px-3 py-1 bg-white border border-gray-300 rounded font-mono text-sm font-bold text-primary-600">
                    {registration.registrationId || 'N/A'}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {registration.createdAt ? format(new Date(registration.createdAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {registration.updatedAt ? format(new Date(registration.updatedAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                {registration.deletedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Deleted:</span>
                    <span className="text-sm font-medium text-red-600">
                      {format(new Date(registration.deletedAt), 'PPpp')}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-white rounded border border-primary-200">
                <p className="text-sm text-gray-700">
                  <strong>Applicants can track their registration</strong> using the Registration ID shown above. 
                  They can use this ID on the public website to check their application status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
