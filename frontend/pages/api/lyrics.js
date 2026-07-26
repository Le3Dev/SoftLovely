export default async function handler(req, res) {
  const { artist, title } = req.query
  if (!artist || !title) return res.status(400).json({ lyrics: null })

  try {
    const r = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    )
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=86400')
    res.json({ lyrics: data.lyrics || null })
  } catch {
    res.json({ lyrics: null })
  }
}
