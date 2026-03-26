import axios from 'axios'
import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import Counter from '../components/Counter'
import Timeline from '../components/Timeline'
import StorySection from '../components/StorySection'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default function CouplePage({ router }) {
  const [couple, setCouple] = useState(null)
  const [partners, setPartners] = useState([])
  const [events, setEvents] = useState([])
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(true)
  const slug = typeof window !== 'undefined' ? window.location.pathname.replace('/', '') : null

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    axios.get(`${API_BASE}/couples/${slug}`).then(res => {
      setCouple(res.data)
      const coupleId = res.data.id
      return Promise.all([
        axios.get(`${API_BASE}/partners/${coupleId}`),
        axios.get(`${API_BASE}/events/${coupleId}`),
      ])
    }).then(([pRes, eRes]) => {
      setPartners(pRes.data || [])
      setEvents(eRes.data || [])
    }).catch(err => {
      console.error(err)
      // could show 404
    }).finally(()=>setLoading(false))
  }, [slug])

  async function generateStory() {
    if (!slug) return
    setStory('Gerando...')
    try {
      const res = await axios.post(`${API_BASE}/ai/generate-story/${slug}`)
      setStory(res.data)
    } catch (err) {
      setStory('Erro ao gerar história')
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>
  if (!couple) return <div className="p-8">Casal não encontrado.</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <Hero partners={partners} themeColor={couple.themeColor} slug={couple.slug} />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Counter anniversaryDate={couple.anniversaryDate} />
            <Timeline events={events} />
          </div>
          <div>
            <StorySection story={story} onGenerate={generateStory} />
          </div>
        </div>
      </div>
    </div>
  )
}

