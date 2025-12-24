'use client'

import { useState } from 'react'
import { FiSearch, FiChevronDown, FiChevronUp, FiHelpCircle } from 'react-icons/fi'

const faqData = [
  {
    category: 'Registration',
    questions: [
      {
        question: 'How do I register for SARSYC VI?',
        answer: 'Visit our Registration page and complete the online form. The process takes about 5-10 minutes. You\'ll receive a confirmation email with your unique registration ID immediately after submitting.',
      },
      {
        question: 'What is the registration fee?',
        answer: 'Early Bird (by June 15): $50 for students, $100 for professionals. Regular (after June 15): $75 for students, $150 for professionals. The fee covers conference materials, meals, and certificate of participation.',
      },
      {
        question: 'Can I get a registration waiver or scholarship?',
        answer: 'Yes! We offer limited travel grants and fee waivers for students from underrepresented regions. Apply through the Registration form and select "Request Financial Support." Decisions are made on a rolling basis.',
      },
      {
        question: 'What is the registration deadline?',
        answer: 'Regular registration closes on July 31, 2026. However, we encourage early registration to secure your spot and benefit from early bird rates.',
      },
    ],
  },
  {
    category: 'Abstract Submission',
    questions: [
      {
        question: 'What is the abstract submission deadline?',
        answer: 'Abstracts must be submitted by June 30, 2026, at 11:59 PM (GMT+2). Late submissions will not be considered.',
      },
      {
        question: 'What are the abstract guidelines?',
        answer: 'Abstracts should be 200-300 words, clearly state research objectives, methods, results, and conclusions. Select the most appropriate conference track and provide 3-5 keywords.',
      },
      {
        question: 'Can I submit more than one abstract?',
        answer: 'Yes, you may submit multiple abstracts. However, if multiple are accepted, you may only present a maximum of 2 (one oral, one poster) due to time constraints.',
      },
      {
        question: 'When will I know if my abstract is accepted?',
        answer: 'All submitters will be notified of decisions by June 30, 2026. You\'ll receive an email with the review outcome and next steps.',
      },
    ],
  },
  {
    category: 'Travel & Accommodation',
    questions: [
      {
        question: 'Do I need a visa to travel to Namibia?',
        answer: 'Visa requirements vary by country. Check with the Namibian embassy in your country. We can provide invitation letters for visa applications once you\'re registered.',
      },
      {
        question: 'What accommodation options are available?',
        answer: 'We have negotiated special rates with several hotels near the venue. Recommendations and booking links are available on our Accommodation page. Prices range from $30-150/night.',
      },
      {
        question: 'Is there airport pickup available?',
        answer: 'Yes, we\'ll provide shuttle service from Hosea Kutako International Airport to designated hotels on August 4-5. Details will be emailed to registered participants.',
      },
    ],
  },
  {
    category: 'Programme & Sessions',
    questions: [
      {
        question: 'When will the final programme be available?',
        answer: 'The preliminary programme will be published by July 1, 2026. The final programme with all session details, speakers, and room assignments will be available by July 15, 2026.',
      },
      {
        question: 'Can I choose which sessions to attend?',
        answer: 'Yes! Most sessions run in parallel across 4 tracks. You can attend sessions that align with your interests. The programme will indicate which sessions require separate registration (workshops with limited capacity).',
      },
      {
        question: 'Will sessions be recorded?',
        answer: 'Selected plenary sessions and keynotes will be recorded and made available on our website after the conference. Parallel sessions will not be recorded to encourage open discussion.',
      },
    ],
  },
  {
    category: 'General',
    questions: [
      {
        question: 'What language will the conference be conducted in?',
        answer: 'The primary language is English. However, we provide simultaneous interpretation for French and Portuguese in plenary sessions. Presentation materials may be in any of these languages.',
      },
      {
        question: 'Is the venue wheelchair accessible?',
        answer: 'Yes, the conference venue is fully wheelchair accessible. Please indicate any accessibility requirements during registration so we can make necessary arrangements.',
      },
      {
        question: 'What should I bring to the conference?',
        answer: 'Bring your registration confirmation, valid ID/passport, laptop/tablet for note-taking, business cards for networking, and comfortable clothing (smart casual). Conference materials and name badge will be provided.',
      },
    ],
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (question: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(question)) {
      newExpanded.delete(question)
    } else {
      newExpanded.add(question)
    }
    setExpandedQuestions(newExpanded)
  }

  // Filter FAQs based on search
  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <FiHelpCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white/90">
              Find answers to common questions about SARSYC VI
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:outline-none text-lg"
              />
            </div>
            {searchQuery && (
              <p className="mt-4 text-sm text-gray-600 text-center">
                Found {filteredFAQs.reduce((acc, cat) => acc + cat.questions.length, 0)} results
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              <button
                onClick={() => {
                  setActiveCategory(null)
                  setSearchQuery('')
                }}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === null
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {faqData.map((category) => (
                <button
                  key={category.category}
                  onClick={() => {
                    setActiveCategory(category.category)
                    setSearchQuery('')
                  }}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    activeCategory === category.category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.category}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-8">
              {(searchQuery ? filteredFAQs : activeCategory ? faqData.filter(c => c.category === activeCategory) : faqData).map((category) => (
                <div key={category.category}>
                  {!activeCategory && !searchQuery && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
                  )}
                  
                  <div className="space-y-4">
                    {category.questions.map((item, index) => {
                      const questionId = `${category.category}-${index}`
                      const isExpanded = expandedQuestions.has(questionId)

                      return (
                        <div
                          key={questionId}
                          className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary-300 transition-all"
                        >
                          <button
                            onClick={() => toggleQuestion(questionId)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-gray-900 pr-4">
                              {item.question}
                            </span>
                            {isExpanded ? (
                              <FiChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            ) : (
                              <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          
                          {isExpanded && (
                            <div className="px-6 pb-6 text-gray-600 animate-slide-down">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Still Have Questions */}
            <div className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 md:p-12 text-center text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Still Have Questions?
              </h3>
              <p className="text-lg text-white/90 mb-8">
                Can't find what you're looking for? Our team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/contact" className="btn-accent px-8 py-4">
                  Contact Us
                </a>
                <a href="mailto:info@sarsyc.org" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-4">
                  Email: info@sarsyc.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}



