import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default function PaymentSuccess() {
  const router = useRouter()
  const { coupleId } = router.query
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [count,   setCount]   = useState(5)   // contador de redirecionamento

  useEffect(() => {
    if (!coupleId) return
    axios.get(`${API_BASE}/api/payments/success/${coupleId}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [coupleId])

  /* Redireciona automaticamente para a pagina do casal apos 5s */
  useEffect(() => {
    if (!data?.coupleHash) return
    if (count <= 0) {
      router.push(`/c/${data.coupleHash}`)
      return
    }
    const id = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [data, count, router])

  const coupleUrl = data?.coupleHash ? `/c/${data.coupleHash}` : null

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-sans"
      style={{ background: 'linear-gradient(150deg, #0D0208, #4A0020)' }}>
      <div className="text-center">
        <div className="text-5xl animate-heartbeat mb-4">❤️</div>
        <p className="text-white/50 text-sm uppercase tracking-widest">Confirmando pagamento...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center px-4 font-sans"
      style={{ background: 'linear-gradient(150deg, #0D0208, #4A0020)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">💔</div>
        <h1 className="text-xl font-black text-white mb-2">Erro ao confirmar pagamento</h1>
        <p className="text-white/40 text-sm mb-6">Nao encontramos os dados do seu pagamento.</p>
        <button onClick={() => router.push('/')}
          className="px-6 py-3 bg-white text-love-700 rounded-xl font-bold">
          Voltar ao inicio
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 font-sans"
      style={{ background: 'linear-gradient(150deg, #4A0020 0%, #7B0033 50%, #C9184A 100%)' }}>

      {/* Particulas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['❤️','✨','🌹','💖','🎉'].map((e, i) => (
          <span key={i} className="heart-particle"
            style={{ left: `${10 + i * 18}%`, fontSize: '18px', animationDuration: `${6 + i}s`, animationDelay: `${i * 0.8}s` }}>
            {e}
          </span>
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6">

        {/* Icone de sucesso */}
        <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mx-auto text-5xl animate-heartbeat">
          ❤️
        </div>

        <div>
          <h1 className="font-black text-white text-4xl mb-2">Pagamento confirmado!</h1>
          <p className="text-white/60 text-sm">
            Plano <span className="text-white font-bold">{data.isPremium ? 'Premium' : 'Basico'}</span> ativado com sucesso
          </p>
        </div>

        {/* Contador de redirecionamento */}
        {coupleUrl && (
          <div className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Redirecionando em</p>
            <p className="font-black text-white text-5xl">{count}</p>
            <p className="text-white/40 text-xs mt-1">segundos para sua pagina</p>
          </div>
        )}

        {/* QR Code */}
        {data.qrCodeData && (
          <div className="flex flex-col items-center">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Seu QR Code exclusivo</p>
            <div className="p-3 bg-white rounded-2xl shadow-2xl">
              <img src={data.qrCodeData} alt="QR Code" className="w-40 h-40" />
            </div>
            <p className="text-white/30 text-xs mt-2">Guarde este QR Code</p>
          </div>
        )}

        {/* Botao direto */}
        {coupleUrl && (
          <button
            onClick={() => router.push(coupleUrl)}
            className="w-full py-4 rounded-2xl font-black text-love-700 text-lg bg-white shadow-2xl hover:bg-love-50 transition hover:-translate-y-0.5">
            Ver minha pagina agora ❤️
          </button>
        )}

        <p className="text-white/20 text-xs">
          Comprovante enviado para seu email · Pagamento processado pelo Stripe
        </p>
      </div>
    </div>
  )
}
