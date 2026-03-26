export default function Timeline({ events = [] }) {
  if (!events.length) return <div className="mt-4 p-4 bg-white rounded shadow">Nenhum evento ainda.</div>
  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Timeline</h4>
      <div className="space-y-4">
        {events.map(ev => (
          <div key={ev.id} className="bg-white rounded shadow p-4">
            <div className="flex items-start gap-4">
              {ev.imageUrl ? <img src={ev.imageUrl} alt="" className="w-24 h-24 object-cover rounded" /> : <div className="w-24 h-24 bg-pink-100 rounded" />}
              <div>
                <div className="text-sm text-gray-500">{ev.eventDate}</div>
                <div className="font-semibold">{ev.title}</div>
                <div className="mt-2 text-sm text-gray-700">{ev.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

