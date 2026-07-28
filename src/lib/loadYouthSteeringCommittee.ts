import type { Payload } from 'payload'
import { getCountryLabel } from '@/lib/countries'
import { slateToPlainText } from '@/lib/newsContent'
import { getMediaDisplayUrl } from '@/lib/mediaDisplayUrl'
import {
  steeringCommitteeSadcCountries,
  youthSteeringCommitteeMembers,
  type YouthSteeringCommitteeMember,
} from '@/lib/youthSteeringCommitteeMembers'

export type DisplayYouthSteeringMember = YouthSteeringCommitteeMember & {
  id?: string | number
}

function normalizeCmsMember(doc: any): DisplayYouthSteeringMember {
  const countryRaw = typeof doc.country === 'string' ? doc.country : ''
  const countryFromCode = getCountryLabel(countryRaw)
  // Prefer the human label when countryRaw was a code; otherwise keep the label as stored.
  const country =
    countryFromCode && countryFromCode !== countryRaw ? countryFromCode : countryRaw || countryFromCode

  return {
    id: doc.id,
    name: doc.name || '',
    role: doc.role || '',
    organization: doc.organization || '',
    country,
    bio: slateToPlainText(doc.bio),
    photo: getMediaDisplayUrl(doc.photo) || '',
  }
}

export function countriesMissingMembers(members: Array<{ country: string }>): string[] {
  const withMembers = new Set(members.map((m) => m.country))
  return steeringCommitteeSadcCountries.filter((c) => !withMembers.has(c))
}

/**
 * Load Youth Steering Committee members for public pages.
 * Prefers CMS data; falls back to the static governance list when the DB is empty/unavailable.
 */
export async function loadYouthSteeringCommitteeForPublic(payload: Payload): Promise<{
  members: DisplayYouthSteeringMember[]
  countriesWithoutMembers: string[]
  source: 'cms' | 'static'
}> {
  try {
    const result = await payload.find({
      collection: 'youth-steering-committee',
      limit: 200,
      sort: 'order',
      depth: 1,
      overrideAccess: true,
    })

    if (result.docs.length > 0) {
      const members = result.docs
        .map(normalizeCmsMember)
        .filter((m: DisplayYouthSteeringMember) => Boolean(m.name))
      return {
        members,
        countriesWithoutMembers: countriesMissingMembers(members),
        source: 'cms',
      }
    }
  } catch (error) {
    console.error('Failed to load youth steering committee from CMS:', error)
  }

  return {
    members: youthSteeringCommitteeMembers,
    countriesWithoutMembers: countriesMissingMembers(youthSteeringCommitteeMembers),
    source: 'static',
  }
}
