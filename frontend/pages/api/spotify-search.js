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
  const { q } = req.query
  if (!q || q.trim().length < 2) return res.json({ tracks: [] })

  const clientId     = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) return res.status(503).json({ error: 'Spotify not configured' })

  try {
    const token = await getToken(clientId, clientSecret)

    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=8&market=BR`
    const searchRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await searchRes.json()

    const tracks = (data.tracks?.items ?? []).map(t => ({
      id:       t.id,
      name:     t.name,
      artist:   t.artists?.[0]?.name ?? '',
      albumArt: t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url ?? null,
      trackUrl: `https://open.spotify.com/track/${t.id}`,
    }))

    res.setHeader('Cache-Control', 's-maxage=300')
    res.json({ tracks })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
