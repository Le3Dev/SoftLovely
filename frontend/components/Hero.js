export default function Hero({ partners = [], themeColor, slug }) {
  const names = partners.map(p=>p.name).filter(Boolean)
  const title = names.length ? names.join(' & ') : slug
  const bg = themeColor || '#FFB6C1'
  return (
    <div className="rounded-lg p-6 text-white" style={{ background: `linear-gradient(90deg, ${bg}, rgba(255,255,255,0.08))` }}>
      <h2 className="text-4xl font-bold">{title}</h2>
      <p className="mt-2">Uma página para celebrar a história de vocês.</p>
    </div>
  )
}

