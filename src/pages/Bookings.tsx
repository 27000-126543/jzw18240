import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import type { Application, Flight, Hotel } from '@/types'
import { Plane, Building2, Search, Star } from 'lucide-react'

const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉']

export default function Bookings() {
  const fetchApi = useStore((s) => s.fetchApi)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedAppId, setSelectedAppId] = useState<number | ''>('')
  const [activeTab, setActiveTab] = useState<'flight' | 'hotel'>('flight')
  const [flights, setFlights] = useState<Flight[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [flightSearch, setFlightSearch] = useState({ from: '', to: '', date: '' })
  const [hotelSearch, setHotelSearch] = useState({ city: '', checkIn: '', checkOut: '' })

  useEffect(() => {
    fetchApi<{ items: Application[] }>('/api/applications?status=approved')
      .then((data) => {
        const list = data?.items || []
        setApplications(list)
      })
      .catch(() => {})
  }, [fetchApi])

  const handleFlightSearch = async () => {
    if (!flightSearch.from || !flightSearch.to || !flightSearch.date) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('origin', flightSearch.from)
      params.set('destination', flightSearch.to)
      params.set('date', flightSearch.date)
      const data = await fetchApi<Flight[]>(`/api/bookings/flights/search?${params}`)
      setFlights(Array.isArray(data) ? data : [])
    } catch { setFlights([]) }
    setLoading(false)
  }

  const handleHotelSearch = async () => {
    if (!hotelSearch.city || !hotelSearch.checkIn || !hotelSearch.checkOut) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('city', hotelSearch.city)
      params.set('checkin', hotelSearch.checkIn)
      params.set('checkout', hotelSearch.checkOut)
      const data = await fetchApi<Hotel[]>(`/api/bookings/hotels/search?${params}`)
      setHotels(Array.isArray(data) ? data : [])
    } catch { setHotels([]) }
    setLoading(false)
  }

  const handleBookFlight = async (flight: Flight) => {
    if (!selectedAppId) { setMessage({ type: 'error', text: '请先选择差旅申请' }); return }
    try {
      await fetchApi('/api/bookings/flight', {
        method: 'POST',
        body: JSON.stringify({
          application_id: selectedAppId,
          flight_id: flight.id,
          flight_no: flight.flight_no,
          airline: flight.airline,
          origin: flight.origin,
          destination: flight.destination,
          date: flight.date,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          price: flight.price,
          cabin: flight.cabin,
        }),
      })
      setMessage({ type: 'success', text: '机票预订成功' })
    } catch { setMessage({ type: 'error', text: '预订失败' }) }
  }

  const handleBookHotel = async (hotel: Hotel, roomType: string) => {
    if (!selectedAppId) { setMessage({ type: 'error', text: '请先选择差旅申请' }); return }
    try {
      await fetchApi('/api/bookings/hotel', {
        method: 'POST',
        body: JSON.stringify({
          application_id: selectedAppId,
          hotel_id: hotel.id,
          name: hotel.name,
          city: hotel.city,
          checkin: hotelSearch.checkIn,
          checkout: hotelSearch.checkOut,
          price_per_night: hotel.price_per_night,
          total_price: hotel.total_price,
          room_type: roomType || hotel.room_type,
          nights: hotel.nights,
        }),
      })
      setMessage({ type: 'success', text: '酒店预订成功' })
    } catch { setMessage({ type: 'error', text: '预订失败' }) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">差旅预订</h1>
        <select
          value={selectedAppId}
          onChange={(e) => setSelectedAppId(Number(e.target.value) || '')}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">选择差旅申请</option>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              APP-{String(app.id).padStart(4, '0')} {app.destination}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          message.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('flight')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'flight' ? 'bg-primary text-white' : 'bg-white text-auxiliary hover:bg-gray-50'
          }`}
        >
          <Plane className="h-4 w-4" /> 机票预订
        </button>
        <button
          onClick={() => setActiveTab('hotel')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'hotel' ? 'bg-primary text-white' : 'bg-white text-auxiliary hover:bg-gray-50'
          }`}
        >
          <Building2 className="h-4 w-4" /> 酒店预订
        </button>
      </div>

      {activeTab === 'flight' && (
        <div className="space-y-4">
          <div className="flex items-end gap-3 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-auxiliary">出发地</label>
              <input
                value={flightSearch.from}
                onChange={(e) => setFlightSearch({ ...flightSearch, from: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="如：北京"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm text-auxiliary">目的地</label>
              <input
                value={flightSearch.to}
                onChange={(e) => setFlightSearch({ ...flightSearch, to: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="如：上海"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm text-auxiliary">日期</label>
              <input
                type="date"
                value={flightSearch.date}
                onChange={(e) => setFlightSearch({ ...flightSearch, date: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleFlightSearch}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
            >
              <Search className="h-4 w-4" /> 搜索
            </button>
          </div>

          <div className="space-y-3">
            {flights.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-medium text-gray-900">{f.airline} {f.flight_no}</p>
                    <p className="text-xs text-auxiliary">{f.cabin} | 余票 {f.seats_remaining}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-gray-900">{f.departure_time}</p>
                    <p className="text-xs text-auxiliary">{f.origin}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-auxiliary">{f.duration}</p>
                    <div className="my-1 h-px w-16 bg-gray-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-gray-900">{f.arrival_time}</p>
                    <p className="text-xs text-auxiliary">{f.destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-mono text-xl font-bold text-accent">¥{f.price.toLocaleString()}</p>
                  <button
                    onClick={() => handleBookFlight(f)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    预订
                  </button>
                </div>
              </div>
            ))}
            {flights.length === 0 && !loading && (
              <div className="py-12 text-center text-sm text-auxiliary">请搜索航班</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'hotel' && (
        <div className="space-y-4">
          <div className="flex items-end gap-3 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-auxiliary">城市</label>
              <select
                value={hotelSearch.city}
                onChange={(e) => setHotelSearch({ ...hotelSearch, city: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">选择城市</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm text-auxiliary">入住日期</label>
              <input
                type="date"
                value={hotelSearch.checkIn}
                onChange={(e) => setHotelSearch({ ...hotelSearch, checkIn: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm text-auxiliary">退房日期</label>
              <input
                type="date"
                value={hotelSearch.checkOut}
                onChange={(e) => setHotelSearch({ ...hotelSearch, checkOut: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleHotelSearch}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
            >
              <Search className="h-4 w-4" /> 搜索
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hotels.map((h) => (
              <div key={h.id} className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{h.name}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      {Array.from({ length: h.stars }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="text-right">
                    <span className="font-mono text-xl font-bold text-accent">¥{h.price_per_night}</span>
                    <span className="text-xs text-auxiliary">/晚</span>
                  </p>
                </div>
                <p className="mb-1 text-xs text-auxiliary">{h.location}</p>
                <p className="mb-3 text-xs text-auxiliary">可订 {h.availability} 间</p>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={h.room_type}
                    className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-primary"
                    id={`room-${h.id}`}
                  >
                    <option value="standard">标准间</option>
                    <option value="business">商务间</option>
                    <option value="suite">套房</option>
                  </select>
                  <button
                    onClick={() => {
                      const sel = document.getElementById(`room-${h.id}`) as HTMLSelectElement
                      handleBookHotel(h, sel?.value || h.room_type)
                    }}
                    className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    预订
                  </button>
                </div>
              </div>
            ))}
          </div>
          {hotels.length === 0 && !loading && (
            <div className="py-12 text-center text-sm text-auxiliary">请搜索酒店</div>
          )}
        </div>
      )}
    </div>
  )
}
