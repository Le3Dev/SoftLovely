export default async function handler(req, res) {
  const { trackId } = req.query
  if (!trackId) return res.status(400).json({ error: 'trackId required' })

  const clientId     = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(503).json({ error: 'Spotify credentials not configured' })
  }

  try {
    /* ── 1. Busca info da faixa no Spotify ── */
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    })
    const { access_token, error: tokenErr } = await tokenRes.json()
    if (tokenErr || !access_token) return res.status(401).json({ error: 'Spotify auth failed' })

    const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const track = await trackRes.json()
    if (!track.id) return res.status(404).json({ error: 'Track not found' })

    const name      = track.name
    const artist    = track.artists?.[0]?.name ?? ''
    const albumArt  = track.album?.images?.[1]?.url ?? track.album?.images?.[0]?.url ?? null
    let   previewUrl = track.preview_url ?? null

    /* ── 2. Spotify não tem preview → tenta Deezer (grátis, sem auth) ── */
    if (!previewUrl && name) {
      try {
        const q = encodeURIComponent(`${name} ${artist}`.trim())
        const deezerRes  = await fetch(`https://api.deezer.com/search?q=${q}&limit=5`)
        const deezerData = await deezerRes.json()

        /* pega o primeiro resultado que tenha preview de 30s */
        const hit = deezerData?.data?.find(d => d.preview)
        if (hit?.preview) previewUrl = hit.preview
      } catch { /* Deezer falhou — sem preview */ }
    }

    res.setHeader('Cache-Control', 's-maxage=3600')
    res.json({ previewUrl, name, artist, albumArt })
  } catch {
    res.status(500).json({ error: 'Failed to fetch preview' })
  }
}
