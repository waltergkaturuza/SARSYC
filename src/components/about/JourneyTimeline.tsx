'use client'

interface JourneyMilestone {
  year: number
  country: string
  flag: string // Flag emoji
  description: string
  x: number // Percentage position for SVG path
  y: number // Percentage position for SVG path
}

const milestones: JourneyMilestone[] = [
  {
    year: 2015,
    country: 'Zimbabwe',
    flag: '🇿🇼',
    description: 'Focus on "Addressing the need for coordinated regional voice for students and youth in shaping SRHR and HIV/AIDS policy in Southern Africa." It was designed as a pre-event to major platforms like ICASA and the SADC Summit.',
    x: 15,
    y: 10,
  },
  {
    year: 2017,
    country: 'South Africa',
    flag: '🇿🇦',
    description: 'In partnership with the University of Johannesburg, "the platform grew in participation, scope, and influence more countries, more diverse youth, and more partners."',
    x: 85,
    y: 15,
  },
  {
    year: 2019,
    country: 'Zambia',
    flag: '🇿🇲',
    description: 'In partnership with the University of Zambia, "the focus expanded covering the intersection between health and education." Emphasis was placed on "evidence-based advocacy (research) and cross border collaboration," leading to "The GEAR Alliance emerged."',
    x: 20,
    y: 45,
  },
  {
    year: 2022,
    country: 'Malawi',
    flag: '🇲🇼',
    description: 'In partnership with Lilongwe University of Agriculture and Natural Resources, the focus was on "post-COVID recovery, and recommitment to regional and global frameworks, with emphasis on digital advocacy."',
    x: 80,
    y: 50,
  },
  {
    year: 2024,
    country: 'Botswana',
    flag: '🇧🇼',
    description: 'In partnership with the University of Botswana, the focus was on "addressing emerging issues affecting health and education outcomes such as climate change, drug and substance abuse, and artificial intelligence."',
    x: 18,
    y: 80,
  },
  {
    year: 2026,
    country: 'Namibia',
    flag: '🇳🇦',
    description: 'Marks "12 Years since the inaugural conference, 5 years since the establishment of the GEAR Alliance." It highlights "an opportunity to scale up transnational advocacy as an impactful and sustainable model to address persisting and emerging challenges amidst shifting development landscapes."',
    x: 82,
    y: 85,
  },
]

export default function JourneyTimeline() {
  return (
    <div className="relative w-full min-h-[1400px] bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 py-16 px-4 md:px-8">
      {/* Winding Path SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 1000 1400"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Winding path connecting all points */}
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

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="relative w-full" style={{ minHeight: '1400px' }}>
          {milestones.map((milestone, index) => (
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
              {/* Flagpole Container */}
              <div className="flex flex-col items-center mb-3">
                {/* Flag - Ensure it renders properly */}
                <div className="text-7xl mb-1 drop-shadow-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {milestone.flag}
                </div>
                {/* Pole */}
                <div className="w-1.5 h-20 bg-gray-500 rounded-full shadow-md"></div>
              </div>

              {/* Content Box */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-primary-600 mt-2">
                {/* Year Badge */}
                <div className="inline-block px-4 py-1.5 bg-primary-600 text-white text-sm font-bold rounded-full mb-3 shadow-md">
                  {milestone.year}
                </div>

                {/* Country Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {milestone.country}
                </h3>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed text-sm mb-4">
                  {milestone.description}
                </p>

                {/* Decorative Wave Line */}
                <div className="mt-4 pt-4">
                  <svg
                    width="100%"
                    height="4"
                    viewBox="0 0 300 4"
                    preserveAspectRatio="none"
                    className="text-blue-400"
                  >
                    <path
                      d="M 0 2 Q 75 0, 150 2 T 300 2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

