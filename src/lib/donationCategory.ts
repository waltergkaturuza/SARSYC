import { conferenceTrackLabel } from '@/lib/conferenceTracks'

export function buildDonationCategoryDisplay(params: {
  type: 'donation' | 'sponsorship'
  sponsorshipCategory?: 'package' | 'track' | null
  sponsorshipTierName?: string | null
  conferenceTrack?: string | null
  trackSponsorshipMode?: 'students' | 'custom_amount' | null
  studentsSponsored?: number | null
}): string {
  if (params.type === 'donation') return 'General support'

  if (params.sponsorshipCategory === 'track') {
    const track = conferenceTrackLabel(params.conferenceTrack)
    if (params.trackSponsorshipMode === 'students' && params.studentsSponsored && params.studentsSponsored > 0) {
      return `Track sponsorship: ${track} (${params.studentsSponsored} students)`
    }
    return `Track sponsorship: ${track}`
  }

  if (params.sponsorshipTierName) {
    return `Sponsorship: ${params.sponsorshipTierName}`
  }

  return 'Sponsorship'
}

export function donationCategorySlug(params: {
  type: 'donation' | 'sponsorship'
  sponsorshipCategory?: 'package' | 'track' | null
}): string {
  if (params.type === 'donation') return 'general'
  if (params.sponsorshipCategory === 'track') return 'track_sponsorship'
  return 'package_sponsorship'
}
