import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { extractSpotifyId } from './MusicChapter'

/* ══════════════════════════════════════════════════
   TRILHA SONORA — a música do casal tocando durante a história
   (trecho de 30s via /api/spotify-preview, que cai no Deezer
   quando o Spotify não tem prévia). Só começa com um toque —
   navegadores bloqueiam áudio sem gesto do usuário.
══════════════════════════════════════════════════ */

export function useStoryMusic(musicUrl) {
  const audioRef = useRef(null)
  const [track, setTrack] = useState(null)
  const [playing, setPlaying] = useState(false)
  const id = extractSpotifyId(musicUrl)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetch(`/api/spotify-preview?trackId=${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled || !d?.previewUrl) return
        const a = new Audio(d.previewUrl)
        a.loop = true
        a.preload = 'auto'
        a.volume = 0.85
        a.addEventListener('play', () => setPlaying(true))
        a.addEventListener('pause', () => setPlaying(false))
        audioRef.current = a
        setTrack({ name: d.name, artist: d.artist, albumArt: d.albumArt })
      })
      .catch(() => {})
    const onHide = () => { if (document.hidden) audioRef.current?.pause() }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onHide)
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [id])

  /* chame direto no handler do toque (sem await antes) para o play ser liberado */
  const play = useCallback(() => { audioRef.current?.play().catch(() => {}) }, [])
  const pause = useCallback(() => { audioRef.current?.pause() }, [])
  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }, [])
  const restart = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }, [])

  return { track, playing, play, pause, toggle, restart }
}

/* mini player flutuante */
export function MusicPill({ music }) {
  const { track, playing, toggle } = music
  return (
    <div className="fixed left-3 bottom-3 md:left-5 md:bottom-5 z-50 flex items-center gap-2">
      {track && (
        <button type="button" onClick={toggle} aria-label={playing ? 'Pausar música' : 'Tocar música'}
          className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-white shadow-xl"
          style={{ background: 'rgba(13,2,8,0.78)', border: '1px solid rgba(255,255,255,0.14)' }}>
          <span className={`block w-9 h-9 rounded-full overflow-hidden border border-white/20 ${playing ? 'animate-spin-slow' : ''}`}>
            {track.albumArt && <img src={track.albumArt} alt="" className="w-full h-full object-cover" />}
          </span>
          <span className="text-left max-w-[118px]">
            <span className="block text-[11px] font-bold leading-tight truncate">{track.name}</span>
            <span className="block text-[10px] text-white/55 leading-tight">{playing ? 'tocando ♪' : 'toque para ouvir'}</span>
          </span>
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
      )}
    </div>
  )
}
