import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'
import type { Payload } from 'payload'
import { youthSteeringCommitteeMembers } from '@/lib/youthSteeringCommitteeMembers'
import { getCountryCodeByLabel } from '@/lib/countries'
import { plainTextToSlate } from '@/lib/newsContent'
import { createMediaFromBlobUrl } from '@/lib/createMediaFromUrl'
import { getSiteBaseUrl } from '@/lib/siteUrl'
import { ensureYouthSteeringCommitteeLatestColumns } from '@/lib/ensureYouthSteeringCommitteeSchema'

function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return 'image/jpeg'
}

function payloadErrorMessage(error: any): string {
  if (!error) return 'Unknown error'
  if (typeof error.message === 'string' && error.message) {
    const dataErrors = error.data?.errors || error.errors
    if (Array.isArray(dataErrors) && dataErrors.length > 0) {
      return `${error.message}: ${dataErrors
        .map((e: any) => e.message || e.path || JSON.stringify(e))
        .join('; ')}`
    }
    return error.message
  }
  return String(error)
}

async function loadPhotoBuffer(photoPath: string): Promise<{ buffer: Buffer; filename: string } | null> {
  const relative = photoPath.replace(/^\//, '')
  const filename = path.basename(relative)
  const localPath = path.join(process.cwd(), 'public', relative)

  if (fs.existsSync(localPath)) {
    return { buffer: fs.readFileSync(localPath), filename }
  }

  // Production deploys may not include every public asset on disk — fetch from the live site.
  const base = getSiteBaseUrl()
  try {
    const response = await fetch(`${base}/${relative}`)
    if (!response.ok) {
      console.warn(`Committee photo fetch ${base}/${relative} → ${response.status}`)
      return null
    }
    const arrayBuffer = await response.arrayBuffer()
    return { buffer: Buffer.from(arrayBuffer), filename }
  } catch (error) {
    console.warn(`Failed to fetch committee photo ${relative}:`, error)
    return null
  }
}

async function uploadCommitteePhoto(photoPath: string): Promise<string | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.warn('BLOB_READ_WRITE_TOKEN missing — creating members without Blob photos')
    return null
  }

  const loaded = await loadPhotoBuffer(photoPath)
  if (!loaded) return null

  const blob = await put(`YouthSteeringCommittee/photos/${loaded.filename}`, loaded.buffer, {
    access: 'public',
    token,
    contentType: mimeFromFilename(loaded.filename),
    addRandomSuffix: true,
  })

  return blob.url
}

export type SeedYouthSteeringCommitteeResult = {
  created: Array<{ id: string | number; name: string; hasPhoto: boolean }>
  skipped: Array<{ name: string; reason: string }>
  errors: Array<{ name: string; error: string }>
  totalStatic: number
}

async function createMember(
  payload: Payload,
  member: (typeof youthSteeringCommitteeMembers)[number],
  index: number,
  photoId?: string,
) {
  const countryCode = getCountryCodeByLabel(member.country)
  return payload.create({
    collection: 'youth-steering-committee',
    data: {
      name: member.name,
      role: member.role,
      organization: member.organization,
      country: countryCode,
      bio: plainTextToSlate(member.bio),
      photo: photoId ? Number(photoId) || photoId : undefined,
      featured: true,
      order: index + 1,
      socialMedia: {
        twitter: '',
        linkedin: '',
        website: '',
      },
    },
    overrideAccess: true,
  })
}

/**
 * Idempotent seed: insert hardcoded governance-page committee members into Payload.
 * Skips any member whose name already exists in the collection.
 */
export async function seedYouthSteeringCommitteeFromStatic(
  payload: Payload,
): Promise<SeedYouthSteeringCommitteeResult> {
  await ensureYouthSteeringCommitteeLatestColumns(payload)

  const existing = await payload.find({
    collection: 'youth-steering-committee',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const existingNames = new Set(
    existing.docs.map((doc: any) => String(doc.name || '').trim().toLowerCase()),
  )

  const created: SeedYouthSteeringCommitteeResult['created'] = []
  const skipped: SeedYouthSteeringCommitteeResult['skipped'] = []
  const errors: SeedYouthSteeringCommitteeResult['errors'] = []

  for (let index = 0; index < youthSteeringCommitteeMembers.length; index++) {
    const member = youthSteeringCommitteeMembers[index]
    const nameKey = member.name.trim().toLowerCase()

    if (existingNames.has(nameKey)) {
      skipped.push({ name: member.name, reason: 'already exists' })
      continue
    }

    try {
      let photoId: string | undefined
      let hasPhoto = false

      if (member.photo) {
        try {
          const blobUrl = await uploadCommitteePhoto(member.photo)
          if (blobUrl) {
            photoId = await createMediaFromBlobUrl(
              payload,
              blobUrl,
              `Youth Steering Committee member photo: ${member.name}`,
            )
            hasPhoto = Boolean(photoId)
          }
        } catch (photoError: any) {
          console.warn(`Photo import failed for ${member.name}:`, photoError)
        }
      }

      let doc
      try {
        doc = await createMember(payload, member, index, photoId)
      } catch (createError: any) {
        // Retry without photo if the photo FK/column is the problem.
        if (photoId) {
          console.warn(`Create with photo failed for ${member.name}, retrying without photo`)
          doc = await createMember(payload, member, index, undefined)
          hasPhoto = false
        } else {
          throw createError
        }
      }

      existingNames.add(nameKey)
      created.push({ id: doc.id, name: member.name, hasPhoto })
    } catch (error: any) {
      console.error(`Failed to seed committee member ${member.name}:`, error)
      errors.push({
        name: member.name,
        error: payloadErrorMessage(error),
      })
    }
  }

  return {
    created,
    skipped,
    errors,
    totalStatic: youthSteeringCommitteeMembers.length,
  }
}
