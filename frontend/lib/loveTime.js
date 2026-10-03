import { useEffect, useState } from 'react'

/* ══════════════════════════════════════════════════
   Tempo do casal, lua e números do "universo" de vocês
══════════════════════════════════════════════════ */

export const DAY_MS = 86400000

export function parseLocalDate(str) {
  if (!str) return new Date()
  return str.includes('T') ? new Date(str) : new Date(str + 'T12:00:00')
}

export function calcTime(dateStr) {
  const start = parseLocalDate(dateStr).getTime()
  let diff = Math.max(0, Date.now() - start)
  const Y = 31557600000, D = 86400000, H = 3600000, M = 60000, S = 1000
  const years   = Math.floor(diff / Y); diff -= years * Y
  const days    = Math.floor(diff / D); diff -= days  * D
  const hours   = Math.floor(diff / H); diff -= hours * H
  const minutes = Math.floor(diff / M); diff -= minutes * M
  const seconds = Math.floor(diff / S)
  const totalMs = Math.max(0, Date.now() - start)
  const totalDays = Math.floor(totalMs / D)
  return { years, days, hours, minutes, seconds, totalDays, totalHours: Math.floor(totalMs / H), totalMinutes: Math.floor(totalMs / M) }
}

/* tempo que se atualiza sozinho — use só no componente que precisa do tique,
   para não re-renderizar a página inteira a cada segundo */
export function useLiveTime(dateStr, every = 1000) {
  const [time, setTime] = useState(() => (dateStr ? calcTime(dateStr) : null))
  useEffect(() => {
    if (!dateStr) return
    setTime(calcTime(dateStr))
    const id = setInterval(() => setTime(calcTime(dateStr)), every)
    return () => clearInterval(id)
  }, [dateStr, every])
  return time
}

/* ── Lua ─────────────────────────────────────────── */
const SYNODIC = 29.530588853
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) // lua nova de referência

/* fase: 0 = nova, 0.25 = quarto crescente, 0.5 = cheia, 0.75 = quarto minguante */
export function moonPhase(date) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / DAY_MS
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC
  const phase = age / SYNODIC
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2
  return { phase, age, illumination, name: moonName(phase) }
}

export function moonName(phase) {
  if (phase < 0.03 || phase > 0.97) return 'Lua Nova'
  if (phase < 0.22) return 'Lua Crescente'
  if (phase < 0.28) return 'Quarto Crescente'
  if (phase < 0.47) return 'Crescente Gibosa'
  if (phase < 0.53) return 'Lua Cheia'
  if (phase < 0.72) return 'Minguante Gibosa'
  if (phase < 0.78) return 'Quarto Minguante'
  return 'Lua Minguante'
}

/* quantas luas cheias aconteceram entre as duas datas */
export function countFullMoons(start, end = new Date()) {
  const days = (end - start) / DAY_MS
  if (days <= 0) return 0
  const { phase } = moonPhase(start)
  const untilFull = (((0.5 - phase) % 1) + 1) % 1 * SYNODIC
  return days < untilFull ? 0 : 1 + Math.floor((days - untilFull) / SYNODIC)
}

/* a Terra anda ~107.226 km/h em volta do Sol */
export const EARTH_ORBIT_KMH = 107226
