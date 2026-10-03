import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import {
  Heart, Sparkles, Flower2, Star, Music, Music2, Music3, Music4,
  Lock, Gem, Trophy, Gift, Mail, BookOpen, Calendar, Clock, Sun, Moon,
  Zap, PartyPopper, Camera, Image as ImageIcon, Share2, Download, QrCode,
  ArrowRight, ChevronLeft, ChevronRight, Infinity as InfinityIcon, Flame,
  Sparkle, Wand2, Rocket, Crown, Copy, Check, Send, Volume2, Play,
  Shuffle, RefreshCw, Dices, Gift as GiftIcon, PenLine, Wine, Plane, Home,
} from 'lucide-react'

import { parseLocalDate, useLiveTime } from '../../lib/loveTime'
import { RESPECT_REDUCED_MOTION } from '../../lib/scrollMotion'
import { useStoryScrollFx, useSmoothScroll, StoryThread } from '../../components/story/StoryKit'
import { SkyBackdrop } from '../../components/story/SkyBackdrop'
import { StoryOpening } from '../../components/story/StoryOpening'
import { MoonSky } from '../../components/story/MoonSky'
import { ScrollCounter } from '../../components/story/ScrollCounter'
import { HeartbeatSync } from '../../components/story/HeartbeatSync'
import { MusicChapter } from '../../components/story/MusicChapter'
import { HeartReveal } from '../../components/story/HeartReveal'
import { PhotoClothesline } from '../../components/story/PhotoClothesline'
import { ThreadTimeline } from '../../components/story/ThreadTimeline'
import { LoveUniverse } from '../../components/story/LoveUniverse'
import { NextChapter } from '../../components/story/NextChapter'
import { EnvelopeLetter } from '../../components/story/EnvelopeLetter'
import { StoryFinale } from '../../components/story/StoryFinale'
import { LoveGate } from '../../components/story/LoveGate'
import { useStoryMusic, MusicPill } from '../../components/story/StoryMusic'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

/* ── helpers ─────────────────────────────────────── */
function hexToRgb(hex) {
  if (!hex) return '201,24,74'
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r},${g},${b}`
}

function extractSpotifyId(url) {
  if (!url) return null
  const m = url.match(/(?:open\.spotify\.com\/track\/|spotify:track:)([A-Za-z0-9]+)/)
  return m ? m[1] : null
}

/* ── hook: dispara uma vez ao entrar (animações de entrada) */
function useInView(threshold = 0.35) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ── particulas locais ───────────────────────────── */
/* ── partículas flutuantes com ícones vetoriais (substitui emoji) ── */
function FloatingIcons({ icons = [Heart, Sparkles, Flower2], size = 14, color = 'rgba(255,143,163,0.85)' }) {
  const items = Array.from({ length: icons.length }, (_, i) => ({
    id: i,
    Icon: icons[i % icons.length],
    left: `${8 + i * (80 / icons.length)}%`,
    dur:  `${4 + i * 0.8}s`,
    delay: `${i * 0.6}s`,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map(({ id, Icon, left, dur, delay }) => (
        <span key={id} className="local-particle" style={{ left, bottom: 0, animationDuration: dur, animationDelay: delay }}>
          <Icon size={size + (id % 3) * 4} color={color} fill={color} strokeWidth={1.5} />
        </span>
      ))}
    </div>
  )
}

/* ── corações flutuantes ao tocar na tela (estilo double-tap) ── */
function TapHearts() {
  const [hearts, setHearts] = useState([])
  const idRef = useRef(0)

  useEffect(() => {
    function handler(e) {
      if (e.target.closest('button, a, input, textarea')) return
      const x = e.clientX ?? e.touches?.[0]?.clientX
      const y = e.clientY ?? e.touches?.[0]?.clientY
      if (x == null || y == null) return

      const id    = idRef.current++
      const drift = (Math.random() - 0.5) * 70
      const rot   = (Math.random() - 0.5) * 50
      const big   = Math.random() > 0.7

      setHearts(h => [...h.slice(-11), { id, x, y, drift, rot, big }])
      setTimeout(() => setHearts(h => h.filter(p => p.id !== id)), 1150)
    }
    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {hearts.map(h => (
        <span key={h.id} style={{
          position: 'absolute', left: h.x, top: h.y,
          animation: 'tapHeartRise 1.15s ease-out forwards',
          '--drift': `${h.drift}px`,
          '--rot': `${h.rot}deg`,
        }}>
          <Heart size={h.big ? 34 : 20} color="#FF4D7A" fill="#FF4D7A"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,77,122,0.85))' }} />
        </span>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   SECOES DA PAGINA
═══════════════════════════════════════════════════ */

/* ── Foto em formato de coração ─────────────────────── */
function HeartPhoto({ src, alt = '', size = 220 }) {
  const clipId = useRef(`hclip-${Math.random().toString(36).slice(2)}`).current
  const inner = src ? (
    <img
      src={src}
      alt={alt}
      onError={e => { e.currentTarget.style.display = 'none' }}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg,#7B0033,#C9184A)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}><Heart size={size * 0.32} color="white" fill="white" /></div>
  )

  return (
    <div style={{ position: 'relative', width: size, height: size * 0.92, flexShrink: 0 }}>
      {/* SVG define o clip-path do coração */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.88 C0.08,0.64,0,0.49,0,0.34 C0,0.14,0.13,0.04,0.28,0.04 C0.37,0.04,0.45,0.09,0.5,0.17 C0.55,0.09,0.63,0.04,0.72,0.04 C0.87,0.04,1,0.14,1,0.34 C1,0.49,0.92,0.64,0.5,0.88Z" />
          </clipPath>
        </defs>
      </svg>
      {/* Glow por baixo */}
      <div style={{
        position: 'absolute', inset: 0,
        filter: 'blur(18px)',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(201,24,74,0.7), transparent 70%)',
      }} />
      {/* Imagem com clip */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `url(#${clipId})` }}>
        {inner}
      </div>
      {/* Borda luminosa na forma do coração */}
      <div style={{
        position: 'absolute', inset: -2,
        clipPath: `url(#${clipId})`,
        background: 'linear-gradient(135deg, rgba(255,77,122,0.6), rgba(201,24,74,0.3))',
        zIndex: -1,
      }} />
    </div>
  )
}

