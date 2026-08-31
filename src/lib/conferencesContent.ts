import type { Payload } from 'payload'

export const PREVIOUS_CONFERENCE_SEED = [
  {
    title: 'SARSYC I',
    slug: 'sarsyc-1',
    year: 2015,
    location: 'Zimbabwe',
    participants: '200',
    theme: 'Inaugural Conference',
    summary: 'First regional youth conference and foundation of the SARSYC platform.',
    highlights: '5 countries, founding conference',
    keyOutcomes: [
      { outcome: 'First regional youth conference' },
      { outcome: 'Foundation of SARSYC platform' },
      { outcome: 'Partnerships with regional stakeholders' },
    ],
  },
  {
    title: 'SARSYC II',
    slug: 'sarsyc-2',
    year: 2017,
    location: 'University of Johannesburg, South Africa',
    participants: '300',
    theme: 'Youth Empowerment',
    summary: 'Expanded regional participation and strengthened youth networks.',
    highlights: '8 countries, enhanced regional reach',
    keyOutcomes: [
      { outcome: 'Expanded regional participation' },
      { outcome: 'Strengthened youth networks' },
      { outcome: 'Policy engagement frameworks' },
    ],
  },
  {
    title: 'SARSYC III',
    slug: 'sarsyc-3',
    year: 2019,
    location: 'University of Zambia',
    participants: '400',
    theme: 'Evidence-Based Advocacy',
    summary: 'Research Indaba formalized with youth-led research presentations.',
    highlights: '10 countries, research focus strengthened',
    keyOutcomes: [
      { outcome: 'Research Indaba formalized' },
      { outcome: 'Youth-led research presentations' },
      { outcome: 'Policy recommendations developed' },
    ],
  },
  {
    title: 'SARSYC IV',
    slug: 'sarsyc-4',
    year: 2022,
    location: 'LUANAR, Malawi',
    participants: '350',
    theme: 'Post-COVID Recovery & Digital Advocacy',
    summary: 'Hybrid conference format pioneered with COVID-19 recovery strategies.',
    highlights: '12 countries, hybrid format, digital innovation',
    keyOutcomes: [
      { outcome: 'COVID-19 recovery strategies' },
      { outcome: 'Digital advocacy tools developed' },
      { outcome: 'Hybrid conference format pioneered' },
    ],
  },
  {
    title: 'SARSYC V',
    slug: 'sarsyc-5',
    year: 2024,
    location: 'University of Botswana',
    participants: '500',
    theme: 'AI, Climate & Substance Abuse',
    summary: 'Emerging issues addressed with technology, climate, and GEAR Alliance focus.',
    highlights: '14 countries, 200+ abstracts, 35+ partners',
    keyOutcomes: [
      { outcome: 'Emerging issues addressed' },
      { outcome: 'Technology and climate focus' },
      { outcome: 'GEAR Alliance strengthened' },
    ],
  },
] as const

/** Seed SARSYC I–V as previous conferences when missing. Safe for concurrent builds. */
export async function seedPreviousConferencesIfEmpty(payload: Payload): Promise<number> {
  let created = 0

  for (const conf of PREVIOUS_CONFERENCE_SEED) {
    try {
      const existing = await payload.find({
        collection: 'conferences',
        where: { slug: { equals: conf.slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (existing.totalDocs > 0) continue

      await payload.create({
        collection: 'conferences',
        data: {
          title: conf.title,
          slug: conf.slug,
          year: conf.year,
          location: conf.location,
          theme: conf.theme,
          summary: conf.summary,
          participants: conf.participants,
          highlights: conf.highlights,
          keyOutcomes: conf.keyOutcomes.map((item) => ({ outcome: item.outcome })),
          isCurrent: false,
          status: 'published',
        },
        overrideAccess: true,
      })
      created += 1
    } catch (error) {
      // Ignore races / unique conflicts during parallel prerenders or repeated seeds.
      console.warn(
        `Conference seed skipped for ${conf.slug}:`,
        error instanceof Error ? error.message : error,
      )
    }
  }

  return created
}
