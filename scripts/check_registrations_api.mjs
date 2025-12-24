import fetch from 'node-fetch'

const url = process.env.TEST_URL || 'https://sarsyc.vercel.app/api/registrations'

const payload = {
  firstName: 'Test',
  lastName: 'User',
  email: `test+${Date.now()}@sarsyc.local`,
  phone: '+1234567890',
  country: 'Testland',
  organization: 'Test Org',
  category: 'observer',
}

async function run() {
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const text = await res.text()
      console.log(new Date().toISOString(), 'Attempt', attempt, 'STATUS', res.status)
      console.log(text)

      if (res.status === 200 || res.status === 201) {
        process.exit(0)
      }
    } catch (err) {
      console.error(new Date().toISOString(), 'Attempt', attempt, 'Error testing API:', err)
    }

    // Wait 10s before retrying
    await new Promise((r) => setTimeout(r, 10000))
  }

  console.error('All attempts finished without success')
  process.exit(1)
}

run()
