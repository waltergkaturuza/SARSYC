export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> December 2025
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              When you register for SARSYC VI, submit an abstract, or use our website, we collect:
            </p>
            <ul>
              <li>Personal information (name, email, phone number)</li>
              <li>Organization and country information</li>
              <li>Dietary restrictions and accessibility requirements</li>
              <li>Abstract submissions and associated files</li>
              <li>Website usage data (via cookies and analytics)</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Process your conference registration and abstract submissions</li>
              <li>Send conference updates and important announcements</li>
              <li>Provide personalized conference experience</li>
              <li>Improve our services and website</li>
              <li>Generate anonymous statistics for reporting</li>
            </ul>

            <h2>3. Data Protection</h2>
            <p>
              We implement appropriate security measures to protect your personal data, including:
            </p>
            <ul>
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Secure database storage</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits</li>
            </ul>

            <h2>4. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to data processing</li>
            </ul>

            <h2>5. Cookies</h2>
            <p>
              We use cookies to enhance your experience, remember your preferences, and analyze website traffic.
              You can control cookie settings in your browser.
            </p>

            <h2>6. Third-Party Services</h2>
            <p>We use third-party services including:</p>
            <ul>
              <li>Google Analytics (website analytics)</li>
              <li>Email service providers (for notifications)</li>
              <li>Cloud hosting providers (for data storage)</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>
              We retain your data for the duration of the conference cycle and up to 2 years after for archival
              and future conference planning purposes. You may request deletion at any time.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              For privacy-related questions or requests, contact us at:
              <br />
              <strong>Email:</strong> privacy@sarsyc.org
              <br />
              <strong>Address:</strong> SAYWHAT Regional Office, Windhoek, Namibia
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this page with
              an updated revision date.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                This privacy policy complies with applicable data protection regulations including GDPR where applicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

