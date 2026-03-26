import axios from 'axios'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default function CouplePageByHash() {
  const router = useRouter()
  const { hash } = router.query
  const [couple, setCouple] = useState(null)
  const [partners, setPartners] = useState([])
  const [daysTogether, setDaysTogether] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [qrCodeData, setQrCodeData] = useState(null)

  useEffect(() => {
    if (!hash) return

    const fetchCoupleData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar casal pelo hash
        const coupleRes = await axios.get(`${API_BASE}/api/couples/hash/${hash}`)
        const coupleData = coupleRes.data
        setCouple(coupleData)

        if (coupleData.id) {
          // Buscar parceiros
          try {
            const pRes = await axios.get(`${API_BASE}/api/partners/${coupleData.id}`)
            setPartners(pRes.data || [])
          } catch (err) {
            console.warn('Não foi possível carregar parceiros:', err.message)
          }

          // Gerar QR Code
          try {
            const qrRes = await axios.get(`${API_BASE}/api/couples/${coupleData.id}/qrcode`)
            setQrCodeData(qrRes.data.qrCode || qrRes.data)
          } catch (err) {
            console.warn('Não foi possível gerar QR Code:', err.message)
          }
        }
      } catch (err) {
        console.error('Erro ao buscar casal:', err)
        setError('Casal não encontrado')
      } finally {
        setLoading(false)
      }
    }

    fetchCoupleData()
  }, [hash])

  // Atualizar tempo em tempo real
  useEffect(() => {
    if (!couple?.anniversaryDate) return

    const updateTime = () => {
      const anniversaryDate = new Date(couple.anniversaryDate)
      const today = new Date()

      const diffTime = today - anniversaryDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      setDaysTogether(diffDays)
      setCurrentTime(new Date())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [couple])

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Carregando sua história de amor... 💕</p>
          </div>
        </div>
    )
  }

  if (error || !couple) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-rose-50 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops! 😢</h1>
            <p className="text-xl text-gray-600 mb-6">{error || 'Esta página não foi encontrada'}</p>
            <button
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-bold"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
    )
  }

  const hours = currentTime.getHours().toString().padStart(2, '0')
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.getSeconds().toString().padStart(2, '0')
  const years = Math.floor(daysTogether / 365)
  const remainingDays = daysTogether % 365

  const pageUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/c/${hash}`

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header com animação */}
          <div className="text-center mb-12 animate-bounce">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
              💕 {couple.slug} 💕
            </h1>
            <p className="text-gray-600 text-lg">Uma história de amor única</p>
          </div>

          {/* Contador Principal - Tempo Junto */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-300">
            <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">⏰ Tempo Juntos</h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl p-6 text-center text-white shadow-lg transform hover:scale-105 transition">
                <div className="text-5xl font-bold">{years}</div>
                <div className="text-lg mt-2 font-semibold">Anos</div>
              </div>

              <div className="bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl p-6 text-center text-white shadow-lg transform hover:scale-105 transition">
                <div className="text-5xl font-bold">{remainingDays}</div>
                <div className="text-lg mt-2 font-semibold">Dias</div>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-6 text-center text-white shadow-lg transform hover:scale-105 transition">
                <div className="text-5xl font-bold">{daysTogether}</div>
                <div className="text-lg mt-2 font-semibold">Total</div>
              </div>
            </div>

            {/* Relógio em tempo real */}
            <div className="bg-gray-100 rounded-2xl p-6 text-center">
              <p className="text-gray-600 mb-2 text-lg">⏱️ Hora Atual</p>
              <div className="text-6xl font-mono font-bold text-pink-600 animate-pulse">
                {hours}:{minutes}:{seconds}
              </div>
            </div>
          </div>

          {/* Seção de Música */}
          {couple.musicUrl && (
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl shadow-2xl border-4 border-purple-300">
                <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">🎵 Nossa Música</h2>
                <div className="flex flex-col items-center">
                  <audio 
                    controls 
                    className="w-full max-w-md mb-4 rounded-lg"
                    style={{ height: '60px' }}
                  >
                    <source src={couple.musicUrl} type="audio/mpeg" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                  <p className="text-gray-600 text-center text-sm">
                    A música que marcou nossa história 💕
                  </p>
                </div>
              </div>
          )}

          {/* Fotos dos Parceiros - Seção Destacada */}
          {partners.length > 0 && (
              <div className="mb-8">
                <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">📸 Nossos Momentos</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {partners.map((partner) => (
                      <div key={partner.id} className="relative group">
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-rose-300 transform hover:scale-105 transition-all duration-300">
                          {partner.profileImageUrl && (
                              <div className="h-80 overflow-hidden relative">
                                <img
                                    src={partner.profileImageUrl}
                                    alt={partner.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                              </div>
                          )}
                          <div className="p-6 text-center bg-gradient-to-br from-pink-50 to-rose-50">
                            <h3 className="text-3xl font-bold text-pink-600 mb-2 animate-pulse">
                              ❤️ {partner.name} ❤️
                            </h3>
                            {partner.about && (
                                <p className="text-gray-600 text-lg italic">{partner.about}</p>
                            )}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Parceiros */}
          {partners.length > 0 && (
              <div className="mb-8">
                <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">👥 Nossos Corações</h2>
              </div>
          )}

          {/* Data de Aniversário */}
          {couple.anniversaryDate && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 text-center mb-8">
                <p className="text-gray-700 text-2xl font-bold">
                  📅 Juntos desde {new Date(couple.anniversaryDate).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                </p>
              </div>
          )}

          {/* Seção de Compartilhamento - FINAL DA PÁGINA */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-pink-300">
            <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">📱 Compartilhe Sua História</h2>

            {/* QR Code */}
            {qrCodeData && (
                <div className="flex flex-col items-center mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Seu Código QR</h3>
                  <div className="bg-white p-4 rounded-lg border-4 border-pink-300 shadow-lg">
                    <img
                        src={qrCodeData}
                        alt="QR Code"
                        className="w-64 h-64"
                    />
                  </div>
                  <p className="text-center text-gray-600 text-sm mt-4">
                    Compartilhe este QR Code com seu parceiro! 💕
                  </p>
                </div>
            )}

            {/* Link */}
            <div className="mb-6 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
              <p className="text-gray-700 mb-3">
                <span className="font-bold text-gray-900">Seu Link Único:</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                    type="text"
                    value={pageUrl}
                    readOnly
                    className="flex-1 min-w-[200px] px-4 py-2 border border-blue-300 rounded-lg bg-white text-gray-700 text-sm font-mono"
                />
                <button
                    onClick={() => {
                      navigator.clipboard.writeText(pageUrl)
                      alert('✅ Link copiado!')
                    }}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-bold whitespace-nowrap"
                >
                  📋 Copiar
                </button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${couple.slug} - Nossa História de Amor`,
                        text: 'Veja nossa página personalizada!',
                        url: pageUrl
                      })
                    } else {
                      alert('Compartilhamento não suportado no seu navegador')
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition font-bold text-lg"
              >
                📤 Compartilhar
              </button>

              <a
                  href={`mailto:?subject=${couple.slug} - Nossa História&body=Veja nossa página de casal: ${pageUrl}`}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg text-center"
              >
                ✉️ Enviar por Email
              </a>
            </div>

            {/* Mensagem final */}
            <div className="text-center mt-8 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
              <p className="text-gray-700 text-lg font-semibold mb-2">
                ✨ Compartilhe este link com seu parceiro! ✨
              </p>
              <p className="text-gray-600">
                Ele poderá acessar sua página especial a qualquer momento e ver quantos dias vocês estão juntos.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Criado com 💕 usando <span className="font-bold text-pink-600">StoryOfUs</span>
            </p>
          </div>
        </div>

        {/* Estilos de animação */}
        <style jsx>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: floatUp 3s ease-in-out infinite;
        }
      `}</style>
      </div>
  )
}
