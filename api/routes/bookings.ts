import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

const flightCache: Record<string, any[]> = {}

function generateFlights(origin: string, destination: string, date: string) {
  const key = `${origin}-${destination}-${date}`
  if (flightCache[key]) return flightCache[key]

  const airlines = ['国航', '南航', '东航', '海航', '厦航', '深航']
  const flights = []
  const count = 5 + Math.floor(Math.random() * 4)
  const basePrice = 500 + Math.floor(Math.random() * 1500)

  for (let i = 0; i < count; i++) {
    const hour = 6 + Math.floor(Math.random() * 14)
    const minute = Math.random() > 0.5 ? '00' : '30'
    const duration = 2 + Math.floor(Math.random() * 3)
    const arriveHour = hour + duration
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    const flightNo = airline === '国航' ? 'CA' : airline === '南航' ? 'CZ' : airline === '东航' ? 'MU' : airline === '海航' ? 'HU' : airline === '厦航' ? 'MF' : 'ZH'
    const num = 1000 + Math.floor(Math.random() * 9000)

    flights.push({
      id: `FL-${key}-${i}`,
      flight_no: `${flightNo}${num}`,
      airline,
      origin,
      destination,
      date,
      departure_time: `${String(hour).padStart(2, '0')}:${minute}`,
      arrival_time: `${String(arriveHour).padStart(2, '0')}:${minute}`,
      duration: `${duration}h${Math.random() > 0.5 ? '30m' : '00m'}`,
      price: basePrice + i * 150 + Math.floor(Math.random() * 200),
      cabin: Math.random() > 0.7 ? '商务舱' : '经济舱',
      seats_remaining: 2 + Math.floor(Math.random() * 15),
    })
  }

  flights.sort((a, b) => a.departure_time.localeCompare(b.departure_time))
  flightCache[key] = flights
  return flights
}

const hotelCache: Record<string, any[]> = {}

function generateHotels(city: string, checkin: string, checkout: string) {
  const key = `${city}-${checkin}-${checkout}`
  if (hotelCache[key]) return hotelCache[key]

  const hotelNames = ['希尔顿', '万豪', '洲际', '凯悦', '如家', '全季', '亚朵', '锦江']
  const locations = ['市中心', '火车站', '机场', '商务区', '高新区', '会展中心']
  const hotels = []
  const count = 4 + Math.floor(Math.random() * 3)

  for (let i = 0; i < count; i++) {
    const name = hotelNames[i % hotelNames.length]
    const location = locations[i % locations.length]
    const stars = 3 + Math.floor(Math.random() * 3)
    const basePrice = 200 + stars * 150 + Math.floor(Math.random() * 300)
    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))

    hotels.push({
      id: `HTL-${key}-${i}`,
      name: `${city}${location}${name}酒店`,
      city,
      location,
      stars,
      price_per_night: basePrice,
      total_price: basePrice * nights,
      nights,
      rating: (4 + Math.random()).toFixed(1),
      room_type: stars >= 5 ? '豪华大床房' : stars >= 4 ? '标准双床房' : '舒适大床房',
      amenities: ['WiFi', '早餐', stars >= 4 ? '健身房' : '', stars >= 5 ? '游泳池' : ''].filter(Boolean),
      availability: 1 + Math.floor(Math.random() * 5),
    })
  }

  hotels.sort((a, b) => b.stars - a.stars)
  hotelCache[key] = hotels
  return hotels
}

router.get('/flights/search', async (req: Request, res: Response): Promise<void> => {
  const { origin, destination, date } = req.query
  if (!origin || !destination || !date) {
    res.status(400).json({ success: false, error: '请提供出发地、目的地和日期' })
    return
  }
  const flights = generateFlights(origin as string, destination as string, date as string)
  res.json({ success: true, data: flights })
})

router.get('/hotels/search', async (req: Request, res: Response): Promise<void> => {
  const { city, checkin, checkout } = req.query
  if (!city || !checkin || !checkout) {
    res.status(400).json({ success: false, error: '请提供城市、入住和退房日期' })
    return
  }
  const hotels = generateHotels(city as string, checkin as string, checkout as string)
  res.json({ success: true, data: hotels })
})

router.post('/flight', async (req: Request, res: Response): Promise<void> => {
  const { application_id, flight_id, flight_no, airline, origin, destination, date, departure_time, arrival_time, price, cabin } = req.body

  const application = db.applications.findById(application_id)
  if (!application) {
    res.status(400).json({ success: false, error: '出差申请不存在' })
    return
  }

  const booking = db.bookings.create({
    application_id,
    type: 'flight',
    reference_id: flight_no || flight_id,
    detail: `${airline} ${flight_no} ${origin}-${destination} ${date} ${departure_time}-${arrival_time} ${cabin}`,
    amount: price,
  })

  res.json({ success: true, data: booking })
})

router.post('/hotel', async (req: Request, res: Response): Promise<void> => {
  const { application_id, hotel_id, name, city, checkin, checkout, price_per_night, total_price, room_type, nights } = req.body

  const application = db.applications.findById(application_id)
  if (!application) {
    res.status(400).json({ success: false, error: '出差申请不存在' })
    return
  }

  const booking = db.bookings.create({
    application_id,
    type: 'hotel',
    reference_id: hotel_id || `HTL-${Date.now()}`,
    detail: `${name} ${room_type} ${checkin}至${checkout} ${nights}晚`,
    amount: total_price,
  })

  res.json({ success: true, data: booking })
})

export default router
