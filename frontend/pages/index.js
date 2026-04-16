import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

/* ── Spotify helpers ───────────────────────────────── */
function extractSpotifyId(url) {
  if (!url) return null
  const m = url.match(/(?:open\.spotify\.com\/track\/|spotify:track:)([A-Za-z0-9]+)/)
  return m ? m[1] : null
}

/* ── Dados da pagina ───────────────────────────────── */
const FEATURES = [
  { emoji: '⏱️', title: 'Contador em tempo real',   desc: 'Anos, meses, dias, horas, minutos e segundos — atualizado a cada segundo.' },
  { emoji: '📸', title: 'Fotos de voces',            desc: 'Exiba as fotos mais especiais com design elegante e animado.' },
  { emoji: '🎵', title: 'Musica do Spotify',         desc: 'Cole o link do Spotify e o player completo aparece na pagina de voces.' },
  { emoji: '📖', title: 'Historia personalizada',    desc: 'Escreva a historia de voces como uma surpresa para seu amor.' },
  { emoji: '🎬', title: 'Animacoes incriveis',       desc: 'Pagina com animacoes cinematicas — tipo um story do TikTok.' },
  { emoji: '📱', title: 'Compartilhar nos Stories',  desc: 'Compartilhe direto nos Stories do Instagram com um toque.' },
]

const STEPS = [
  { num: '01', title: 'Escolha o plano',       desc: 'Basico ou Premium — cada um com recursos adaptados ao que voces precisam.' },
  { num: '02', title: 'Preencha os dados',      desc: 'Nome, data, foto, musica do Spotify e (Premium) a historia de voces.' },
  { num: '03', title: 'Surpreenda seu amor',    desc: 'Finalize o pagamento e receba o link e QR Code para a surpresa.' },
]

const COLORS = [
  { name: 'Rosa',    value: '#C9184A' },
  { name: 'Vermelho',value: '#dc2626' },
  { name: 'Roxo',    value: '#7c3aed' },
  { name: 'Azul',    value: '#0284c7' },
  { name: 'Verde',   value: '#059669' },
  { name: 'Laranja', value: '#ea580c' },
]

