import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const status = req.query.status as string

  let list = db.reimbursements.findAll()
  if (status) list = list.filter(r => r.status === status)

  const total = list.length
  const items = list.slice((page - 1) * pageSize, page * pageSize).map(r => {
    const application = db.applications.findById(r.application_id)
    const user = application ? db.users.findById(application.user_id) : null
    return { ...r, destination: application?.destination || '', city: application?.city || '', user_name: user?.name || '' }
  })

  res.json({ success: true, data: { items, total, page, pageSize } })
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { application_id, transport_actual, accommodation_actual, meal_actual, other_actual, over_budget_explanation } = req.body

  const application = db.applications.findById(application_id)
  if (!application) {
    res.status(400).json({ success: false, error: '出差申请不存在' })
    return
  }

  const existingReimb = db.reimbursements.findByApplicationId(application_id)
  if (existingReimb) {
    res.status(400).json({ success: false, error: '该申请已存在报销单' })
    return
  }

  const total_actual = transport_actual + accommodation_actual + meal_actual + other_actual

  const standard = db.subsidyStandards.findByCity(application.city)
  let subsidy_amount = 0
  if (standard) {
    const rates = db.subsidyRates.findByStandardId(standard.id)
    const accommodationRate = rates.find(r => r.category === '住宿')
    const mealRate = rates.find(r => r.category === '餐饮')
    const transportRate = rates.find(r => r.category === '交通')
    subsidy_amount = ((accommodationRate?.daily_amount || 0) + (mealRate?.daily_amount || 0) + (transportRate?.daily_amount || 0)) * application.days
  }

  const isOverBudget = total_actual > application.total_cost
  const finalExplanation = isOverBudget ? over_budget_explanation : ''

  const reimbursement = db.reimbursements.create({
    application_id,
    transport_actual,
    accommodation_actual,
    meal_actual,
    other_actual,
    total_actual,
    subsidy_amount,
    over_budget_explanation: finalExplanation,
    status: 'pending',
    settled_at: null,
  })

  res.json({ success: true, data: reimbursement })
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id)
  const reimbursement = db.reimbursements.findById(id)
  if (!reimbursement) {
    res.status(404).json({ success: false, error: '报销单不存在' })
    return
  }

  const application = db.applications.findById(reimbursement.application_id)
  const user = application ? db.users.findById(application.user_id) : null
  const bookings = application ? db.bookings.findByApplicationId(application.id) : []

  res.json({
    success: true,
    data: {
      ...reimbursement,
      application: application ? { ...application, user_name: user?.name || '' } : null,
      bookings,
    },
  })
})

export default router
