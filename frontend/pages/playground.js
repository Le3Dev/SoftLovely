import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Playground() {
  const [couples, setCouples] = useState([])
  const [selectedCouple, setSelectedCouple] = useState(null)
  const [events, setEvents] = useState([])
  const [partners, setPartners] = useState([])
  const [activeTab, setActiveTab] = useState('couples')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  // Forms
  const [coupleForm, setCoupleForm] = useState({
    slug: 'teste-' + Math.random().toString(36).substring(7),
    anniversaryDate: '2020-01-01',
    themeColor: 'pink'
  })

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    category: 'encontro',
    imageUrl: '',
    aiStory: ''
  })

  const [partnerForm, setPartnerForm] = useState({
    name: ''
  })

  // Carregar casais de teste
  useEffect(() => {
    loadCouples()
  }, [])

  const loadCouples = async () => {
    try {
      // Buscar um casal existente ou criar dados de teste
      const userId = localStorage.getItem('userId') || 'test-user-' + Date.now()
      const res = await axios.get(`${API_BASE}/api/couples/owner/${userId}`)
      setCouples(res.data || [])
      if (res.data && res.data.length > 0) {
        setSelectedCouple(res.data[0])
        loadCoupleData(res.data[0].id)
      }
    } catch (err) {
      console.log('Nenhum casal encontrado, crie um novo!')
    }
  }

  const loadCoupleData = async (coupleId) => {
    try {
      const [eventsRes, partnersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/events/couple/${coupleId}`),
        axios.get(`${API_BASE}/api/partners/couple/${coupleId}`)
      ])
      setEvents(eventsRes.data || [])
      setPartners(partnersRes.data || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  const handleCreateCouple = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/api/couples`, coupleForm)
      setMessage('✅ Casal criado com sucesso!')
      setCoupleForm({
        slug: 'teste-' + Math.random().toString(36).substring(7),
        anniversaryDate: '2020-01-01',
        themeColor: 'pink'
      })
      loadCouples()
    } catch (err) {
      setMessage('❌ Erro: ' + (err.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    if (!selectedCouple) {
      setMessage('❌ Selecione um casal primeiro!')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/api/events`, {
        coupleId: selectedCouple.id,
        ...eventForm
      })
      setMessage('✅ Evento criado com sucesso!')
      setEventForm({
        title: '',
        description: '',
        eventDate: new Date().toISOString().split('T')[0],
        category: 'encontro',
        imageUrl: '',
        aiStory: ''
      })
      loadCoupleData(selectedCouple.id)
    } catch (err) {
      setMessage('❌ Erro: ' + (err.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleAddPartner = async (e) => {
    e.preventDefault()
    if (!selectedCouple) {
      setMessage('❌ Selecione um casal primeiro!')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/api/partners`, {
        coupleId: selectedCouple.id,
        name: partnerForm.name
      })
      setMessage('✅ Parceiro adicionado com sucesso!')
      setPartnerForm({ name: '' })
      loadCoupleData(selectedCouple.id)
    } catch (err) {
      setMessage('❌ Erro: ' + (err.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  const handleGenerateStory = async () => {
    if (!selectedCouple || events.length === 0) {
      setMessage('❌ Selecione um casal com eventos!')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/api/ai/generate-story`, {
        eventTitle: events[0]?.title || 'Evento',
        eventDescription: events[0]?.description || 'Descrição'
      })
      setMessage('✅ História gerada! ' + res.data?.story?.substring(0, 50) + '...')
      
      // Simular salvamento
      const updatedEvents = events.map((e, i) => 
        i === 0 ? { ...e, aiStory: res.data?.story } : e
      )
      setEvents(updatedEvents)
    } catch (err) {
      setMessage('❌ Erro ao gerar história: ' + (err.response?.data?.message || err.message))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🧪 Playground - StoryOfUs</h1>
          <p className="text-blue-100">Teste todas as funcionalidades sem Postman</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Mensagem */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.startsWith('✅') 
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Painel Lateral */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Casais</h2>
              
              <div className="space-y-2">
                {couples.length === 0 ? (
                  <p className="text-gray-600 text-sm">Nenhum casal criado</p>
                ) : (
                  couples.map(couple => (
                    <button
                      key={couple.id}
                      onClick={() => {
                        setSelectedCouple(couple)
                        loadCoupleData(couple.id)
                      }}
                      className={`w-full text-left px-4 py-2 rounded transition ${
                        selectedCouple?.id === couple.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="font-semibold">{couple.slug}</div>
                      <div className="text-xs opacity-75">
                        {couple.isPremium ? '✨ Premium' : 'Básico'}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {selectedCouple && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">Informações</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Slug:</strong> {selectedCouple.slug}</p>
                    <p><strong>ID:</strong> {selectedCouple.id.substring(0, 8)}...</p>
                    <p><strong>Eventos:</strong> {events.length}</p>
                    <p><strong>Parceiros:</strong> {partners.length}</p>
                  </div>
                  
                  {selectedCouple.slug && (
                    <button
                      onClick={() => window.open(`http://localhost:3000/${selectedCouple.slug}`, '_blank')}
                      className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition"
                    >
                      👁️ Ver Página Pública
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Painel Principal */}
          <div className="lg:col-span-2">
            {/* Abas */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('couples')}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === 'couples'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                👥 Novo Casal
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === 'events'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📅 Eventos
              </button>
              <button
                onClick={() => setActiveTab('partners')}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === 'partners'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                👫 Parceiros
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === 'ai'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🤖 IA
              </button>
            </div>

            {/* Criar Novo Casal */}
            {activeTab === 'couples' && (
              <form onSubmit={handleCreateCouple} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Criar Novo Casal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Slug (ex: joao-e-maria)
                    </label>
                    <input
                      type="text"
                      value={coupleForm.slug}
                      onChange={(e) => setCoupleForm({...coupleForm, slug: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Data de Aniversário
                    </label>
                    <input
                      type="date"
                      value={coupleForm.anniversaryDate}
                      onChange={(e) => setCoupleForm({...coupleForm, anniversaryDate: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Tema
                    </label>
                    <select
                      value={coupleForm.themeColor}
                      onChange={(e) => setCoupleForm({...coupleForm, themeColor: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="pink">Rosa</option>
                      <option value="red">Vermelho</option>
                      <option value="purple">Roxo</option>
                      <option value="blue">Azul</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Criando...' : '✅ Criar Casal'}
                  </button>
                </div>
              </form>
            )}

            {/* Adicionar Evento */}
            {activeTab === 'events' && (
              <div>
                <form onSubmit={handleAddEvent} className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Evento</h3>
                  
                  {!selectedCouple && (
                    <p className="text-red-600 font-semibold mb-4">⚠️ Selecione um casal primeiro!</p>
                  )}

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Título do evento"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      required
                    />

                    <textarea
                      placeholder="Descrição"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      rows="3"
                    />

                    <input
                      type="date"
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm({...eventForm, eventDate: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />

                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="encontro">Encontro</option>
                      <option value="viagem">Viagem</option>
                      <option value="aniversario">Aniversário</option>
                      <option value="outro">Outro</option>
                    </select>

                    <input
                      type="url"
                      placeholder="URL da imagem (opcional)"
                      value={eventForm.imageUrl}
                      onChange={(e) => setEventForm({...eventForm, imageUrl: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />

                    <textarea
                      placeholder="História com IA (gerada automaticamente)"
                      value={eventForm.aiStory}
                      onChange={(e) => setEventForm({...eventForm, aiStory: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      rows="2"
                    />

                    <button
                      type="submit"
                      disabled={loading || !selectedCouple}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {loading ? '⏳ Adicionando...' : '✅ Adicionar Evento'}
                    </button>
                  </div>
                </form>

                {/* Lista de Eventos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">Eventos do Casal</h3>
                  {events.map(event => (
                    <div key={event.id} className="bg-white rounded-lg shadow p-4">
                      <h4 className="font-bold text-gray-800">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(event.eventDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionar Parceiro */}
            {activeTab === 'partners' && (
              <div>
                <form onSubmit={handleAddPartner} className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Parceiro</h3>
                  
                  {!selectedCouple && (
                    <p className="text-red-600 font-semibold mb-4">⚠️ Selecione um casal primeiro!</p>
                  )}

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nome"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({...partnerForm, name: e.target.value})}
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      required
                    />

                    <button
                      type="submit"
                      disabled={loading || !selectedCouple}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {loading ? '⏳ Adicionando...' : '✅ Adicionar Parceiro'}
                    </button>
                  </div>
                </form>

                {/* Lista de Parceiros */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">Parceiros do Casal</h3>
                  {partners.map(partner => (
                    <div key={partner.id} className="bg-white rounded-lg shadow p-4">
                      <h4 className="font-bold text-gray-800">👤 {partner.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IA */}
            {activeTab === 'ai' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🤖 Geração de Histórias com IA</h3>
                
                {!selectedCouple && (
                  <p className="text-red-600 font-semibold mb-4">⚠️ Selecione um casal primeiro!</p>
                )}

                {events.length === 0 && selectedCouple && (
                  <p className="text-yellow-600 font-semibold mb-4">⚠️ Adicione eventos para gerar história!</p>
                )}

                <button
                  onClick={handleGenerateStory}
                  disabled={loading || !selectedCouple || events.length === 0}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition disabled:opacity-50 mb-6"
                >
                  {loading ? '⏳ Gerando...' : '✨ Gerar História'}
                </button>

                {/* Histórias Geradas */}
                {events.filter(e => e.aiStory).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800">Histórias Geradas:</h4>
                    {events.map(event => event.aiStory && (
                      <div key={event.id} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h5 className="font-bold text-gray-800 mb-2">{event.title}</h5>
                        <p className="text-gray-700 italic">{event.aiStory}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

