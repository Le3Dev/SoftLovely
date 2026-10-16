import { HEART_PATH } from './scrollMotion'

/* ══════════════════════════════════════════════════
   Imagem 9:16 "escritos nas estrelas" para os Stories,
   a partir do canvas WebGL da cena das estrelas
   (landing e página do casal)
══════════════════════════════════════════════════ */

export async function buildStoryImage(glCanvas, n1, n2) {
  try {
    await Promise.all([
      document.fonts.load('700 96px "Dancing Script"'),
      document.fonts.load('800 34px Montserrat'),
      document.fonts.load('600 32px Montserrat'),
    ])
  } catch {}

  const W = 1080, H = 1920
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')

  const bg = ctx.createRadialGradient(W / 2, H * 0.46, 40, W / 2, H * 0.46, H * 0.8)
  bg.addColorStop(0, '#4A0A26')
  bg.addColorStop(0.55, '#1C0410')
  bg.addColorStop(1, '#0A0206')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  for (let i = 0; i < 320; i++) {
    ctx.fillStyle = `rgba(255,${200 + ((Math.random() * 55) | 0)},${210 + ((Math.random() * 45) | 0)},${Math.random() * 0.7})`
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2.2, 0, Math.PI * 2)
    ctx.fill()
  }

  /* recorte central da cena 3D, somado ao fundo (como a luz das estrelas) */
  const cw = glCanvas.width, ch = glCanvas.height
  const cropH = ch * 0.94
  const cropW = Math.min(cw, cropH * 1.05)
  const drawW = W * 1.02
  const drawH = drawW * (cropH / cropW)
  ctx.globalCompositeOperation = 'lighter'
  ctx.drawImage(glCanvas, (cw - cropW) / 2, (ch - cropH) / 2, cropW, cropH, (W - drawW) / 2, H * 0.5 - drawH / 2, drawW, drawH)
  ctx.globalCompositeOperation = 'source-over'

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if ('letterSpacing' in ctx) ctx.letterSpacing = '8px'
  ctx.fillStyle = 'rgba(255,204,213,0.85)'
  ctx.font = '800 34px Montserrat, sans-serif'
  ctx.fillText(`${n1.toUpperCase()} & ${n2.toUpperCase()}`, W / 2, 230)
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 104px "Dancing Script", cursive'
  ctx.fillText('escritos nas estrelas', W / 2, 330)

  ctx.font = '700 64px "Dancing Script", cursive'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillText('até a última delas ✨', W / 2, 1560)

  const footer = 'Faça o de vocês na SoftLovely'
  ctx.font = '600 32px Montserrat, sans-serif'
  const fw = ctx.measureText(footer).width
  const k = 1.6, iconW = 20 * k, gap = 14
  const left = W / 2 - (iconW + gap + fw) / 2
  ctx.save()
  ctx.translate(left + iconW / 2 - 12 * k, 1772 - 12 * k)
  ctx.scale(k, k)
  ctx.fillStyle = '#FF4D7A'
  ctx.fill(new Path2D(HEART_PATH))
  ctx.restore()
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText(footer, left + iconW + gap, 1772)

  return new Promise(resolve => c.toBlob(resolve, 'image/png'))
}

/* compartilha direto (celular) ou baixa o PNG (computador) */
export async function shareStoryImage(blob, n1, n2) {
  const slug = `${n1}-${n2}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '')
  const file = new File([blob], `softlovely-${slug}.png`, { type: 'image/png' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Nossos nomes nas estrelas', text: 'Olha o que eu fiz pra gente ✨' })
    } catch {}
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
