import { FiCheck } from 'react-icons/fi'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">Accessibility Statement</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              SAYWHAT and SARSYC are committed to ensuring digital accessibility for people with disabilities.
              We are continually improving the user experience for everyone and applying relevant accessibility standards.
            </p>

            <h2>Conformance Status</h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers
              to improve accessibility for people with disabilities. This website aims to conform with WCAG 2.1
              Level AA.
            </p>

            <h2>Measures to Support Accessibility</h2>
            <p>SAYWHAT takes the following measures to ensure accessibility:</p>
            <ul>
              <li><FiCheck className="inline text-green-600 mr-2" />Include accessibility throughout our design process</li>
              <li><FiCheck className="inline text-green-600 mr-2" />Provide clear navigation and page structure</li>
              <li><FiCheck className="inline text-green-600 mr-2" />Use semantic HTML markup</li>
              <li><FiCheck className="inline text-green-600 mr-2" />Ensure sufficient color contrast</li>
              <li><FiCheck className="inline text-green-600 mr-2" />Provide alt text for images</li>
              <li><FiCheck className="inline text-green-600 mr-2" />Support keyboard navigation</li>
              <li><FiCheck className="inline text-green-600 mr-2" />Test with screen readers</li>
            </ul>

            <h2>Conference Accessibility</h2>
            <h3>Physical Venue</h3>
            <ul>
              <li>Wheelchair-accessible venue and facilities</li>
              <li>Accessible parking</li>
              <li>Accessible restrooms</li>
              <li>Elevators to all floors</li>
              <li>Reserved seating for people with disabilities</li>
            </ul>

            <h3>Communication Access</h3>
            <ul>
              <li>Sign language interpretation (upon request)</li>
              <li>Written materials available in large print</li>
              <li>Audio induction loops in main hall</li>
              <li>Closed captioning for recorded sessions</li>
            </ul>

            <h3>How to Request Accommodations</h3>
            <p>
              Please indicate any accessibility requirements during registration. We will make every effort to
              accommodate your needs. Requests should be made at least 4 weeks before the conference.
            </p>

            <h2>Technical Specifications</h2>
            <p>This website is designed to be compatible with:</p>
            <ul>
              <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
              <li>Browser text size adjustment (up to 200%)</li>
              <li>Keyboard-only navigation</li>
              <li>Voice recognition software</li>
            </ul>

            <h2>Limitations and Alternatives</h2>
            <p>
              Despite our best efforts, some content may not yet be fully accessible. We are working to:
            </p>
            <ul>
              <li>Add captions to all videos</li>
              <li>Provide text transcripts for audio content</li>
              <li>Ensure all PDF documents are accessible</li>
              <li>Test with diverse assistive technologies</li>
            </ul>

            <h2>Feedback</h2>
            <p>
              We welcome your feedback on accessibility. If you encounter accessibility barriers, please contact us:
            </p>
            <p>
              <strong>Email:</strong> accessibility@sarsyc.org
              <br />
              <strong>Phone:</strong> +264 (0) 00 000 0000
              <br />
              <strong>Response Time:</strong> Within 48 hours
            </p>

            <h2>Third-Party Content</h2>
            <p>
              Some content on this website may be provided by third parties. While we strive to ensure all
              content is accessible, we may not have full control over third-party accessibility.
            </p>

            <h2>Assessment Approach</h2>
            <p>
              SAYWHAT assessed the accessibility of this website through:
            </p>
            <ul>
              <li>Self-evaluation</li>
              <li>Automated testing tools</li>
              <li>Manual testing with assistive technologies</li>
              <li>User testing with people with disabilities</li>
            </ul>

            <div className="mt-12 pt-8 border-t border-gray-200 bg-gray-50 rounded-lg p-6">
              <p className="font-semibold text-gray-900 mb-2">Commitment to Accessibility</p>
              <p className="text-gray-700">
                We are committed to making SARSYC accessible to all young people in Southern Africa, regardless
                of ability. Accessibility is an ongoing effort, and we continually seek to improve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



