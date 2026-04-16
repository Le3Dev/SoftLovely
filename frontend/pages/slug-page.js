import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function CouplePublicPage() {
  const router = useRouter()
  const { slug } = router.query
  
  const [couple, setCouple] = useState(null)
  const [events, setEvents] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeCounter, setTimeCounter] = useState({
    years: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  // Carregar dados do casal
  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      try {
        // Carregar casal
        const coupleRes = await axios.get(`${API_BASE}/api/couples/slug/${slug}`)
        setCouple(coupleRes.data)

        // Carregar eventos
        const eventsRes = await axios.get(`${API_BASE}/api/events/c/${coupleRes.data.id}`)
        setEvents(eventsRes.data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)))

        // Carregar parceiros
        const partnersRes = await axios.get(`${API_BASE}/api/partners/c/${coupleRes.data.id}`)
        setPartners(partnersRes.data)

        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, API_BASE])

  // Calcular tempo junto
  useEffect(() => {
    if (!couple?.anniversaryDate) return

    const updateCounter = () => {
      const startDate = new Date(couple.anniversaryDate)
      const now = new Date()
      const diff = now - startDate

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeCounter({ years, days, hours, minutes, seconds })
    }

    updateCounter()
    const interval = setInterval(updateCounter, 1000)
    return () => clearInterval(interval)
  }, [couple])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando história...</p>
        </div>
      </div>
    )
  }

  if (!couple) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Página não encontrada</h1>
          <p className="text-gray-600">Este casal ainda não criou sua história.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-2">
            {partners.map(p => p.name).join(' & ')}
          </h1>
          <p className="text-pink-100 text-lg">Uma história de amor</p>
        </div>
      </div>

      {/* Contador */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-8">
            Tempo juntos ❤️
          </h2>
          
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-pink-600">
                {timeCounter.years}
              </div>
              <div className="text-sm text-gray-600 mt-2">Anos</div>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-pink-600">
                {timeCounter.days}
              </div>
              <div className="text-sm text-gray-600 mt-2">Dias</div>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-pink-600">
                {timeCounter.hours}
              </div>
              <div className="text-sm text-gray-600 mt-2">Horas</div>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-pink-600">
                {timeCounter.minutes}
              </div>
              <div className="text-sm text-gray-600 mt-2">Minutos</div>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-pink-600">
                {timeCounter.seconds}
              </div>
              <div className="text-sm text-gray-600 mt-2">Segundos</div>
            </div>
          </div>

          {couple.isPremium && (
            <div className="mt-6 text-center">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                ✨ Plano Premium
              </span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Nossa Timeline 📅
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Nenhum evento adicionado ainda. A história será escrita em breve... 💕
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {events.map((event, index) => (
                <div key={event.id} className={`flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Conteúdo */}
                  <div className="md:w-1/2 md:px-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                      <div className="text-sm text-pink-600 font-semibold mb-1">
                        {new Date(event.eventDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {event.title}
                      </h3>
                      
                      {event.category && (
                        <span className="inline-block bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full mb-3 font-semibold">
                          {event.category}
                        </span>
                      )}
                      
                      <p className="text-gray-600 mb-4">
                        {event.description}
                      </p>

                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}

                      {event.aiStory && (
                        <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded italic text-gray-700">
                          "{event.aiStory}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Espaço vazio no outro lado */}
                  <div className="hidden md:block md:w-1/2"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* História Gerada */}
        {events.some(e => e.aiStory) && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Nossa História 💖
            </h2>

            <div className="space-y-8">
              {events
                .filter(e => e.aiStory)
                .map((event, index) => (
                  <div key={event.id}>
                    <h3 className="text-2xl font-bold text-pink-600 mb-4">
                      Capítulo {index + 1} — {event.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {event.aiStory}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!couple.isPremium && (
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-xl p-8 text-white text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Desbloqueie Mais Histórias ✨</h3>
            <p className="mb-6 text-pink-100">
              Atualize para Premium e tenha histórias geradas com IA ilimitadas!
            </p>
            <button
              onClick={() => router.push('/payment')}
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Upgrade Premium
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8 px-4 text-center">
        <p className="mb-2">Criado com ❤️ em StoryOfUs</p>
        <p className="text-gray-400 text-sm">
          {new Date().getFullYear()} • Compartilhando histórias de amor
        </p>
      </div>
    </div>
  )
}

