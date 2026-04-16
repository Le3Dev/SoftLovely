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

  const [isPremium,    setIsPremium]    = useState(false)
  const [couple,       setCouple]       = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [pageLoading,  setPageLoading]  = useState(true)
  const [message,      setMessage]      = useState('')

  /* pre-seleciona plano vindo da pagina inicial */
  useEffect(() => {
    if (isPremiumQuery !== undefined) {
      setIsPremium(isPremiumQuery === 'true')
    }
  }, [isPremiumQuery])

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
    setLoading(true)
    setMessage('')
    try {
      const { data } = await axios.post(`${API_BASE}/api/payments/checkout`, { coupleId, isPremium })
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

        {/* Cards de plano */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {PLANS.map(plan => (
            <button key={String(plan.id)} type="button"
              onClick={() => setIsPremium(plan.id)}
              className={`relative text-left rounded-3xl p-7 border-2 transition-all duration-300 ${
                isPremium === plan.id
                  ? 'border-love-400 scale-[1.02] shadow-2xl'
                  : 'border-white/10 hover:border-white/25'
              }`}
              style={{
                background: isPremium === plan.id
                  ? 'linear-gradient(150deg, #4A0020, #C9184A)'
                  : 'rgba(255,255,255,0.05)',
              }}>

              {plan.popular && (
                <span className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                  Popular ❤️
                </span>
              )}

              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">{plan.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-white font-black text-4xl">R${plan.price.split(',')[0]}</span>
                <span className="text-white font-black text-xl mb-0.5">,{plan.price.split(',')[1]}</span>
              </div>
              <p className="text-white/40 text-xs mb-5">pagamento unico</p>

              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-love-300 font-bold flex-shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Indicador selecionado */}
              <div className={`mt-5 h-1 rounded-full transition-all duration-300 ${isPremium === plan.id ? 'bg-white/40' : 'bg-white/10'}`} />
            </button>
          ))}
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

          <form onSubmit={handleCheckout}>
            <button type="submit" disabled={loading || !coupleId}
              className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #C9184A, #FF4D7A)', boxShadow: '0 8px 30px rgba(201,24,74,0.4)' }}>
              {loading ? '⏳ Redirecionando...' : `💳 Pagar R$${selected.price}`}
            </button>
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
