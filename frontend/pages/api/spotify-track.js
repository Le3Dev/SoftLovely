let cachedToken = null
let tokenExpiry  = 0

async function getToken(clientId, clientSecret) {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Spotify auth failed')
  cachedToken = data.access_token
  tokenExpiry  = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken
}

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing track id' })

  const clientId     = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) return res.status(503).json({ error: 'Spotify not configured' })

  try {
    const token = await getToken(clientId, clientSecret)
    const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!trackRes.ok) throw new Error(`Spotify API ${trackRes.status}`)
    const t = await trackRes.json()

    res.setHeader('Cache-Control', 's-maxage=3600')
    res.json({
      id:        t.id,
      name:      t.name,
      artist:    t.artists?.[0]?.name ?? '',
      albumArt:  t.album?.images?.[0]?.url ?? null,
      albumName: t.album?.name ?? '',
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
