import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('events')
  const [events, setEvents] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [coupleId, setCoupleId] = useState('')
  
  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    category: '',
    imageUrl: ''
  })

  const [partnerForm, setPartnerForm] = useState({
    name: ''
  })

  // Buscar dados ao montar
  useEffect(() => {
    const storedCoupleId = localStorage.getItem('coupleId')
    if (storedCoupleId) {
      setCoupleId(storedCoupleId)
      loadEvents(storedCoupleId)
      loadPartners(storedCoupleId)
    }
  }, [])

  const loadEvents = async (id) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/events/couple/${id}`)
      setEvents(response.data)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    }
    setLoading(false)
  }

  const loadPartners = async (id) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/partners/couple/${id}`)
      setPartners(response.data)
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
    }
    setLoading(false)
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    try {
      const newEvent = {
        coupleId,
        ...eventForm
      }
      await axios.post('/api/events', newEvent)
      setEventForm({ title: '', description: '', eventDate: '', category: '', imageUrl: '' })
      setShowForm(false)
      loadEvents(coupleId)
    } catch (error) {
      alert('Erro ao adicionar evento: ' + error.message)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (confirm('Tem certeza?')) {
      try {
        await axios.delete(`/api/events/${eventId}`)
        loadEvents(coupleId)
      } catch (error) {
        alert('Erro ao deletar evento')
      }
    }
  }

  const handleAddPartner = async (e) => {
    e.preventDefault()
    try {
      const newPartner = {
        coupleId,
        ...partnerForm
      }
      await axios.post('/api/partners', newPartner)
      setPartnerForm({ name: '' })
      setShowForm(false)
      loadPartners(coupleId)
    } catch (error) {
      alert('Erro ao adicionar parceiro: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">📋 Dashboard</h1>
          <p className="text-pink-100">Gerencie sua história de casal</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!coupleId ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">Por favor, faça login primeiro</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 font-semibold border-b-2 transition ${
                  activeTab === 'events'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                📅 Eventos ({events.length})
              </button>
              <button
                onClick={() => setActiveTab('partners')}
                className={`px-6 py-3 font-semibold border-b-2 transition ${
                  activeTab === 'partners'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                👥 Parceiros ({partners.length})
              </button>
            </div>

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="mb-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  {showForm ? '✕ Cancelar' : '+ Novo Evento'}
                </button>

                {showForm && (
                  <form onSubmit={handleAddEvent} className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Título"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                        className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:outline-none"
                        required
                      />
                      <input
                        type="date"
                        value={eventForm.eventDate}
                        onChange={(e) => setEventForm({...eventForm, eventDate: e.target.value})}
                        className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:outline-none"
                        required
                      />
                      <select
                        value={eventForm.category}
                        onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                        className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:outline-none"
                      >
                        <option value="">Categoria</option>
                        <option value="viagem">Viagem</option>
                        <option value="aniversario">Aniversário</option>
                        <option value="encontro">Encontro</option>
                        <option value="outro">Outro</option>
                      </select>
                      <input
                        type="url"
                        placeholder="URL da imagem"
                        value={eventForm.imageUrl}
                        onChange={(e) => setEventForm({...eventForm, imageUrl: e.target.value})}
                        className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                    <textarea
                      placeholder="Descrição do evento"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      className="w-full mt-4 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:outline-none"
                      rows="4"
                    />
                    <button
                      type="submit"
                      className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Salvar Evento
                    </button>
                  </form>
                )}

                {loading ? (
                  <p className="text-center text-gray-600">Carregando...</p>
                ) : events.length === 0 ? (
                  <p className="text-center text-gray-600">Nenhum evento ainda. Crie seu primeiro evento!</p>
                ) : (
                  <div className="grid gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                            <p className="text-sm text-gray-600">
                              📅 {new Date(event.eventDate).toLocaleDateString('pt-BR')} • {event.category}
                            </p>
                            <p className="mt-2 text-gray-700">{event.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-500 hover:text-red-700 font-semibold"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Partners Tab */}
            {activeTab === 'partners' && (
              <div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="mb-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  {showForm ? '✕ Cancelar' : '+ Novo Parceiro'}
                </button>

                {showForm && (
                  <form onSubmit={handleAddPartner} className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <input
                      type="text"
                      placeholder="Nome do parceiro"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({...partnerForm, name: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Adicionar Parceiro
                    </button>
                  </form>
                )}

                {loading ? (
                  <p className="text-center text-gray-600">Carregando...</p>
                ) : partners.length === 0 ? (
                  <p className="text-center text-gray-600">Nenhum parceiro adicionado</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {partners.map((partner) => (
                      <div key={partner.id} className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold text-gray-800">👤 {partner.name}</h3>
                        <p className="text-sm text-gray-600 mt-2">ID: {partner.id}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

