import { useRouter } from 'next/router'

export default function PaymentCancel() {
  const router = useRouter()
  const { coupleId } = router.query

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-12 max-w-md text-center">
        {/* Cancel Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-red-600 mb-3">Pagamento Cancelado</h1>
        <p className="text-xl text-gray-700 mb-2">Seu pagamento foi cancelado.</p>
        <p className="text-gray-600 mb-8">
          Nenhum valor foi cobrado. Você pode tentar novamente quando quiser.
        </p>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 text-left">
          <p className="text-sm text-red-800">
            Se você teve problemas durante o pagamento, entre em contato conosco pelo email: suporte@storyofus.com
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/payment')}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-bold hover:from-pink-600 hover:to-rose-600 transition"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => router.push(`/${coupleId}`)}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
          >
            Voltar ao Perfil
          </button>
        </div>
      </div>
    </div>
  )
}

