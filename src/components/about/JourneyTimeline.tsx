'use client'

interface JourneyMilestone {
  year: number
  country: string
  countryCode: string
  description: string
  x: number
  y: number
}

const milestones: JourneyMilestone[] = [
  {
    year: 2015,
    country: 'Zimbabwe',
    countryCode: 'ZW',
    description:
      'Focus on "Addressing the need for coordinated regional voice for students and youth in shaping SRHR and HIV/AIDS policy in Southern Africa." It was designed as a pre-event to major platforms like ICASA and the SADC Summit.',
    x: 15,
    y: 10,
  },
  {
    year: 2017,
    country: 'South Africa',
    countryCode: 'ZA',
    description:
      'In partnership with the University of Johannesburg, "the platform grew in participation, scope, and influence more countries, more diverse youth, and more partners."',
    x: 85,
    y: 15,
  },
  {
    year: 2019,
    country: 'Zambia',
    countryCode: 'ZM',
    description:
      'In partnership with the University of Zambia, "the focus expanded covering the intersection between health and education." Emphasis was placed on "evidence-based advocacy (research) and cross border collaboration," leading to "The GEAR Alliance emerged."',
    x: 20,
    y: 45,
  },
  {
    year: 2022,
    country: 'Malawi',
    countryCode: 'MW',
    description:
      'In partnership with Lilongwe University of Agriculture and Natural Resources, the focus was on "post-COVID recovery, and recommitment to regional and global frameworks, with emphasis on digital advocacy."',
    x: 80,
    y: 50,
  },
  {
    year: 2024,
    country: 'Botswana',
    countryCode: 'BW',
    description:
      'In partnership with the University of Botswana, the focus was on "addressing emerging issues affecting health and education outcomes such as climate change, drug and substance abuse, and artificial intelligence."',
    x: 18,
    y: 80,
  },
  {
    year: 2026,
    country: 'Namibia',
    countryCode: 'NA',
    description:
      'Marks "12 Years since the inaugural conference, 5 years since the establishment of the GEAR Alliance." It highlights "an opportunity to scale up transnational advocacy as an impactful and sustainable model to address persisting and emerging challenges amidst shifting development landscapes."',
    x: 82,
    y: 85,
  },
]

function flagImageUrl(countryCode: string, width = 160) {
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`
}

function MilestoneFlag({ country, countryCode }: { country: string; countryCode: string }) {
  return (
    <div className="flex flex-col items-center mb-3">
      <img
        src={flagImageUrl(countryCode)}
        srcSet={`${flagImageUrl(countryCode, 320)} 2x`}
        alt={`${country} flag`}
        width={64}
        height={48}
        className="h-12 w-16 rounded object-cover shadow-lg border border-gray-200 bg-white"
        loading="lazy"
        decoding="async"
      />
      <div className="mt-1 w-1.5 h-12 md:h-20 bg-gray-500 rounded-full shadow-md" />
    </div>
  )
}

function MilestoneCard({ milestone }: { milestone: JourneyMilestone }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <MilestoneFlag country={milestone.country} countryCode={milestone.countryCode} />
      <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-primary-600 mt-2">
        <div className="inline-block px-4 py-1.5 bg-primary-600 text-white text-sm font-bold rounded-full mb-3 shadow-md">
          {milestone.year}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{milestone.country}</h3>
        <p className="text-gray-700 leading-relaxed text-sm mb-4">{milestone.description}</p>
        <div className="mt-4 pt-4">
          <svg width="100%" height="4" viewBox="0 0 300 4" preserveAspectRatio="none" className="text-blue-400">
            <path d="M 0 2 Q 75 0, 150 2 T 300 2" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function JourneyTimeline() {
  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 py-10 md:py-16 px-4 md:px-8">
      {/* Mobile: stacked timeline */}
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-10 md:hidden">
        {milestones.map((milestone) => (
          <MilestoneCard key={milestone.year} milestone={milestone} />
        ))}
      </div>

      {/* Desktop: winding map layout */}
      <div className="relative z-10 mx-auto hidden max-w-7xl md:block">
        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          viewBox="0 0 1000 1400"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={`M ${milestones[0].x * 10} ${milestones[0].y * 14} 
              Q ${milestones[0].x * 10 + 200} ${milestones[0].y * 14 - 50} ${milestones[1].x * 10} ${milestones[1].y * 14}
              Q ${milestones[1].x * 10 - 150} ${milestones[1].y * 14 + 200} ${milestones[2].x * 10} ${milestones[2].y * 14}
              Q ${milestones[2].x * 10 + 250} ${milestones[2].y * 14 + 100} ${milestones[3].x * 10} ${milestones[3].y * 14}
              Q ${milestones[3].x * 10 - 200} ${milestones[3].y * 14 + 150} ${milestones[4].x * 10} ${milestones[4].y * 14}
              Q ${milestones[4].x * 10 + 250} ${milestones[4].y * 14 + 50} ${milestones[5].x * 10} ${milestones[5].y * 14}`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6,4"
            opacity="0.5"
          />
        </svg>

        <div className="relative w-full" style={{ minHeight: '1400px' }}>
          {milestones.map((milestone) => (
            <div
              key={milestone.year}
              className="absolute"
              style={{
                left: `${milestone.x}%`,
                top: `${milestone.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 'min(90%, 400px)',
              }}
            >
              <MilestoneCard milestone={milestone} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
