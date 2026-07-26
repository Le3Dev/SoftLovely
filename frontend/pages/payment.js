import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

const PLANS = [
  {
    id: false,
    name: 'Basico',
    price: '14,90',
    desc: 'Para comecar com o pe direito',
    features: ['Pagina animada personalizada', 'Contador em tempo real', '1 foto por parceiro', 'Musica do Spotify', 'QR Code exclusivo', 'Validade de 30 dias'],
  },
  {
    id: true,
    name: 'Premium',
    price: '19,90',
    desc: 'Para quem quer o melhor',
    features: ['Tudo do Basico', 'Fotos ilimitadas', 'Historia personalizada', 'Compartilhar nos Stories', 'Sem prazo de validade', 'Suporte prioritario'],
    popular: true,
  },
]

export default function Payment() {
  const router = useRouter()
  const { coupleId, isPremium: isPremiumQuery } = router.query

  /* plano fixo — vem da query e não pode ser alterado */
  const isPremium = isPremiumQuery === 'true'

  const [couple,         setCouple]         = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [pageLoading,    setPageLoading]    = useState(true)
  const [message,        setMessage]        = useState('')
  const [customerEmail,  setCustomerEmail]  = useState('')
  const [customerName,   setCustomerName]   = useState('')
  const [customerCpf,    setCustomerCpf]    = useState('')

  useEffect(() => {
    if (!coupleId) return
    axios.get(`${API_BASE}/api/couples/${coupleId}`)
      .then(r => setCouple(r.data))
      .catch(() => setMessage('Erro ao carregar dados do casal'))
      .finally(() => setPageLoading(false))
  }, [coupleId])

  const handleCheckout = async e => {
    e.preventDefault()
    if (!coupleId) { setMessage('ID do casal nao encontrado.'); return }
    if (!customerEmail) { setMessage('Informe seu e-mail para receber o recibo.'); return }
    setLoading(true)
    setMessage('')
    try {
      const { data } = await axios.post(`${API_BASE}/api/payments/checkout`, {
        coupleId,
        isPremium,
        customerEmail: customerEmail.trim(),
        customerName:  customerName.trim(),
        customerCpf:   customerCpf.trim(),
      })
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
      else setMessage('Erro ao criar sessao de pagamento')
    } catch (err) {
      setMessage('Erro: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center font-sans"
      style={{ background: 'linear-gradient(150deg, #0D0208, #4A0020)' }}>
      <div className="text-center">
        <div className="text-5xl animate-heartbeat mb-4">❤️</div>
        <p className="text-white/50 text-sm uppercase tracking-widest">Carregando...</p>
      </div>
    </div>
  )

  const selected = PLANS.find(p => p.id === isPremium)

  return (
    <div className="min-h-screen font-sans py-16 px-4"
      style={{ background: 'linear-gradient(150deg, #0D0208 0%, #1a0010 50%, #2d0019 100%)' }}>

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-love-500 font-bold text-sm uppercase tracking-widest">Finalize sua pagina</span>
          <h1 className="font-black text-white text-4xl mt-2 mb-1">Escolha seu plano</h1>
          {couple && (
            <p className="text-white/40 text-sm">para <span className="text-love-300 font-bold">{couple.slug}</span></p>
          )}
        </div>

        {/* Plano confirmado — bloqueado, sem possibilidade de troca */}
        <div className="mb-8">
          <div className="relative rounded-3xl p-7 border-2 border-love-400 shadow-2xl"
            style={{ background: 'linear-gradient(150deg, #4A0020, #C9184A)' }}>

            {/* Badge de plano confirmado */}
            <span className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
              ✓ Plano confirmado
            </span>

            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{selected.name}</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-white font-black text-4xl">R${selected.price.split(',')[0]}</span>
              <span className="text-white font-black text-xl mb-0.5">,{selected.price.split(',')[1]}</span>
            </div>
            <p className="text-white/40 text-xs mb-5">pagamento unico</p>

            <ul className="space-y-2">
              {selected.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="text-love-300 font-bold flex-shrink-0 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-5 h-1 rounded-full bg-white/30" />
          </div>

          <p className="text-center text-white/25 text-xs mt-3">
            Para trocar de plano, volte ao inicio e refaca o formulario.
          </p>
        </div>

        {/* Resumo + botao */}
        <div className="rounded-3xl p-8"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest">Plano selecionado</p>
              <p className="text-white font-black text-xl mt-0.5">{selected.name}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-widest">Total</p>
              <p className="text-love-300 font-black text-2xl mt-0.5">R${selected.price}</p>
            </div>
          </div>

          {/* Métodos de pagamento aceitos */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/30 text-xs uppercase tracking-widest">Aceito</span>
            <div className="flex gap-2 flex-wrap">
              {/* PIX */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(50,214,163,0.12)', border: '1px solid rgba(50,214,163,0.3)', color: '#32d6a3' }}>
                <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M242.4 292.5C247.8 287.1 255.1 284.3 262.5 284.3C269.8 284.3 277.1 287.1 282.5 292.5L374.3 384.3C389.4 399.4 389.4 423.9 374.3 439L282.5 530.8C277.1 536.2 269.8 539 262.5 539C255.1 539 247.8 536.2 242.4 530.8L150.6 439C135.5 423.9 135.5 399.4 150.6 384.3L242.4 292.5zM262.5 467.5L326.8 403.2L262.5 338.8L198.1 403.2L262.5 467.5zM372.5 150.6L464.3 242.4C479.4 257.5 479.4 281.1 464.3 296.2L372.5 388C367.1 393.4 359.8 396.2 352.5 396.2C345.1 396.2 337.8 393.4 332.4 388L240.6 296.2C225.5 281.1 225.5 257.5 240.6 242.4L332.4 150.6C337.8 145.2 345.1 142.4 352.5 142.4C359.8 142.4 367.1 145.2 372.5 150.6zM352.5 323.8L416.8 259.3L352.5 195L288.1 259.3L352.5 323.8zM150.6 72.96L242.4 164.7C247.8 170.1 255.1 172.9 262.5 172.9C269.8 172.9 277.1 170.1 282.5 164.7L374.3 72.96C389.4 57.85 389.4 33.35 374.3 18.24L282.5-73.54C277.1-78.98 269.8-81.76 262.5-81.76C255.1-81.76 247.8-78.98 242.4-73.54L150.6 18.24C135.5 33.35 135.5 57.85 150.6 72.96zM262.5-19.23L326.8 45.1L262.5 109.5L198.1 45.1L262.5-19.23z"/>
                </svg>
                PIX
              </div>
              {/* Cartão de crédito */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Crédito
              </div>
              {/* Cartão de débito */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  <line x1="5" y1="15" x2="9" y2="15"/>
                </svg>
                Débito
              </div>
            </div>
          </div>

          {/* Modo teste */}
          <div className="mb-5 p-4 rounded-2xl text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/50 font-bold mb-1">🧪 Modo teste</p>
            <p className="text-white/30">Cartao: <code className="text-white/60">4242 4242 4242 4242</code> · Data: 12/26 · CVC: 123</p>
          </div>

          {message && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-300 bg-red-900/20 border border-red-800/30">
              {message}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-3">
            {/* Email */}
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">
                E-mail <span className="text-love-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-love-400"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <p className="text-white/20 text-xs mt-1">Usado para enviar o recibo de pagamento</p>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome (para a nota fiscal)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-love-400"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00 (opcional)"
                value={customerCpf}
                onChange={e => setCustomerCpf(e.target.value)}
                maxLength={14}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-love-400"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <p className="text-white/20 text-xs mt-1">Opcional — inclui o CPF na nota fiscal</p>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading || !coupleId}
                className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #C9184A, #FF4D7A)', boxShadow: '0 8px 30px rgba(201,24,74,0.4)' }}>
                {loading ? '⏳ Redirecionando...' : `Pagar R$${selected.price}`}
              </button>
            </div>
          </form>

          <p className="text-center text-white/20 text-xs mt-4">
            Pagamento 100% seguro processado pelo Stripe 🔒
          </p>
        </div>

        <button onClick={() => router.push('/')}
          className="block mx-auto mt-6 text-white/30 hover:text-white/60 text-sm font-semibold transition">
          ← Voltar ao inicio
        </button>
      </div>
    </div>
  )
}
