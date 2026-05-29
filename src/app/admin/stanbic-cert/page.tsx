import {
  STANBIC_CERTIFICATION_MATRIX,
  STANBIC_PAID_STATES,
  STANBIC_AUTHORISED_STATES,
  STANBIC_FAILED_STATES,
  STANBIC_CANCELLED_STATES,
} from '@/lib/stanbic/stanbicCertification'

export const revalidate = 0

const DB_MAPPING = [
  { states: [...STANBIC_PAID_STATES], db: 'paid', note: 'CAPTURED, PURCHASED' },
  { states: [...STANBIC_AUTHORISED_STATES], db: 'pending', note: 'Auth-only — pending capture' },
  { states: [...STANBIC_FAILED_STATES], db: 'failed', note: 'FAILED, DECLINED' },
  { states: [...STANBIC_CANCELLED_STATES], db: 'cancelled', note: 'User cancelled' },
]

export default function StanbicCertificationPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Stanbic N-Genius certification</h1>
        <p className="mt-2 text-gray-600 max-w-3xl">
          Sandbox test matrix for the hosted payment page. During certification, Vercel function logs
          emit <code className="text-sm bg-gray-100 px-1 rounded">[stanbic-cert]</code> JSON lines —
          grep for <code className="text-sm bg-gray-100 px-1 rounded">stanbic_start</code>,{' '}
          <code className="text-sm bg-gray-100 px-1 rounded">stanbic_return</code>, and{' '}
          <code className="text-sm bg-gray-100 px-1 rounded">stanbic_duplicate_attempt</code>.
          Never trust redirect URLs or query params — DB updates only after API verification.
        </p>
      </header>

      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">DB status mapping</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">N-Genius state</th>
              <th className="px-6 py-3 font-medium">DB status</th>
              <th className="px-6 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {DB_MAPPING.map((row) => (
              <tr key={row.db} className="border-b border-gray-50">
                <td className="px-6 py-3 font-mono text-gray-800">{row.states.join(', ')}</td>
                <td className="px-6 py-3 font-medium text-gray-900">{row.db}</td>
                <td className="px-6 py-3 text-gray-600">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Certification scenarios ({STANBIC_CERTIFICATION_MATRIX.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {STANBIC_CERTIFICATION_MATRIX.map((scenario) => (
            <article key={scenario.id} className="px-6 py-5">
              <div className="flex flex-wrap items-start gap-3">
                <span className="text-xl" aria-hidden>{scenario.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {scenario.title}
                    <span className="ml-2 text-xs font-normal text-gray-400 font-mono">{scenario.id}</span>
                  </h3>
                  {scenario.instructions && (
                    <p className="mt-1 text-sm text-amber-800 bg-amber-50 inline-block px-2 py-1 rounded">
                      {scenario.instructions}
                    </p>
                  )}
                  {scenario.testCard && (
                    <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <dt className="text-gray-500">Card</dt>
                        <dd className="font-mono text-gray-900">{scenario.testCard}</dd>
                      </div>
                      {scenario.expiry && (
                        <div>
                          <dt className="text-gray-500">Expiry</dt>
                          <dd className="font-mono">{scenario.expiry}</dd>
                        </div>
                      )}
                      {scenario.cvv && (
                        <div>
                          <dt className="text-gray-500">CVV</dt>
                          <dd className="font-mono">{scenario.cvv}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                  <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Expected events</dt>
                      <dd className="font-mono text-xs text-gray-800">{scenario.expectedEvents.join(' → ')}</dd>
                    </div>
                    {scenario.expectedPaymentState && (
                      <div>
                        <dt className="text-gray-500">paymentState</dt>
                        <dd className="font-mono">{scenario.expectedPaymentState}</dd>
                      </div>
                    )}
                    {scenario.expectedPaymentStatus && (
                      <div>
                        <dt className="text-gray-500">paymentStatus</dt>
                        <dd className="font-mono">{scenario.expectedPaymentStatus}</dd>
                      </div>
                    )}
                    {scenario.expectedThreeDSecure && (
                      <div>
                        <dt className="text-gray-500">threeDSecure</dt>
                        <dd className="font-mono">{scenario.expectedThreeDSecure}</dd>
                      </div>
                    )}
                    {scenario.expectedVerificationError && (
                      <div className="sm:col-span-2">
                        <dt className="text-gray-500">verificationError</dt>
                        <dd className="font-mono text-red-700">{scenario.expectedVerificationError}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 text-gray-100 rounded-xl p-6 text-sm font-mono space-y-2">
        <p className="text-gray-400 font-sans text-base mb-3">Example log lines (Vercel → Functions → filter stanbic-cert)</p>
        <p>[stanbic-cert] {`{"event":"stanbic_start","registrationRef":"SARSYC-REG-…","orderReference":"…","amount":"150000",…}`}</p>
        <p>[stanbic-cert] {`{"event":"stanbic_return","paymentState":"CAPTURED","paymentStatus":"SUCCESS","verificationApproved":true,…}`}</p>
        <p>[stanbic-cert] {`{"event":"stanbic_duplicate_attempt","existingPaymentState":"CAPTURED","newAttemptBlocked":true,…}`}</p>
      </section>
    </div>
  )
}
