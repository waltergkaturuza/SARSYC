import { FiUsers, FiArrowRight, FiExternalLink } from 'react-icons/fi'
import Link from 'next/link'

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="about-hero bg-slate-800 text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Who We Are
            </h1>
            <p className="text-xl text-white/90">
              Convened by SAYWHAT in partnership with the University of Namibia (UNAM)
            </p>
          </div>
        </div>
      </section>

      {/* About SAYWHAT */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="section-title">About SAYWHAT</h2>
            <p className="profile-description">
              <strong>SAYWHAT (Student and Youth Working on Reproductive Health Action Team)</strong> is a regional
              youth-led network advancing sexual and reproductive health and rights (SRHR) and education advocacy
              across Southern Africa.
            </p>
            <p className="profile-description mt-4">
              Founded in 2003, SAYWHAT works across 11 SADC member states, mobilizing students and young people to
              advocate for evidence-based policies and programs that improve youth health and education outcomes.
            </p>
            <p className="mt-6">
              <a
                href="https://saywhat.org.zw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Read more about SAYWHAT
                <FiExternalLink className="w-4 h-4" />
              </a>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-4">11</div>
              <h3 className="font-bold text-gray-900 mb-2">SADC Countries</h3>
              <p className="text-sm text-gray-600">Working across Southern Africa</p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-4">2003</div>
              <h3 className="font-bold text-gray-900 mb-2">Established</h3>
              <p className="text-sm text-gray-600">Over 20 years of impact</p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-4">2,000+</div>
              <h3 className="font-bold text-gray-900 mb-2">Youth Reached</h3>
              <p className="text-sm text-gray-600">Through SARSYC conferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* About UNAM */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title">About UNAM</h2>
            <p className="profile-description">
              The <strong>University of Namibia (UNAM)</strong> is Namibia&apos;s premier public university.
              Established in 1992, it provides undergraduate and postgraduate education across a wide range of
              disciplines, with a strong focus on national development, research, and community engagement. UNAM has
              multiple campuses across the country, with its main campus in Windhoek.
            </p>
            <p className="mt-6">
              <a
                href="https://www.unam.edu.na"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Visit the UNAM website
                <FiExternalLink className="w-4 h-4" />
              </a>
            </p>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/about/youth-steering-committee"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiUsers className="w-5 h-5" />
              View Youth Steering Committee
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