/* SECAO 6 — Compartilhar com card Stories completo */
function MusicSticker({ trackInfo, dark = true }) {
  if (!trackInfo) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.07)',
      borderRadius: 20, padding: '4px 10px 4px 4px',
      border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
      maxWidth: '100%',
    }}>
      {trackInfo.albumArt
        ? <img src={trackInfo.albumArt} alt="" style={{ width: 24, height: 24, borderRadius: 5, flexShrink: 0, objectFit: 'cover', display: 'block' }} />
        : <Music2 size={14} style={{ flexShrink: 0 }} />
      }
      <div style={{ overflow: 'hidden', minWidth: 0 }}>
        <p style={{ fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: dark ? 'rgba(255,255,255,0.9)' : '#1a0010' }}>
          {trackInfo.name}
        </p>
        <p style={{ fontSize: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)', marginTop: 1 }}>
          {trackInfo.artist}
        </p>
      </div>
    </div>
  )
}

function SectionShare({ couple, partners, time, qr, pageUrl, firstPhoto, musicUrl }) {
  const [ref, visible]       = useInView()
  const cardRef              = useRef(null)
  const [copied,      setCopied]      = useState(false)
  const [captionCopied, setCaptionCopied] = useState(false)
  const [template,    setTemplate]    = useState('romantic')
  const [downloading, setDownloading] = useState(false)
  const [trackInfo,   setTrackInfo]   = useState(null)

  const names        = partners.map(p => p.name).filter(Boolean)
  const displayTitle = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple.slug
  const totalHours   = time ? time.totalDays * 24 + time.hours   : 0
  const totalMinutes = time ? totalHours * 60 + time.minutes      : 0
  const spotifyId    = extractSpotifyId(musicUrl)

  useEffect(() => {
    if (!spotifyId) return
    fetch(`/api/spotify-track?id=${spotifyId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.name) setTrackInfo(d) })
      .catch(() => {})
  }, [spotifyId])

  function copy() { navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 2500) }

  /* legenda pronta para o post (TikTok / Reels) */
  function copyCaption() {
    const days = time?.totalDays ?? 0
    const caption = `fiz um site pra pessoa que eu mais amo 🥹💌 ${days.toLocaleString('pt-BR')} ${days === 1 ? 'dia' : 'dias'} de nós dois ✨\n\n#softlovely #casal #namorados #amor #surpresa #fyp`
    navigator.clipboard.writeText(caption)
    setCaptionCopied(true)
    setTimeout(() => setCaptionCopied(false), 2500)
  }
  function share() { if (navigator.share) { navigator.share({ title: `${displayTitle} — SoftLovely`, text: 'Veja nossa página especial! ❤️', url: pageUrl }) } else copy() }
  function downloadQr() {
    if (!qr) return
    const a = document.createElement('a'); a.href = qr
    a.download = `qrcode-${couple.slug || displayTitle.replace(/\s/g, '-')}.png`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  async function shareCard() {
    if (downloading) return
    setDownloading(true)
    try {
      await document.fonts.ready
      const W = 1080, H = 1920
      const canvas = document.createElement('canvas')
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')

      /* Lê tema */
      const cs  = document.querySelector('.story-page')
      const tcr = getComputedStyle(cs || document.body).getPropertyValue('--tc-rgb').trim() || '201,24,74'
      const [cr, cg, cb] = tcr.split(',').map(Number)
      const tc  = `rgb(${cr},${cg},${cb})`
      const tcA = (a) => `rgba(${cr},${cg},${cb},${a})`

      /* Carrega capa do álbum */
      let albumImg = null
      if (trackInfo?.albumArt) {
        albumImg = new Image(); albumImg.crossOrigin = 'anonymous'
        await new Promise(res => { albumImg.onload = res; albumImg.onerror = res; albumImg.src = trackInfo.albumArt }).catch(() => {})
        if (!albumImg?.naturalWidth) albumImg = null
      }

      /* Helper: desenha bloco de música (capa + nome + artista) centralizado */
      function drawMusic(centerY, textColor, subColor) {
        if (!trackInfo) return
        const artSize = 96, gap = 22
        const nameStr = trackInfo.name.slice(0, 24)
        const artistStr = trackInfo.artist.slice(0, 26)
        ctx.textAlign = 'center'
        if (albumImg) {
          const blockW = artSize + gap + 480
          const startX = (W - blockW) / 2
          ctx.save()
          if (ctx.roundRect) {
            ctx.beginPath(); ctx.roundRect(startX, centerY - artSize / 2, artSize, artSize, 10); ctx.clip()
          } else {
            ctx.beginPath(); ctx.rect(startX, centerY - artSize / 2, artSize, artSize); ctx.clip()
          }
          ctx.drawImage(albumImg, startX, centerY - artSize / 2, artSize, artSize)
          ctx.restore()
          const tx = startX + artSize + gap
          ctx.textAlign = 'left'
          ctx.fillStyle = textColor; ctx.font = 'bold 48px Montserrat,sans-serif'
          ctx.fillText(nameStr, tx, centerY - 4)
          ctx.fillStyle = subColor; ctx.font = '400 36px Montserrat,sans-serif'
          ctx.fillText(artistStr, tx, centerY + 44)
          ctx.textAlign = 'center'
        } else {
          ctx.fillStyle = textColor; ctx.font = 'bold 46px Montserrat,sans-serif'
          ctx.fillText(`♪  ${nameStr}`, W / 2, centerY)
          ctx.fillStyle = subColor; ctx.font = '400 36px Montserrat,sans-serif'
          ctx.fillText(artistStr, W / 2, centerY + 52)
        }
      }

      if (template === 'minimalist') {
        /* ── MINIMALISTA ── */
        ctx.fillStyle = '#FAFAFA'; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = tc; ctx.fillRect(0, 0, W, 18)
        ctx.fillStyle = '#1a0010'; ctx.font = `900 ${displayTitle.length > 16 ? 80 : 100}px Montserrat,sans-serif`
        ctx.textAlign = 'center'; ctx.fillText(displayTitle, W/2, 820)
        ctx.strokeStyle = tcA(0.4); ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(W*0.25,880); ctx.lineTo(W*0.75,880); ctx.stroke()
        ctx.fillStyle = '#1a0010'; ctx.font = '900 220px Montserrat,sans-serif'
        ctx.fillText(time?.totalDays?.toLocaleString('pt-BR') ?? '0', W/2, 1120)
        ctx.fillStyle = tc; ctx.font = 'bold 58px Montserrat,sans-serif'
        ctx.fillText('DIAS JUNTOS', W/2, 1210)
        if (dateStr) { ctx.fillStyle = '#aaa'; ctx.font = '400 40px Montserrat,sans-serif'; ctx.fillText(`desde ${dateStr}`, W/2, 1320) }
        if (trackInfo) drawMusic(1490, '#333', '#888')
        ctx.fillStyle = '#ddd'; ctx.font = 'bold 34px Montserrat,sans-serif'; ctx.fillText('softlovely.com', W/2, H - 100)

      } else if (template === 'polaroid') {
        /* ── POLAROID ── */
        /* carrega foto */
        let pImg = null
        if (firstPhoto) {
          pImg = new Image(); pImg.crossOrigin = 'anonymous'
          await new Promise(res => { pImg.onload = res; pImg.onerror = res; pImg.src = firstPhoto }).catch(() => {})
          if (!pImg.naturalWidth) pImg = null
        }

        /* fundo rosado */
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
        bgGrad.addColorStop(0, '#f0e6ea'); bgGrad.addColorStop(1, '#fce4ec')
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H)

        /* moldura polaroid centrada */
        const frameW = W * 0.78
        const framePad = 44
        const frameBot = 200
        const photoSide = frameW - framePad * 2
        const frameH = framePad + photoSide + frameBot
        const frameX = (W - frameW) / 2
        const frameY = H * 0.06

        /* sombra da moldura */
        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,0.28)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 24
        ctx.fillStyle = 'white'; ctx.fillRect(frameX, frameY, frameW, frameH)
        ctx.restore()

        /* foto dentro da moldura */
        const photoX = frameX + framePad
        const photoY = frameY + framePad
        ctx.save(); ctx.beginPath(); ctx.rect(photoX, photoY, photoSide, photoSide); ctx.clip()
        if (pImg) {
          const scale = Math.max(photoSide / pImg.naturalWidth, photoSide / pImg.naturalHeight)
          const dw = pImg.naturalWidth * scale, dh = pImg.naturalHeight * scale
          ctx.drawImage(pImg, photoX + (photoSide - dw) / 2, photoY + (photoSide - dh) / 2, dw, dh)
        } else {
          const pGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoSide)
          pGrad.addColorStop(0, '#f5e0e0'); pGrad.addColorStop(1, '#ffe4ec')
          ctx.fillStyle = pGrad; ctx.fillRect(photoX, photoY, photoSide, photoSide)
          ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '220px sans-serif'; ctx.textAlign = 'center'
          ctx.fillText('❤️', W/2, photoY + photoSide * 0.6)
        }
        ctx.restore()

        /* legenda dentro da moldura */
        ctx.fillStyle = '#3a1a1a'
        ctx.font = `700 italic ${displayTitle.length > 16 ? 62 : 78}px Georgia,serif`
        ctx.textAlign = 'center'
        ctx.fillText(displayTitle, W/2, frameY + framePad + photoSide + frameBot * 0.52)

        /* info abaixo da moldura */
        const belowY = frameY + frameH + 80
        if (dateStr) { ctx.fillStyle = '#8b5e6e'; ctx.font = '400 40px Georgia,serif'; ctx.fillText(dateStr, W/2, belowY) }
        ctx.fillStyle = '#7a4040'; ctx.font = 'italic 400 48px Georgia,serif'
        ctx.fillText(`❤  ${time?.totalDays?.toLocaleString('pt-BR') ?? '0'} dias juntos`, W/2, belowY + 74)
        if (trackInfo) drawMusic(belowY + 168, '#7a4040', '#b08080')
        ctx.fillStyle = '#d0b0b0'; ctx.font = '400 32px Georgia,serif'; ctx.fillText('SoftLovely.com', W/2, H - 80)

      } else {
        /* ── ROMÂNTICO (padrão) ── */
        const grad = ctx.createLinearGradient(0, 0, 0, H)
        grad.addColorStop(0, '#0D0208'); grad.addColorStop(0.4, tcA(0.85)); grad.addColorStop(1, '#0D0208')
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
        /* Branding */
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'bold 40px Montserrat,sans-serif'; ctx.textAlign = 'left'
        ctx.fillText('❤  SoftLovely', 80, 130)
        if (dateStr) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '400 36px Montserrat,sans-serif'; ctx.textAlign = 'right'; ctx.fillText(dateStr, W - 80, 130) }
        /* Coração */
        ctx.font = '280px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('❤️', W/2, 640)
        /* Nomes */
        ctx.fillStyle = 'white'; ctx.font = `900 ${displayTitle.length > 16 ? 78 : 96}px Montserrat,sans-serif`
        ctx.fillText(displayTitle, W/2, 810)
        /* Linha */
        ctx.strokeStyle = tcA(0.55); ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(W*0.2, 870); ctx.lineTo(W*0.8, 870); ctx.stroke()
        /* Dias */
        ctx.fillStyle = 'white'; ctx.font = '900 210px Montserrat,sans-serif'
        ctx.fillText(time?.totalDays?.toLocaleString('pt-BR') ?? '0', W/2, 1095)
        ctx.fillStyle = tc; ctx.font = 'bold 58px Montserrat,sans-serif'; ctx.fillText('DIAS JUNTOS', W/2, 1180)
        /* Horas / minutos */
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '400 40px Montserrat,sans-serif'
        ctx.fillText(`${totalHours.toLocaleString('pt-BR')} horas  ·  ${totalMinutes.toLocaleString('pt-BR')} minutos`, W/2, 1270)
        /* Música */
        if (trackInfo) drawMusic(1450, 'rgba(255,255,255,0.82)', 'rgba(255,255,255,0.38)')
        /* Footer */
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.font = 'bold 36px Montserrat,sans-serif'; ctx.fillText('softlovely.com', W/2, H - 100)
      }

      /* Converte para blob e compartilha */
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
      const file = new File([blob], `${displayTitle.replace(/\s+/g,'-')}-stories.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: displayTitle })
      } else if (navigator.share) {
        await navigator.share({ title: displayTitle, text: 'Veja nossa página especial! ❤️', url: pageUrl })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = file.name
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        try { await navigator.share({ title: displayTitle, url: pageUrl }) } catch {}
      }
    } finally { setDownloading(false) }
  }

  const TEMPLATES = [
    { id: 'romantic',   label: 'Romântico',   icon: Flower2 },
    { id: 'minimalist', label: 'Minimalista', icon: Wand2 },
    { id: 'polaroid',   label: 'Polaroid',    icon: Camera },
  ]

  const dateStr = couple.anniversaryDate
    ? parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  /* ── Conteúdo dos 3 templates ── */
  const cardContent = {

    romantic: (
      <>
        <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(160deg,#0D0208,#4A0020)' }}>
          {firstPhoto && <><img src={firstPhoto} alt="" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.22 }} /><div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(13,2,8,0.55) 0%,rgba(74,0,32,0.80) 55%,rgba(13,2,8,0.95) 100%)' }} /></>}
        </div>
        <div className="relative z-10 h-full flex flex-col px-4 py-4" style={{ gap: 0 }}>

          {/* Topo */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1"><Heart size={12} color="white" fill="white" /><span className="text-white/50 font-black tracking-widest uppercase" style={{ fontSize: 9 }}>SoftLovely</span></div>
            {couple.anniversaryDate && <span className="text-white/30" style={{ fontSize: 9 }}>{parseLocalDate(couple.anniversaryDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
          </div>

          <div className="h-px mb-3" style={{ background: 'linear-gradient(to right,transparent,rgba(var(--tc-rgb,201,24,74),0.5),transparent)' }} />

          {/* Foto + nome */}
          <div className="flex flex-col items-center mb-3" style={{ gap: 6 }}>
            <HeartPhoto src={firstPhoto} alt={displayTitle} size={80} />
            <p className="font-black text-white text-center leading-tight" style={{ fontSize: 13, textShadow: '0 0 16px rgba(var(--tc-rgb,201,24,74),0.5)' }}>{displayTitle}</p>
          </div>

          {/* Stats */}
          {time && (
            <div className="rounded-xl mb-2" style={{ background: 'rgba(var(--tc-rgb,201,24,74),0.14)', border: '1px solid rgba(var(--tc-rgb,201,24,74),0.28)', padding: '8px 10px' }}>
              <div className="text-center mb-1.5">
                <p className="font-black text-white leading-none" style={{ fontSize: 28, textShadow: '0 0 20px rgba(255,77,122,0.6)' }}>{time.totalDays.toLocaleString('pt-BR')}</p>
                <p className="font-bold uppercase tracking-wider" style={{ fontSize: 8, color: 'var(--tc,#FF8FA3)' }}>{time.totalDays === 1 ? 'dia juntos' : 'dias juntos'}</p>
              </div>
              <div className="grid grid-cols-2 pt-1.5" style={{ gap: 6, borderTop: '1px solid rgba(var(--tc-rgb,201,24,74),0.2)' }}>
                {[{ val: totalHours.toLocaleString('pt-BR'), label: 'horas' }, { val: totalMinutes.toLocaleString('pt-BR'), label: 'minutos' }].map(({ val, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-black text-white tabular-nums" style={{ fontSize: 11 }}>{val}</p>
                    <p className="text-white/30" style={{ fontSize: 8 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Música */}
          {trackInfo && <div className="mb-2"><MusicSticker trackInfo={trackInfo} dark /></div>}

          <div className="h-px mb-2" style={{ background: 'linear-gradient(to right,transparent,rgba(255,255,255,0.1),transparent)' }} />

          {/* Rodapé */}
          <div className="flex items-center justify-between mt-auto">
            {qr ? <div className="bg-white rounded-lg" style={{ padding: 3 }}><img src={qr} crossOrigin="anonymous" alt="QR" style={{ width: 38, height: 38 }} /></div> : <div />}
            <div className="text-right">
              <p className="text-white/20 font-black tracking-wider" style={{ fontSize: 8 }}>SoftLovely.com</p>
              <p className="text-white/15 flex items-center gap-0.5 justify-end" style={{ fontSize: 7 }}>escaneie para abrir <Heart size={7} fill="currentColor" /></p>
            </div>
          </div>
        </div>
      </>
    ),

    minimalist: (
      <div className="h-full flex flex-col px-6 py-7" style={{ background: '#FAFAFA' }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa', marginBottom: 4 }}>SoftLovely</p>
        <div style={{ height: 1, background: 'linear-gradient(to right, var(--tc,#C9184A), transparent)', marginBottom: 20 }} />
        <p style={{ fontWeight: 900, fontSize: 22, color: '#1a0010', lineHeight: 1.2, textAlign: 'center', marginBottom: 6 }}>{displayTitle}</p>
        {dateStr && <p style={{ fontSize: 10, color: '#999', textAlign: 'center', marginBottom: 20 }}>juntos desde {dateStr}</p>}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <p style={{ fontWeight: 900, fontSize: 56, color: '#1a0010', lineHeight: 1, textAlign: 'center' }}>{time?.totalDays?.toLocaleString('pt-BR') ?? '—'}</p>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--tc,#C9184A)' }}>dias juntos</p>
          <div style={{ height: 1, width: 60, background: 'var(--tc,#C9184A)', opacity: 0.3, margin: '8px 0' }} />
          <p style={{ fontSize: 10, color: '#bbb', textAlign: 'center' }}>{totalHours.toLocaleString('pt-BR')} horas · {totalMinutes.toLocaleString('pt-BR')} minutos</p>
        </div>
        {trackInfo && <div style={{ marginBottom: 12 }}><MusicSticker trackInfo={trackInfo} dark={false} /></div>}
        <div style={{ height: 1, background: '#eee', margin: '8px 0 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {qr ? <img src={qr} crossOrigin="anonymous" alt="QR" style={{ width: 44, height: 44, borderRadius: 8 }} /> : <div />}
          <p style={{ fontSize: 9, color: '#ccc', fontWeight: 700, letterSpacing: '0.1em' }}>softlovely.com</p>
        </div>
      </div>
    ),

    polaroid: (
      <div className="h-full flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #f0e6ea 0%, #fce4ec 100%)', padding: '16px 16px 20px' }}>
        {/* Moldura polaroid: padding igual nos 3 lados + maior embaixo */}
        <div style={{
          background: 'white',
          padding: '10px 10px 0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.1)',
          width: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Foto dentro da moldura */}
          <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#f5e0e6', display: 'block' }}>
            {firstPhoto
              ? <img src={firstPhoto} crossOrigin="anonymous" alt="casal" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={40} color="#C9184A" fill="#C9184A" /></div>
            }
          </div>
          {/* Área branca inferior (legenda dentro da moldura) */}
          <div style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 12, color: '#3a1a1a', textAlign: 'center', lineHeight: 1.2 }}>{displayTitle}</p>
          </div>
        </div>
        {/* Info abaixo da moldura */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 10 }}>
          <p style={{ fontSize: 8, color: '#8b5e6e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{dateStr ?? ''}</p>
          {time && <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 9, color: '#7a4040', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={9} fill="#7a4040" /> {time.totalDays.toLocaleString('pt-BR')} dias juntos</p>}
          {trackInfo && <MusicSticker trackInfo={trackInfo} dark={false} />}
          <p style={{ fontSize: 7, color: '#b08090', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>SoftLovely.com</p>
        </div>
      </div>
    ),
  }

  return (
    <div id="section-share" ref={ref} data-chapter="compartilhar" className="story-section !h-auto min-h-[100svh] px-4">

      <FloatingIcons icons={[Heart, Sparkles, Flower2, Heart, Star]} />

      <div className="section-content-lg relative z-10 w-full max-w-sm mx-auto flex flex-col items-center gap-3 pt-8 pb-24">

        <p className={`text-white/50 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          Compartilhe nos Stories
        </p>

        {/* Seletor de template */}
        <div className={`flex gap-2 w-full transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '0.1s' }}>
          {TEMPLATES.map(t => (
            <motion.button key={t.id} type="button" onClick={() => setTemplate(t.id)}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              style={{
                background: template === t.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                border:     template === t.id ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color:      template === t.id ? 'white' : 'rgba(255,255,255,0.4)',
              }}>
              <t.icon size={13} /> {t.label}
            </motion.button>
          ))}
        </div>

        {/* Card com ref para captura */}
        <div ref={cardRef}
          className={`stories-card transition-all duration-700 overflow-hidden ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} ${template === 'romantic' ? 'animate-glow' : ''}`}
          style={{ transitionDelay: '0.15s', borderRadius: template === 'polaroid' ? '4px' : '24px' }}>
          {cardContent[template]}
        </div>

        {/* Botão principal — gera imagem e abre Stories */}
        <motion.button onClick={shareCard} disabled={downloading}
          whileHover={{ scale: downloading ? 1 : 1.02 }}
          whileTap={{ scale: downloading ? 1 : 0.96 }}
          className={`shimmer w-full py-4 rounded-xl font-black text-white text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '0.3s', background: 'linear-gradient(135deg,var(--tc,#C9184A),rgba(var(--tc-rgb,201,24,74),0.7))', boxShadow: '0 8px 24px rgba(var(--tc-rgb,201,24,74),0.4)' }}>
          {downloading
            ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}><RefreshCw size={16} /></span> gerando imagem...</>
            : <><Send size={16} /> Compartilhar nos Stories</>}
        </motion.button>

        {/* Botão secundário — copiar link */}
        <motion.button onClick={copy}
          whileTap={{ scale: 0.96 }}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${visible ? 'opacity-100' : 'opacity-0'} ${copied ? 'bg-green-500 text-white' : ''}`}
          style={{ transitionDelay: '0.4s', background: copied ? '' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: copied ? 'white' : 'rgba(255,255,255,0.7)' }}>
          {copied ? <><Check size={15} /> Link copiado!</> : <><Copy size={15} /> Copiar link da página</>}
        </motion.button>

        {qr && (
          <motion.button onClick={downloadQr}
            whileTap={{ scale: 0.96 }}
            className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '0.5s', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
            <QrCode size={16} /> Baixar QR Code
          </motion.button>
        )}

        {/* legenda pronta */}
        <motion.button onClick={copyCaption}
          whileTap={{ scale: 0.96 }}
          className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '0.55s', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
          {captionCopied ? <><Check size={15} /> Legenda copiada!</> : <><Copy size={15} /> Copiar legenda com hashtags</>}
        </motion.button>

        {/* para quem recebeu o link: faça uma também */}
        <a href="/" className="mt-3 w-full rounded-2xl p-4 text-left flex items-center gap-3 transition hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)' }}>
          <span className="text-2xl">💘</span>
          <span className="flex-1">
            <span className="block text-white text-sm font-black">Quer surpreender alguém assim?</span>
            <span className="block text-white/50 text-xs">Crie a página de vocês em 2 minutos</span>
          </span>
          <ArrowRight size={16} className="text-white/60" />
        </a>

        <p className="text-white/15 text-xs font-bold tracking-wider pb-2 flex items-center justify-center gap-1">SoftLovely <Heart size={11} fill="currentColor" /></p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PAGINA PRINCIPAL
═══════════════════════════════════════════════════ */
export default function CouplePage() {
  const router = useRouter()
  const { hash } = router.query

  const [couple,   setCouple]   = useState(null)
  const [partners, setPartners] = useState([])
  const [events,   setEvents]   = useState([])
  const [qr,       setQr]       = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!hash) return
    ;(async () => {
      try {
        const { data: c } = await axios.get(`${API_BASE}/api/couples/hash/${hash}`)
        setCouple(c)
        if (c.id) {
          try { const { data } = await axios.get(`${API_BASE}/api/partners/c/${c.id}`); setPartners(data || []) } catch {}
          try { const { data } = await axios.get(`${API_BASE}/api/events/c/${c.id}`);  setEvents(data || []) } catch {}
          try { const { data } = await axios.get(`${API_BASE}/api/couples/${c.id}/qrcode`); setQr(data.qrCode || data) } catch {}
        }
      } catch { setError('Pagina nao encontrada') }
      finally  { setLoading(false) }
    })()
  }, [hash])

  /* a página toda só precisa do tempo minuto a minuto; quem mostra os
     segundos (o placar ao vivo) tem o próprio relógio — assim a história
     inteira não re-renderiza a cada segundo */
  const time = useLiveTime(couple?.anniversaryDate, 60000)

  /* a página é uma história contínua: efeitos por seção, fio vermelho,
     céu que muda de cor e rolagem suave (ver components/story) */
  const pageRef = useRef(null)
  const ready = !loading && !error && !!couple
  useStoryScrollFx(ready)
  useSmoothScroll(ready)

  /* entrada "você me ama?" e trilha sonora */
  const [gateDone, setGateDone] = useState(false)
  const music = useStoryMusic(couple?.musicUrl)

  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${hash}` : ''

  /* nomes sempre com inicial maiúscula ("pedro" → "Pedro") */
  const shownPartners = partners.map(p => ({ ...p, name: p.name ? p.name.trim().charAt(0).toUpperCase() + p.name.trim().slice(1) : p.name }))
  const names = shownPartners.map(p => p.name).filter(Boolean)
  const coupleName = names.length >= 2 ? `${names[0]} & ${names[1]}` : couple?.slug || ''

  const resolveUrl = url => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE}${url}`
  }
  const getImg = o => resolveUrl(
    o?.profileImageUrl || o?.imageUrl || o?.image_url
    || o?.photoUrl || o?.photo_url
    || o?.fileUrl  || o?.file_url
    || o?.image    || o?.photo    || o?.url || o?.src || null
  )
  const firstPhoto = [...partners, ...events].map(getImg).find(Boolean) || null


  const loveLetter      = events.find(e => e.category === 'love_letter')
  const timelineEvents  = events.filter(e => e.category === 'timeline').sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0))
  const coverPhotoEvent = events.find(e => e.category === 'cover_photo')

  /* fotos da galeria (fora a de capa e fotos antigas da caixa surpresa, que saiu) */
  const coverPhoto    = coverPhotoEvent ? resolveUrl(coverPhotoEvent.imageUrl) : null
  const galleryPhotos = events
    .filter(e => e.imageUrl && e.category !== 'surprise_box' && e.category !== 'cover_photo')
    .map(e => resolveUrl(e.imageUrl))
  const revealPhotos  = galleryPhotos.length ? galleryPhotos : coverPhoto ? [coverPhoto] : []
  const startDate     = couple?.anniversaryDate ? parseLocalDate(couple.anniversaryDate) : null
  const dateStr       = startDate?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) || null

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(150deg, #0D0208, #4A0020)' }}>
      <div className="text-center">
        <div className="mb-4 animate-heartbeat flex justify-center"><Heart size={56} color="#FF4D7A" fill="#FF4D7A" /></div>
        <p className="text-white/40 text-sm font-semibold tracking-widest uppercase">carregando...</p>
      </div>
    </div>
  )

  if (error || !couple) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(150deg, #0D0208, #4A0020)' }}>
      <div className="text-center">
        <div className="mb-4 flex justify-center"><Heart size={48} color="#FF4D7A" strokeWidth={1.5} style={{ opacity: 0.4 }} /></div>
        <h1 className="text-xl font-black text-white mb-2">Pagina nao encontrada</h1>
        <p className="text-white/40 text-sm mb-6">{error}</p>
        <button onClick={() => router.push('/')}
          className="px-6 py-3 bg-white text-love-700 rounded-xl font-bold">
          Voltar ao inicio
        </button>
      </div>
    </div>
  )

  const themeColor = couple.themeColor || '#C9184A'
  const themeRgb   = hexToRgb(themeColor)

  const ogTitle = coupleName ? `${coupleName} — SoftLovely` : 'SoftLovely'
  const ogDesc  = time?.totalDays
    ? `${time.totalDays.toLocaleString('pt-BR')} dias de amor. Uma página especial feita só para vocês dois. 💕`
    : 'Uma página animada e privada, feita especialmente para um casal apaixonado.'

  return (
    <div ref={pageRef} className={`story-page font-sans${RESPECT_REDUCED_MOTION ? ' respect-rm' : ''}`} style={{ '--tc': themeColor, '--tc-rgb': themeRgb }}>

      <Head>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDesc} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:type" content="website" />
        {pageUrl && <meta property="og:url" content={pageUrl} />}
        {firstPhoto && <meta property="og:image" content={firstPhoto} />}
        <meta name="twitter:card" content={firstPhoto ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDesc} />
        {firstPhoto && <meta name="twitter:image" content={firstPhoto} />}
      </Head>

      <SkyBackdrop rootRef={pageRef} />
      <TapHearts />
      <StoryThread rootRef={pageRef} />

      {/* entrada: "você me ama?" — o primeiro toque também solta a música */}
      {!gateDone && <LoveGate onOpen={music.play} onAccept={music.play} onDone={() => setGateDone(true)} />}
      {gateDone && <MusicPill music={music} />}

      {/* 1. Era uma vez — as duas metades da foto se encontram puxadas pelo fio */}
      <StoryOpening partners={shownPartners} coupleName={coupleName} dateStr={dateStr}
        totalDays={time?.totalDays} photo={coverPhoto || galleryPhotos[0] || null} />

      {/* 2. O céu daquela noite — a lua real do primeiro dia e a constelação de vocês */}
      <MoonSky start={startDate} coupleName={coupleName} themeColor={themeColor} />

      {/* 3. Cada dia conta — a folhinha vira dia a dia com o scroll */}
      <ScrollCounter totalDays={time?.totalDays} start={startDate} anniversaryDate={couple.anniversaryDate} />

      {/* 4. Dois corações, um ritmo — os batimentos sincronizam */}
      <HeartbeatSync names={names} totalMinutes={time?.totalMinutes} />

      {/* 5. Nossa música — vinil, letra em karaokê e o play */}
      {couple.musicUrl && <MusicChapter musicUrl={couple.musicUrl} />}

      {/* 6. Nós dois — a foto abre por uma janela de coração */}
      <HeartReveal photos={revealPhotos} coupleName={coupleName} dateStr={dateStr} />

      {/* 7. Varal de memórias */}
      <PhotoClothesline photos={galleryPhotos} dateStr={dateStr} />

      {/* 8. Momentos especiais (Premium) — costurados pelo fio */}
      {timelineEvents.length > 0 && <ThreadTimeline events={timelineEvents} />}

      {/* 9. Nosso universo em números */}
      <LoveUniverse start={startDate} time={time} />

      {/* 10. Próximo capítulo — o anel do ano de vocês */}
      <NextChapter start={startDate} />

      {/* 11. Carta de amor (Premium) — sai do envelope */}
      {loveLetter && <EnvelopeLetter letter={loveLetter} />}

      {/* 12. O fio dá um laço: a história continua */}
      <StoryFinale totalDays={time?.totalDays} />

      {/* 13. Compartilhar */}
      <SectionShare
        couple={couple}
        partners={shownPartners}
        time={time}
        qr={qr}
        pageUrl={pageUrl}
        firstPhoto={firstPhoto}
        musicUrl={couple.musicUrl}
      />

    </div>
  )
}
