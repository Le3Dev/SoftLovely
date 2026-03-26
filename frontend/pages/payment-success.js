import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default function PaymentSuccess() {
  const router = useRouter()
  const { coupleId } = router.query
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId) return

    const fetchPaymentData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/payments/success/${coupleId}`)
        setPaymentData(response.data)
      } catch (error) {
        console.error('Erro ao buscar dados de pagamento:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [coupleId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando pagamento...</p>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl p-12 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao Processar</h1>
          <p className="text-gray-600 mb-6">Não conseguimos recuperar os dados de seu pagamento.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-bold hover:bg-pink-700 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-green-600 mb-2">Sucesso! 🎉</h1>
          <p className="text-xl text-gray-600">Seu pagamento foi processado com sucesso!</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Status Section */}
          <div className="mb-8 p-6 bg-green-50 rounded-xl border-l-4 border-green-500">
            <p className="text-gray-700 mb-3">
              <span className="font-bold text-gray-900">Status do Pagamento:</span>
              <span className="ml-2 inline-block px-4 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                PAGO ✓
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-bold text-gray-900">Plano:</span>
              <span className="ml-2 text-pink-600 font-bold">{paymentData.isPremium ? 'Premium 👑' : 'Básico'}</span>
            </p>
          </div>

          {/* QR Code Section */}
          {paymentData.qrCodeData && (
            <div className="mb-8 flex flex-col items-center p-6 bg-gray-50 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Seu Código QR 📱</h2>
              <div className="bg-white p-4 rounded-lg mb-4">
                <img 
                  src={paymentData.qrCodeData} 
                  alt="QR Code para página do casal"
                  className="w-64 h-64"
                />
              </div>
              <p className="text-center text-gray-600 text-sm">
                Compartilhe este QR Code com seus convidados!<br/>
                Ao escanear, eles poderão acessar sua página personalizada.
              </p>
            </div>
          )}

          {/* URL Section */}
          {paymentData.pageUrl && (
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
              <p className="text-gray-700 mb-3">
                <span className="font-bold text-gray-900">Seu Link:</span>
              </p>
              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="text" 
                  value={paymentData.pageUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-blue-300 rounded-lg bg-white text-gray-700 text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentData.pageUrl)
                    alert('Link copiado!')
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-bold"
                >
                  Copiar
                </button>
              </div>
              <a 
                href={paymentData.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-bold"
              >
                Visualizar Página 🔗
              </a>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8 p-6 bg-amber-50 rounded-xl">
            <h3 className="font-bold text-gray-900 mb-3">Próximos Passos:</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✓ Seu casal foi criado com sucesso</li>
              <li>✓ Compartilhe o QR Code ou o link com seus convidados</li>
              <li>✓ Adicione fotos, histórias e eventos à sua página</li>
              <li>✓ Customize o tema e estilo de sua página</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${paymentData.coupleHash || coupleId}`)}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-bold hover:from-pink-600 hover:to-rose-600 transition"
            >
              Ir para Minha Página ❤️
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Um comprovante de pagamento foi enviado para seu email</p>
        </div>
      </div>
    </div>
  )
}

