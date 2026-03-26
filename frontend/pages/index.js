import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('create') // 'create' ou 'view'
  const [viewSlug, setViewSlug] = useState('')
  
  // Form state para criar novo casal
  const [formData, setFormData] = useState({
    coupleNames: '',
    anniversaryDate: '',
    themeColor: '#ec4899',
    story: '',
    musicUrl: '',
    photos: []
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [createdSlug, setCreatedSlug] = useState('')

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle color change
  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      themeColor: color
    }))
  }

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }))
  }

  // Remove photo
  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  // Create couple
  const handleCreateCouple = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Criar slug a partir dos nomes
      const slug = formData.coupleNames
        .toLowerCase()
        .replace(/\s+/g, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '')

      console.log('Criando casal com slug:', slug)

      // Primeiro, criar o casal
      const coupleResponse = await axios.post('http://localhost:8080/api/couples', {
        slug: slug,
        anniversaryDate: formData.anniversaryDate,
        themeColor: formData.themeColor
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Casal criado:', coupleResponse.data)
      const coupleId = coupleResponse.data.id

      // Upload das fotos se existirem
      if (formData.photos.length > 0) {
        try {
          const photoFormData = new FormData()
          formData.photos.forEach(photo => {
            photoFormData.append('files', photo)
          })

          await axios.post(`http://localhost:8080/api/events/${coupleId}/upload-photos`, photoFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          console.log('Fotos enviadas com sucesso')
        } catch (photoError) {
          console.warn('Erro ao fazer upload de fotos:', photoError.message)
          // Continuar mesmo que falhe
        }
      }

      // Salvar histórico (se houver endpoint para isso)
      if (formData.story) {
        try {
          await axios.post(`http://localhost:8080/api/events`, {
            coupleId: coupleId,
            title: 'Nossa História',
            description: formData.story,
            eventDate: formData.anniversaryDate,
            type: 'story'
          })
          console.log('História salva com sucesso')
        } catch (storyError) {
          console.warn('Erro ao salvar história:', storyError.message)
          // Continuar mesmo que falhe
        }
      }

      setCreatedSlug(slug)
      setMessage('✅ Casal criado com sucesso! Redirecionando para pagamento...')
      
      // Redirecionar para página de pagamento
      setTimeout(() => {
        router.push(`/payment?coupleId=${coupleId}`)
      }, 1500)
    } catch (error) {
      console.error('Erro completo:', error)
      console.error('Resposta do servidor:', error.response?.data)
      
      let errorMsg = error.message || 'Erro ao criar casal'
      
      // Se backend retornou uma mensagem de erro
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.response?.status === 400) {
        errorMsg = 'Dados inválidos. Verifique se preencheu todos os campos corretamente.'
      } else if (error.response?.status === 409) {
        errorMsg = 'Este slug/nome de casal já existe. Tente outro nome.'
      } else if (!error.response) {
        errorMsg = 'Erro de conexão com o servidor. Verifique se o backend está rodando em http://localhost:8080'
      }
      
      setMessage(`❌ Erro: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  // View couple
  const handleViewCouple = (e) => {
    e.preventDefault()
    if (!viewSlug) return
    router.push(`/${viewSlug}`)
  }

  const colorOptions = [
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Vermelho', value: '#dc2626' },
    { name: 'Roxo', value: '#a855f7' },
    { name: 'Azul', value: '#0ea5e9' },
    { name: 'Verde', value: '#10b981' },
    { name: 'Laranja', value: '#f97316' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-2">💕 StoryOfUs 💕</h1>
          <p className="text-pink-100 text-lg">Preserve as memórias do seu amor para sempre</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
              activeTab === 'create'
                ? 'bg-pink-500 text-white shadow-lg'
                : 'bg-white text-pink-600 border-2 border-pink-500 hover:bg-pink-50'
            }`}
          >
            ➕ Criar Novo Casal
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition ${
              activeTab === 'view'
                ? 'bg-pink-500 text-white shadow-lg'
                : 'bg-white text-pink-600 border-2 border-pink-500 hover:bg-pink-50'
            }`}
          >
            👀 Ver Casal Existente
          </button>
        </div>

        {/* CREATE COUPLE TAB */}
        {activeTab === 'create' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                  <span className="text-4xl">📝</span>
                  Crie sua História
                </h2>

                <form onSubmit={handleCreateCouple} className="space-y-6">
                  {/* Nome do Casal */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      👥 Nome do Casal
                    </label>
                    <input
                      type="text"
                      name="coupleNames"
                      value={formData.coupleNames}
                      onChange={handleInputChange}
                      placeholder="Ex: João e Maria"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-pink-500 focus:outline-none transition"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Será usado para criar o link da página</p>
                  </div>

                  {/* Data de Início */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📅 Data de Início do Relacionamento
                    </label>
                    <input
                      type="date"
                      name="anniversaryDate"
                      value={formData.anniversaryDate}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-pink-500 focus:outline-none transition"
                      required
                    />
                  </div>

                  {/* Cor do Tema */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      🎨 Cor do Tema
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => handleColorChange(color.value)}
                          className={`w-12 h-12 rounded-lg transition transform hover:scale-110 ${
                            formData.themeColor === color.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* História */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📖 Nossa História
                    </label>
                    <textarea
                      name="story"
                      value={formData.story}
                      onChange={handleInputChange}
                      placeholder="Conte como vocês se conheceram, momentos especiais, sonhos juntos..."
                      rows="6"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-pink-500 focus:outline-none transition resize-none"
                    />
                  </div>

                  {/* Música */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🎵 Música que nos une
                    </label>
                    <input
                      type="text"
                      name="musicUrl"
                      value={formData.musicUrl}
                      onChange={handleInputChange}
                      placeholder="URL do Spotify, YouTube ou outra plataforma"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-pink-500 focus:outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cole o link da música que marcou sua relação</p>
                  </div>

                  {/* Fotos */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📸 Fotos do Casal
                    </label>
                    <div className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center bg-pink-50 hover:bg-pink-100 transition cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-input"
                      />
                      <label htmlFor="photo-input" className="cursor-pointer block">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="font-semibold text-gray-700">Clique ou arraste fotos aqui</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG ou GIF</p>
                      </label>
                    </div>

                    {/* Preview de Fotos */}
                    {formData.photos.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-bold text-gray-700 mb-3">
                          {formData.photos.length} foto(s) selecionada(s)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {formData.photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Preview ${index}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mensagem */}
                  {message && (
                    <div className={`p-4 rounded-lg text-sm font-semibold ${
                      message.includes('✅')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-lg font-bold text-lg hover:from-pink-600 hover:to-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Criando...' : '💫 Criar Nossa História'}
                  </button>
                </form>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">👀 Preview</h3>
                
                <div className="space-y-4">
                  {formData.coupleNames && (
                    <div>
                      <p className="text-xs text-gray-500 font-bold">NOME DO CASAL</p>
                      <p className="text-xl font-bold text-gray-800">{formData.coupleNames}</p>
                    </div>
                  )}

                  {formData.anniversaryDate && (
                    <div>
                      <p className="text-xs text-gray-500 font-bold">COMEÇOU EM</p>
                      <p className="text-lg font-bold text-gray-800">
                        {new Date(formData.anniversaryDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 font-bold">COR DO TEMA</p>
                    <div
                      className="w-full h-12 rounded-lg"
                      style={{ backgroundColor: formData.themeColor }}
                    />
                  </div>

                  {formData.story && (
                    <div>
                      <p className="text-xs text-gray-500 font-bold">HISTÓRIA</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{formData.story}</p>
                    </div>
                  )}

                  {formData.musicUrl && (
                    <div>
                      <p className="text-xs text-gray-500 font-bold">MÚSICA</p>
                      <p className="text-sm text-gray-700 truncate">{formData.musicUrl}</p>
                    </div>
                  )}

                  {formData.photos.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-bold">FOTOS</p>
                      <p className="text-sm text-gray-700">{formData.photos.length} foto(s)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW COUPLE TAB */}
        {activeTab === 'view' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
                <span className="text-4xl">👀</span>
                Ver Casal Existente
              </h2>

              <form onSubmit={handleViewCouple} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Link do Casal
                  </label>
                  <input
                    type="text"
                    value={viewSlug}
                    onChange={(e) => setViewSlug(e.target.value)}
                    placeholder="Ex: joao-e-maria"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-pink-500 focus:outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use o nome do casal (sem caracteres especiais)</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-bold hover:from-pink-600 hover:to-rose-600 transition"
                >
                  Abrir Página
                </button>
              </form>

              <div className="mt-8 pt-8 border-t">
                <p className="text-center text-sm text-gray-600 mb-4">Exemplos:</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push('/joao-e-maria')}
                    className="px-4 py-2 border-2 border-pink-300 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition"
                  >
                    João e Maria
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>💕 Guarde suas memórias com amor | StoryOfUs 2026</p>
        </div>
      </div>
    </div>
  )
}

