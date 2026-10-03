import { useEffect, useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import { Music } from 'lucide-react'
import { ScrollKaraoke } from './ScrollKaraoke'

/* ══════════════════════════════════════════════════
   CAPÍTULO — "Nossa música"
   Vinil com a capa do álbum girando conforme o scroll (dá pra
   "arranhar" rolando pra cima e pra baixo), a letra em karaokê
   e, no fim, o player para dar o play de verdade.
══════════════════════════════════════════════════ */

const FALLBACK_LYRICS = [
  'tem música que vira lugar,',
  'e essa é o nosso.',
  'toda vez que ela toca,',
  'é você que eu escuto',
]

export function extractSpotifyId(url) {
  if (!url) return null
  const m = url.match(/(?:open\.spotify\.com\/track\/|spotify:track:)([A-Za-z0-9]+)/)
  return m ? m[1] : null
}

function Vinyl({ p, track }) {
  const rotate = useTransform(p, [0, 1], [0, 900])
  const scale  = useTransform(p, [0, 0.12], [0.8, 1])
  const armRot = useTransform(p, [0.04, 0.14], [-28, 0])
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div className="relative w-36 h-36 md:w-44 md:h-44" style={{ scale }}>
        <div className="absolute -inset-6 rounded-full blur-2xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(190,140,255,0.45), transparent 70%)' }} />
        <motion.div className="absolute inset-0 rounded-full shadow-2xl"
          style={{ rotate, background: 'repeating-radial-gradient(circle, #151018 0 2px, #221a28 2px 4px)' }}>
          <div className="absolute inset-[26%] rounded-full overflow-hidden border-2 border-black/40">
            {track?.albumArt
              ? <img src={track.albumArt} alt={track.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6B3FA0,#C9184A)' }}><Music size={22} color="white" /></div>}
          </div>
          <div className="absolute left-1/2 top-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0b0810]" />
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.14), transparent 45%)' }} />
        </motion.div>
        {/* braço da agulha */}
        <motion.div className="absolute -right-3 -top-2 w-3 h-3 rounded-full bg-[#e8e2f0] origin-center" style={{ rotate: armRot }}>
          <span className="absolute left-1 top-1 w-[3px] h-24 rounded-full origin-top rotate-[28deg]" style={{ background: 'linear-gradient(#e8e2f0, #9a90a8)' }} />
        </motion.div>
      </motion.div>
      {track && (
        <div className="text-center">
          <p className="font-black text-white text-base leading-tight">{track.name}</p>
          <p className="text-[#D9C9FF]/70 text-xs mt-0.5 font-semibold">{track.artist}</p>
        </div>
      )}
    </div>
  )
}

export function MusicChapter({ musicUrl }) {
  const [track, setTrack] = useState(null)
  const [lyrics, setLyrics] = useState(null)
  const spotifyId = extractSpotifyId(musicUrl)

  useEffect(() => {
    if (!spotifyId) return
    fetch(`/api/spotify-track?id=${spotifyId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.name) return
        setTrack(data)
        fetch(`/api/lyrics?artist=${encodeURIComponent(data.artist)}&title=${encodeURIComponent(data.name)}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.lyrics) setLyrics(d.lyrics) })
          .catch(() => {})
      })
      .catch(() => {})
  }, [spotifyId])

  if (!spotifyId) return null

  const lyricLines = lyrics
    ? lyrics.split('\n').map(l => l.trim()).filter(l => l && !/^\[.*\]$/.test(l)).slice(0, 12)
    : FALLBACK_LYRICS
  const lines = [...lyricLines, 'quando escuto essa música, eu lembro de você ♡']

  return (
    <ScrollKaraoke chapter="nossa música" lines={lines}
      eyebrow={<span className="text-[#D9C9FF]">nossa música</span>}
      header={p => <Vinyl p={p} track={track} />}
      footer={
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
          <iframe title="Nossa música no Spotify"
            src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
            width="100%" height="80" frameBorder="0" loading="lazy" style={{ display: 'block' }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
        </div>
      } />
  )
}
