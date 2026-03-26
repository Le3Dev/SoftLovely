import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || 'pk_test_51SEtmb0yzuK30F764UIYySTfcuUF0SgHR0exihluL5PmGEgJCaR4ZDPxMe0ADYXLPm8lweLO6Cti6AWmummzYiIh00Qf7p2Nox')

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default function Payment() {
  const router = useRouter()
  const { coupleId } = router.query
  
  const [loading, setLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [message, setMessage] = useState('')
  const [couple, setCouple] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!coupleId) return

    const fetchCouple = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/couples/${coupleId}`)
        setCouple(response.data)
      } catch (error) {
        setMessage('Erro ao carregar dados do casal')
        console.error(error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchCouple()
  }, [coupleId])

  const handleCheckout = async (e) => {
    e.preventDefault()
    
    if (!coupleId) {
      setMessage('ID do casal não encontrado. Volte e tente novamente.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Chamada ao backend para criar sessão de checkout
      const response = await axios.post(`${API_BASE}/api/payments/checkout`, {
        coupleId,
        isPremium
      })

      if (response.data.checkoutUrl) {
        // Redirecionar para Stripe Checkout
        window.location.href = response.data.checkoutUrl
      } else {
        setMessage('Erro ao criar sessão de pagamento')
      }
    } catch (error) {
      setMessage('Erro: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-pink-600 mb-4">
            ✨ StoryOfUs Premium ✨
          </h1>
          <p className="text-xl text-gray-600">
            {couple ? `Parabéns ${couple.slug}! 🎉` : ''} Finalize seu pagamento para criar seu QR Code exclusivo
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Basic Plan */}
          <div className={`bg-white rounded-xl shadow-lg p-8 border-2 transition cursor-pointer ${
            !isPremium ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'
          }`}
          onClick={() => setIsPremium(false)}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Plan Básico</h2>
            <div className="text-4xl font-bold text-pink-600 mb-2">
              $9,99 <span className="text-lg text-gray-600">/único</span>
            </div>
            <p className="text-gray-600 mb-6">Perfeito para começar</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>QR Code exclusivo</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Timeline com eventos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Galeria de fotos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Histórias básicas</span>
              </li>
            </ul>

            <button
              onClick={() => setIsPremium(false)}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                !isPremium
                  ? 'bg-pink-600 text-white hover:bg-pink-700'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {!isPremium ? '✓ Selecionado' : 'Escolher Plan'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className={`bg-white rounded-xl shadow-xl p-8 border-2 transition cursor-pointer transform ${
            isPremium ? 'border-rose-500 bg-rose-50 scale-105' : 'border-gray-200 hover:border-rose-200'
          }`}
          onClick={() => setIsPremium(true)}>
            {isPremium && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Plan Premium</h2>
            <div className="text-4xl font-bold text-rose-600 mb-2">
              $29,99 <span className="text-lg text-gray-600">/único</span>
            </div>
            <p className="text-gray-600 mb-6">Tudo para casais que querem mais</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-rose-500">✓</span>
                <span>Tudo do plano básico</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-500">✓</span>
                <span>Histórias com IA avançada</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-500">✓</span>
                <span>Temas customizados</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-500">✓</span>
                <span>Exportar como PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-500">✓</span>
                <span>Suporte prioritário</span>
              </li>
            </ul>

            <button
              onClick={() => setIsPremium(true)}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                isPremium
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isPremium ? '✓ Selecionado' : 'Escolher Premium'}
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {isPremium ? '👑 Premium' : '💫 Básico'}
          </h3>
          <p className="text-gray-600 mb-6">
            Valor: <span className="font-bold text-lg">${isPremium ? '29,99' : '9,99'} USD</span>
          </p>

          <form onSubmit={handleCheckout} className="space-y-4">
            {couple && (
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200 mb-6">
                <p className="text-gray-700">
                  <span className="font-bold">Casal:</span> {couple.slug}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>🧪 Modo Teste:</strong> Use o cartão <code className="bg-blue-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
              </p>
              <p className="text-blue-700 text-xs mt-2">Data: 12/25 | CVC: 123</p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-sm ${
                message.includes('Erro') 
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !coupleId}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-bold hover:from-pink-600 hover:to-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Processando...' : `💳 Ir para Pagamento - $${isPremium ? '29,99' : '9,99'}`}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Seu pagamento é seguro e processado por Stripe
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-5xl mb-4">📸</div>
            <h4 className="font-bold text-lg text-gray-800 mb-2">Galeria Ilimitada</h4>
            <p className="text-gray-600">Armazene todas as suas memórias em um único lugar</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-5xl mb-4">🤖</div>
            <h4 className="font-bold text-lg text-gray-800 mb-2">Histórias com IA</h4>
            <p className="text-gray-600">Gere histórias lindas com inteligência artificial</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-5xl mb-4">📱</div>
            <h4 className="font-bold text-lg text-gray-800 mb-2">QR Code Exclusivo</h4>
            <p className="text-gray-600">Compartilhe facilmente com amigos e familiares</p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-pink-600 hover:text-pink-700 font-semibold"
          >
            ← Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  )
}

