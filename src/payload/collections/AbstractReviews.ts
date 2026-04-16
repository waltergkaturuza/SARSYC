import type { CollectionConfig } from 'payload/types'
import { normalizePayloadId, toRelationshipId } from '@/lib/payloadIds'

const AbstractReviews: CollectionConfig = {
  slug: 'abstract-reviews',
  admin: {
    useAsTitle: 'abstract',
    defaultColumns: ['abstract', 'reviewer', 'score', 'recommendation', 'createdAt'],
    group: 'Conference',
  },
  access: {
    read: ({ req }: any) => {
      const user = req?.user
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'reviewer') {
        return {
          reviewer: { equals: user.id },
        }
      }
      return false
    },
    create: ({ req }: any) => {
      const user = req?.user
      return Boolean(user && (user.role === 'admin' || user.role === 'reviewer'))
    },
    update: ({ req }: any) => {
      const user = req?.user
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.role === 'reviewer') {
        return {
          reviewer: { equals: user.id },
        }
      }
      return false
    },
    delete: ({ req }: any) => req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'abstract',
      type: 'relationship',
      relationTo: 'abstracts',
      required: true,
    },
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'score',
      type: 'number',
      min: 1,
      max: 30,
      required: true,
      defaultValue: 1,
      admin: {
        description:
          'Total rubric score (1–30): six criteria × 1–5 points each (SARSYC VI Abstracts Evaluation Rubric).',
      },
    },
    {
      name: 'recommendation',
      type: 'select',
      required: true,
      defaultValue: 'accept',
      options: [
        { label: 'Accept', value: 'accept' },
        { label: 'Minor Revisions', value: 'minor-revisions' },
        { label: 'Major Revisions', value: 'major-revisions' },
        { label: 'Reject', value: 'reject' },
      ],
    },
    {
      name: 'confidence',
      type: 'select',
      label: 'Reviewer Confidence',
      options: [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
    {
      name: 'comments',
      type: 'textarea',
      label: 'Reviewer Comments',
      admin: {
        description: 'Detailed feedback for the abstract author',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }: any) => {
        const user = req?.user
        if (!user) {
          throw new Error('Authentication required to submit a review')
        }

        const payload = req.payload
        const abstractId =
          typeof data.abstract === 'object'
            ? (data.abstract as any).id || (data.abstract as any)
            : data.abstract

        if (!abstractId) {
          throw new Error('Abstract is required for a review')
        }

        // Reviewers can only review assigned abstracts
        if (user.role === 'reviewer') {
          const abstract = await payload.findByID({
            collection: 'abstracts',
            id: abstractId,
            depth: 0,
            overrideAccess: true,
          })

          const assigned = Array.isArray(abstract.assignedReviewers)
            ? abstract.assignedReviewers
            : []

          const reviewerIdNorm = normalizePayloadId(user.id)
          const assignedIds = assigned.map((r: any) =>
            normalizePayloadId(typeof r === 'object' && r != null ? r.id : r),
          )

          const isAssigned = assignedIds.some((id: string) => id !== '' && id === reviewerIdNorm)
          if (!isAssigned) {
            throw new Error('You are not assigned to review this abstract')
          }

          // Ensure reviewer field matches authenticated user (stable FK type for Postgres)
          data.reviewer = toRelationshipId(reviewerIdNorm)
        }

        const reviewerIdNorm = normalizePayloadId(
          typeof data.reviewer === 'object' && data.reviewer != null
            ? (data.reviewer as any).id ?? (data.reviewer as any)
            : data.reviewer,
        )
        const reviewerFk = toRelationshipId(reviewerIdNorm)

        // Prevent duplicate reviews
        const existing = await payload.find({
          collection: 'abstract-reviews',
          where: {
            and: [
              { abstract: { equals: abstractId } },
              { reviewer: { equals: reviewerFk } },
            ],
          },
          limit: 1,
          overrideAccess: true,
        })

        if (existing.totalDocs > 0) {
          const existingDoc = existing.docs[0]
          if (operation === 'create') {
            throw new Error('You have already submitted a review for this abstract')
          }
          if (operation === 'update' && originalDoc?.id !== existingDoc.id) {
            throw new Error('Duplicate review detected')
          }
        }

        return data
      },
    ],
  },
}

export default AbstractReviews
