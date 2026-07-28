import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'
import type { Payload } from 'payload'
import { youthSteeringCommitteeMembers } from '@/lib/youthSteeringCommitteeMembers'
import { getCountryCodeByLabel } from '@/lib/countries'
import { plainTextToSlate } from '@/lib/newsContent'
import { createMediaFromBlobUrl } from '@/lib/createMediaFromUrl'
import { getSiteBaseUrl } from '@/lib/siteUrl'

function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return 'image/jpeg'
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
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return { buffer: Buffer.from(arrayBuffer), filename }
  } catch (error) {
    console.warn(`Failed to fetch committee photo ${relative}:`, error)
    return null
  }
}

async function uploadCommitteePhoto(photoPath: string, memberName: string): Promise<string | null> {
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
  created: Array<{ id: string | number; name: string }>
  skipped: Array<{ name: string; reason: string }>
  errors: Array<{ name: string; error: string }>
  totalStatic: number
}

/**
 * Idempotent seed: insert hardcoded governance-page committee members into Payload.
 * Skips any member whose name already exists in the collection.
 */
export async function seedYouthSteeringCommitteeFromStatic(
  payload: Payload,
): Promise<SeedYouthSteeringCommitteeResult> {
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
      if (member.photo) {
        const blobUrl = await uploadCommitteePhoto(member.photo, member.name)
        if (blobUrl) {
          photoId = await createMediaFromBlobUrl(
            payload,
            blobUrl,
            `Youth Steering Committee member photo: ${member.name}`,
          )
        }
      }

      const countryCode = getCountryCodeByLabel(member.country)
      const doc = await payload.create({
        collection: 'youth-steering-committee',
        data: {
          name: member.name,
          role: member.role,
          organization: member.organization,
          country: countryCode,
          bio: plainTextToSlate(member.bio),
          photo: photoId || undefined,
          featured: true,
          order: index + 1,
          socialMedia: {},
        },
        overrideAccess: true,
      })

      existingNames.add(nameKey)
      created.push({ id: doc.id, name: member.name })
    } catch (error: any) {
      console.error(`Failed to seed committee member ${member.name}:`, error)
      errors.push({
        name: member.name,
        error: error?.message || String(error),
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