function FloatingHearts() {
  const [hearts, setHearts] = useState([])
  useEffect(() => {
    setHearts(Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 12 + 10}px`,
      dur:  `${Math.random() * 10 + 9}s`,
      delay:`${Math.random() * 8}s`,
      char: ['❤️','🌹','💋','✨','💖'][i % 5],
    })))
  }, [])
  return (
    <>
      {hearts.map(h => (
        <span key={h.id} className="heart-particle"
          style={{ left: h.left, fontSize: h.size, animationDuration: h.dur, animationDelay: h.delay }}>
          {h.char}
        </span>
      ))}
    </>
  )
}

/* ── Campo de musica com preview Spotify ───────────── */
function SpotifyField({ value, onChange }) {
  const trackId = extractSpotifyId(value)
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        Musica do Spotify <span className="normal-case font-normal text-gray-400">(opcional)</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🎵</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Cole o link da musica no Spotify"
          className="w-full border-2 border-love-100 rounded-xl pl-9 pr-4 py-3 text-sm focus:border-love-400 focus:outline-none transition font-medium"
        />
      </div>
      <p className="text-gray-400 text-xs mt-1.5">
        Abra o Spotify → selecione a musica → compartilhar → copiar link
      </p>
      {trackId && (
        <div className="mt-3 rounded-2xl overflow-hidden shadow-md">
          <iframe
            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
            width="100%" height="80" frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <p className="text-center text-green-600 text-xs font-semibold py-2 bg-green-50">
            ✅ Musica detectada! Ela aparecera na pagina de voces.
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Pagina principal ──────────────────────────────── */
export default function Home() {
  const router = useRouter()

  const [isPremium, setIsPremium] = useState(false)
  const [form, setForm] = useState({
    coupleNames: '', anniversaryDate: '', themeColor: '#C9184A',
    story: '', musicUrl: '', photos: [],
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const handleChange = e => set(e.target.name, e.target.value)

  const maxPhotos = isPremium ? Infinity : 1

  const addPhotos = e => {
    const files = Array.from(e.target.files)
    const available = maxPhotos - form.photos.length
    if (available <= 0) return
    set('photos', [...form.photos, ...files.slice(0, available)])
    e.target.value = ''
  }
  const removePhoto = i => set('photos', form.photos.filter((_, j) => j !== i))

  /* ao mudar para Basico, descarta fotos extras */
  const selectPlan = (premium) => {
    setIsPremium(premium)
    if (!premium && form.photos.length > 1) {
      set('photos', form.photos.slice(0, 1))
    }
    if (!premium) set('story', '')
  }

  const previewDate = form.anniversaryDate
    ? new Date(form.anniversaryDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const slug = form.coupleNames.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const { data } = await axios.post(`${API_BASE}/api/couples`, {
        slug,
        anniversaryDate: form.anniversaryDate,
        themeColor: form.themeColor,
        musicUrl: form.musicUrl || null,
      })
      const id = data.id

      /* cria parceiros (nomes) para exibir na pagina do casal */
      const partnerNames = form.coupleNames
        .split(/\s+(?:e|&|\+|and)\s+/i)
        .map(n => n.trim()).filter(Boolean).slice(0, 2)
      for (const name of partnerNames) {
        try { await axios.post(`${API_BASE}/api/partners`, { coupleId: id, name }) } catch {}
      }

      /* faz upload e CRIA um Event no banco para cada foto */
      if (form.photos.length) {
        try {
          const fd = new FormData()
          form.photos.forEach(p => fd.append('files', p))
          const { data: uploadData } = await axios.post(`${API_BASE}/api/events/${id}/upload-photos`, fd)
          /* uploadData.paths = ["/uploads/coupleId/arquivo.jpg", ...] */
          if (uploadData?.paths?.length) {
            for (const path of uploadData.paths) {
              try {
                await axios.post(`${API_BASE}/api/events`, {
                  coupleId: id,
                  title: 'Foto do casal',
                  imageUrl: path,
                  eventDate: form.anniversaryDate || new Date().toISOString().split('T')[0],
                  category: 'photo',
                })
              } catch {}
            }
          }
        } catch {}
      }

      /* cria evento de historia (apenas Premium) */
      if (isPremium && form.story) {
        try {
          await axios.post(`${API_BASE}/api/events`, {
            coupleId: id, title: 'Nossa Historia',
            description: form.story, eventDate: form.anniversaryDate, category: 'story',
          })
        } catch {}
      }

      setMessage('✅ Dados salvos! Redirecionando...')
      setTimeout(() => router.push(`/payment?coupleId=${id}&isPremium=${isPremium}`), 1400)
    } catch (err) {
      const m = err.response?.data?.message
        || (err.response?.status === 409 ? 'Esse nome ja existe. Tente outro.'
          : !err.response ? 'Sem conexao com o servidor.'
          : 'Algo deu errado. Tente novamente.')
      setMessage(`❌ ${m}`)
    } finally {
      setLoading(false)
    }
  }

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const scrollAndSelectPlan = (premium) => {
    selectPlan(premium)
    scrollTo('criar')
  }

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-love-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-love-600 text-xl animate-heartbeat">❤️</span>
            <span className="font-black text-love-700 text-xl tracking-tight">SoftLovely</span>
          </div>
          <button onClick={() => scrollTo('criar')} className="btn-love text-sm py-2.5 px-5">
            Criar minha pagina
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-28 px-4"
        style={{ background: 'linear-gradient(150deg, #4A0020 0%, #7B0033 35%, #C9184A 70%, #FF4D7A 100%)' }}>
        <FloatingHearts />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,77,122,0.18) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/80 text-sm font-medium mb-8">
            <span className="animate-heartbeat">❤️</span>
            A pagina mais especial do seu relacionamento
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Surpreenda quem<br />
            <span style={{ color: '#FFB3C1' }}>voce ama</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Crie uma pagina animada e privada com contador, fotos, musica do Spotify e sua historia — para compartilhar nos Stories.
          </p>
          <button onClick={() => scrollTo('criar')}
            className="inline-block bg-white text-love-600 font-black text-lg px-10 py-4 rounded-2xl shadow-2xl hover:shadow-love-400/40 transition-all hover:-translate-y-1">
            Criar nossa pagina ✨
          </button>
          <p className="text-white/40 text-sm mt-4">Menos de 2 minutos · Pagamento seguro</p>
        </div>

        {/* Mockup */}
        <div className="relative z-10 max-w-xs mx-auto mt-16 animate-float">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            style={{ background: 'linear-gradient(160deg, #7B0033, #C9184A)' }}>
            <div className="p-6 text-center text-white">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl border-2 border-white/30">👩</div>
                <span className="text-3xl animate-heartbeat">❤️</span>
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl border-2 border-white/30">👨</div>
              </div>
              <p className="font-black text-xl mb-1">Ana & Pedro</p>
              <p className="text-white/60 text-xs mb-4">juntos desde 14 de fev. de 2022</p>
              <div className="grid grid-cols-3 gap-2">
                {[['3','Anos'],['47','Dias'],['12','Horas']].map(([n,l]) => (
                  <div key={l} className="bg-white/15 rounded-xl py-2">
                    <div className="font-black text-2xl">{n}</div>
                    <div className="text-white/60 text-xs">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4 bg-love-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-love-500 font-bold text-sm uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-4xl font-black text-love-900">Tudo que o amor merece</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-love-100 shadow-sm hover:shadow-md hover:border-love-300 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-love-100 flex items-center justify-center text-2xl mb-4">{emoji}</div>
                <h3 className="font-bold text-love-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-love-500 font-bold text-sm uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-4xl font-black text-love-900">3 passos simples</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="text-center animate-fadeInUp" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center font-black text-2xl text-white"
                  style={{ background: 'linear-gradient(135deg, #C9184A, #FF4D7A)' }}>
                  {num}
                </div>
                <h3 className="font-bold text-love-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="py-24 px-4 bg-love-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-love-500 font-bold text-sm uppercase tracking-widest mb-3">Planos</p>
            <h2 className="text-4xl font-black text-love-900">Escolha o de voces</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-white rounded-3xl p-8 border-2 border-love-100 shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Basico</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-love-600 font-black text-4xl">R$14</span>
                <span className="text-love-600 font-black text-2xl mb-0.5">,90</span>
              </div>
              <p className="text-gray-400 text-xs mb-6">pagamento unico</p>
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                {['Pagina animada personalizada','Contador em tempo real','1 foto do casal','Musica do Spotify','QR Code exclusivo','Validade de 30 dias'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-love-100 text-love-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollAndSelectPlan(false)}
                className="w-full py-3.5 rounded-xl border-2 border-love-300 text-love-600 font-bold hover:bg-love-50 transition text-sm">
                Comecar agora
              </button>
            </div>

            <div className="relative rounded-3xl p-8 border-2 border-love-500 shadow-xl overflow-hidden"
              style={{ background: 'linear-gradient(150deg, #4A0020 0%, #C9184A 100%)' }}>
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                Mais popular ❤️
              </div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Premium</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-white font-black text-4xl">R$19</span>
                <span className="text-white font-black text-2xl mb-0.5">,90</span>
              </div>
              <p className="text-white/50 text-xs mb-6">pagamento unico · para sempre</p>
              <ul className="space-y-3 text-sm text-white/80 mb-8">
                {['Tudo do Basico','Fotos ilimitadas','Historia personalizada','Compartilhar nos Stories','Pagina sem prazo de validade','Suporte prioritario'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollAndSelectPlan(true)}
                className="w-full py-3.5 rounded-xl bg-white text-love-700 font-bold hover:bg-love-50 transition text-sm shadow-lg">
                Quero o Premium ✨
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section id="criar" className="py-24 px-4"
        style={{ background: 'linear-gradient(160deg, #4A0020 0%, #C9184A 60%, #FF4D7A 100%)' }}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-5xl animate-heartbeat inline-block mb-4">❤️</div>
            <h2 className="text-4xl font-black text-white mb-2">Crie a pagina de voces</h2>
            <p className="text-white/60">Preencha e surpreenda quem voce ama</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-2xl space-y-5">

            {/* ── SELECAO DE PLANO ── */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">1. Escolha seu plano</p>
              <div className="grid grid-cols-2 gap-3">

                {/* Basico */}
                <button type="button" onClick={() => selectPlan(false)}
                  className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    !isPremium ? 'border-love-500 bg-love-50 shadow-md' : 'border-gray-200 hover:border-love-200'
                  }`}>
                  {!isPremium && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-love-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                  <p className="font-black text-love-600 text-xl leading-none">R$14<span className="text-base">,90</span></p>
                  <p className="text-xs font-bold text-gray-500 mt-1">Basico</p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">1 foto · Musica<br />QR Code · 30 dias</p>
                </button>

                {/* Premium */}
                <button type="button" onClick={() => selectPlan(true)}
                  className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isPremium ? 'border-love-500 shadow-md' : 'border-gray-200 hover:border-love-200'
                  }`}
                  style={isPremium ? { background: 'linear-gradient(135deg, #4A0020, #C9184A)' } : {}}>
                  <div className="absolute top-2 right-2 bg-white/20 border border-white/30 text-white rounded-full px-1.5 py-0.5"
                    style={{ fontSize: '8px', fontWeight: 700, color: isPremium ? 'white' : '#C9184A', background: isPremium ? 'rgba(255,255,255,0.2)' : '#FFF0F4' }}>
                    POPULAR
                  </div>
                  {isPremium && (
                    <div className="absolute top-2 right-14 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                  <p className={`font-black text-xl leading-none ${isPremium ? 'text-white' : 'text-love-600'}`}>
                    R$19<span className="text-base">,90</span>
                  </p>
                  <p className={`text-xs font-bold mt-1 ${isPremium ? 'text-white/70' : 'text-gray-500'}`}>Premium</p>
                  <p className={`text-xs mt-2 leading-relaxed ${isPremium ? 'text-white/60' : 'text-gray-400'}`}>
                    Fotos ilimitadas<br />Historia · Para sempre
                  </p>
                </button>
              </div>

              {/* Badge do plano selecionado */}
              <p className="text-center text-xs mt-3 font-semibold text-love-500">
                {isPremium ? '✨ Plano Premium selecionado' : '📦 Plano Basico selecionado'}
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* ── DADOS ── */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nomes do casal</label>
              <input type="text" name="coupleNames" value={form.coupleNames} onChange={handleChange}
                placeholder="Ex: Ana e Pedro" required
                className="w-full border-2 border-love-100 rounded-xl px-4 py-3 text-sm focus:border-love-400 focus:outline-none transition font-medium" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data de inicio do relacionamento</label>
              <input type="date" name="anniversaryDate" value={form.anniversaryDate} onChange={handleChange} required
                className="w-full border-2 border-love-100 rounded-xl px-4 py-3 text-sm focus:border-love-400 focus:outline-none transition font-medium" />
              {previewDate && <p className="text-love-500 text-xs mt-1.5 font-semibold">❤️ Juntos desde {previewDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cor do tema</label>
              <div className="flex gap-2.5 flex-wrap">
                {COLORS.map(c => (
                  <button key={c.value} type="button" title={c.name}
                    onClick={() => set('themeColor', c.value)}
                    className={`w-10 h-10 rounded-xl transition-all hover:scale-110 ${form.themeColor === c.value ? 'ring-[3px] ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ backgroundColor: c.value }} />
                ))}
              </div>
            </div>

            {/* Historia — apenas Premium */}
            {isPremium && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Historia de voces <span className="normal-case font-normal text-gray-400">(aparece na pagina como surpresa)</span>
                </label>
                <textarea name="story" value={form.story} onChange={handleChange}
                  placeholder="Como voces se conheceram? Qual foi o primeiro beijo? Escreva para seu amor ler..."
                  rows={4} className="w-full border-2 border-love-100 rounded-xl px-4 py-3 text-sm focus:border-love-400 focus:outline-none transition resize-none font-medium" />
              </div>
            )}

            {/* Campo Spotify */}
            <SpotifyField value={form.musicUrl} onChange={v => set('musicUrl', v)} />

            {/* Fotos — limitado pelo plano */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {isPremium
                  ? <>Fotos de voces <span className="normal-case font-normal text-gray-400">(ilimitadas)</span></>
                  : <>Foto do casal <span className="normal-case font-normal text-gray-400">(1 foto — plano Basico)</span></>
                }
              </label>

              {/* Botao de upload — esconde se basico ja tem 1 foto */}
              {(isPremium || form.photos.length < 1) && (
                <>
                  <label htmlFor="fotos"
                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-love-200 rounded-xl p-5 cursor-pointer hover:border-love-400 hover:bg-love-50 transition">
                    <span className="text-2xl">📷</span>
                    <span className="text-sm text-gray-500 font-medium">
                      {isPremium ? 'Clique para adicionar fotos' : 'Clique para adicionar a foto'}
                    </span>
                    <span className="text-xs text-gray-400">So voces terao acesso — pagina 100% privada</span>
                  </label>
                  <input id="fotos" type="file" multiple={isPremium} accept="image/*" onChange={addPhotos} className="hidden" />
                </>
              )}

              {!isPremium && form.photos.length >= 1 && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-1">
                  Plano Basico permite apenas 1 foto. Quer mais fotos? Selecione o Premium acima.
                </p>
              )}

              {form.photos.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {form.photos.map((p, i) => (
                    <div key={i} className="relative group">
                      <img src={URL.createObjectURL(p)} alt="" className="w-full h-16 object-cover rounded-lg" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-semibold ${message.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-black text-base text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
              style={{ background: loading ? '#ccc' : 'linear-gradient(135deg, #C9184A, #FF4D7A)' }}>
              {loading ? '❤️ Criando...' : `Criar nossa pagina ${isPremium ? 'Premium' : 'Basica'} ❤️`}
            </button>
            <p className="text-center text-gray-400 text-xs">Pagamento seguro via Stripe 🔒</p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 text-center bg-love-900">
        <span className="text-white/30 text-xl animate-heartbeat inline-block">❤️</span>
        <p className="font-black text-white text-xl mt-2 tracking-tight">SoftLovely</p>
        <p className="text-white/30 text-xs mt-1">Feito com amor para casais apaixonados · 2026</p>
      </footer>
    </div>
  )
}
