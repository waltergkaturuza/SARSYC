import type { Payload } from 'payload'
import { getCountryLabel } from '@/lib/countries'
import { slateToPlainText } from '@/lib/newsContent'
import { getMediaDisplayUrl } from '@/lib/mediaDisplayUrl'
import {
  steeringCommitteeSadcCountries,
  youthSteeringCommitteeMembers,
  type YouthSteeringCommitteeMember,
} from '@/lib/youthSteeringCommitteeMembers'
import { seedYouthSteeringCommitteeFromStatic } from '@/lib/seedYouthSteeringCommittee'

export type DisplayYouthSteeringMember = YouthSteeringCommitteeMember & {
  id?: string | number
}

let seedAttemptedThisInstance = false

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

async function ensureSeededIfEmpty(payload: Payload): Promise<void> {
  if (seedAttemptedThisInstance) return
  seedAttemptedThisInstance = true

  try {
    const existing = await payload.find({
      collection: 'youth-steering-committee',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) return

    console.log('Youth steering committee is empty — seeding from governance static list...')
    const result = await seedYouthSteeringCommitteeFromStatic(payload)
    console.log('Youth steering committee seed result:', {
      created: result.created.length,
      skipped: result.skipped.length,
      errors: result.errors.length,
    })
  } catch (error) {
    console.error('Auto-seed youth steering committee failed:', error)
  }
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
    await ensureSeededIfEmpty(payload)

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
