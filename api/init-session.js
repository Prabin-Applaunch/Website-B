const INIT_SESSION_URL = 'https://dev-ror.mri.life/partner/init_session'

const UPSTREAM_HEADERS = {
  Authorization:
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzNjQxNSIsInNjcCI6InVzZXIiLCJhdWQiOm51bGwsImlhdCI6MTc3NzU1MzAwMiwiZXhwIjoxODYzOTUzMDAyLCJqdGkiOiI5MzMxNzIwOS1mNTA0LTRjY2ItYjE0ZC1hYjA3NWJkNjY2YmMifQ.hL-ZwPMzdzflRbyPFTDiaOcQFzz-pRHQ4BS1u19xO2k',
  Referer: 'https://dev.mri-essentials.com',
  'Content-Type': 'application/json'
}

function parseUpstreamBody (text) {
  if (!text || !text.trim()) {
    return {}
  }
  try {
    return JSON.parse(text)
  } catch (parseErr) {
    console.error('init-session: upstream returned non-JSON body', parseErr)
    return { _raw: text }
  }
}

function setCors (res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

module.exports = async function handler (req, res) {
  if (req.method === 'OPTIONS') {
    setCors(res)
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    console.warn('init-session: rejected method', req.method)
    setCors(res)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const upstream = await fetch(INIT_SESSION_URL, {
      method: 'POST',
      headers: UPSTREAM_HEADERS,
      body: JSON.stringify({})
    })

    const text = await upstream.text()
    const data = parseUpstreamBody(text)

    if (!upstream.ok) {
      console.error('init-session: upstream error', {
        status: upstream.status,
        statusText: upstream.statusText,
        body: data
      })
    } else {
      console.log('init-session: success', { status: upstream.status })
    }

    setCors(res)
    return res.status(upstream.status).json(data)
  } catch (err) {
    console.error('init-session: request failed', err)
    setCors(res)
    return res.status(502).json({
      error: 'Proxy request failed',
      message: err.message || String(err)
    })
  }
}
