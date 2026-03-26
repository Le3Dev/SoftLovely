import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default function CouplePersonalPage() {
  const router = useRouter()
  const { hash } = router.query
  const [couple, setCouple] = useState(null)
  const [partners, setPartners] = useState([])
  const [daysTogether, setDaysTogether] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (!hash) return

    const fetchCoupleData = async () => {
      try {
        setLoading(true)
        // Buscar casal pelo hash
        const coupleRes = await axios.get(`${API_BASE}/api/couples/hash/${hash}`)
        const coupleData = coupleRes.data
        setCouple(coupleData)

        if (coupleData.id) {
          // Buscar parceiros
          const pRes = await axios.get(`${API_BASE}/api/partners/${coupleData.id}`)
          setPartners(pRes.data || [])
        }
      } catch (error) {
        console.error('Erro ao buscar casal:', error)
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
          <p className="text-gray-600 text-lg">Carregando seu casal... 💕</p>
        </div>
      </div>
    )
  }

  if (!couple) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-rose-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops! 😢</h1>
          <p className="text-xl text-gray-600">Este casal não foi encontrado</p>
        </div>
      </div>
    )
  }

  const hours = currentTime.getHours().toString().padStart(2, '0')
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.getSeconds().toString().padStart(2, '0')
  const years = Math.floor(daysTogether / 365)
  const remainingDays = daysTogether % 365

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header com animação */}
        <div className="text-center mb-12 animate-bounce">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
            💕 {couple.slug} 💕
          </h1>
          <p className="text-gray-600 text-lg">Uma história de amor</p>
        </div>

        {/* Contador Principal - Tempo Junto */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-300">
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">⏰ Tempo Juntos</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl p-6 text-center text-white shadow-lg">
              <div className="text-5xl font-bold">{years}</div>
              <div className="text-lg mt-2 font-semibold">Anos</div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl p-6 text-center text-white shadow-lg">
              <div className="text-5xl font-bold">{remainingDays}</div>
              <div className="text-lg mt-2 font-semibold">Dias</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-6 text-center text-white shadow-lg">
              <div className="text-4xl font-bold">{daysTogether}</div>
              <div className="text-lg mt-2 font-semibold">Total</div>
            </div>
          </div>

          {/* Relógio em tempo real */}
          <div className="bg-gray-100 rounded-2xl p-6 text-center">
            <p className="text-gray-600 mb-2 text-lg">Hora Atual</p>
            <div className="text-6xl font-mono font-bold text-pink-600 animate-pulse">
              {hours}:{minutes}:{seconds}
            </div>
          </div>
        </div>

        {/* Parceiros */}
        {partners.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-rose-300 hover:scale-105 transition-transform">
                {partner.profileImageUrl && (
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={partner.profileImageUrl}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 text-center">
                  <h3 className="text-3xl font-bold text-pink-600 mb-2">
                    ❤️ {partner.name} ❤️
                  </h3>
                  {partner.about && (
                    <p className="text-gray-600 text-lg italic">{partner.about}</p>
                  )}
                </div>
              </div>
            ))}
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

        {/* Tema de Cor */}
        {couple.themeColor && (
          <div className="flex justify-center items-center gap-4 mb-8">
            <p className="text-gray-700 font-bold text-lg">Cor do Tema:</p>
            <div 
              className="w-16 h-16 rounded-full shadow-lg border-4 border-gray-300 animate-pulse"
              style={{ backgroundColor: couple.themeColor }}
            ></div>
          </div>
        )}

        {/* Rodapé Fofo */}
        <div className="text-center">
          <p className="text-gray-700 text-xl font-semibold mb-2">
            ✨ Uma história de amor única e especial ✨
          </p>
          <p className="text-gray-600">Criado com 💕 usando StoryOfUs</p>
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

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
        }
        
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

