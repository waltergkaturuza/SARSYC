import type { Payload } from 'payload'

export const PREVIOUS_CONFERENCE_SEED = [
  {
    title: 'SARSYC I',
    slug: 'sarsyc-i',
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
    slug: 'sarsyc-ii',
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
    slug: 'sarsyc-iii',
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
    slug: 'sarsyc-iv',
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
    slug: 'sarsyc-v',
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

/** Seed SARSYC I–V as previous conferences when the collection is empty. */
export async function seedPreviousConferencesIfEmpty(payload: Payload): Promise<number> {
  const existing = await payload.find({
    collection: 'conferences',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) return 0

  let created = 0
  for (const conf of PREVIOUS_CONFERENCE_SEED) {
    await payload.create({
      collection: 'conferences',
      data: {
        ...conf,
        keyOutcomes: conf.keyOutcomes.map((item) => ({ outcome: item.outcome })),
        isCurrent: false,
        status: 'published',
      },
      overrideAccess: true,
    })
    created += 1
  }
  return created
}
