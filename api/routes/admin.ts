import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  const users = db.users.findAll().map(({ password, ...rest }) => rest)
  res.json({ success: true, data: users })
})

router.post('/users', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, rank, department } = req.body
  if (!name || !email || !password || !role || !rank || !department) {
    res.status(400).json({ success: false, error: '请填写完整用户信息' })
    return
  }
  const existing = db.users.findByEmail(email)
  if (existing) {
    res.status(400).json({ success: false, error: '邮箱已存在' })
    return
  }
  const user = db.users.create({ name, email, password, role, rank, department })
  const { password: _, ...rest } = user
  res.json({ success: true, data: rest })
})

router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id)
  const { name, email, role, rank, department } = req.body
  const user = db.users.update(id, { name, email, role, rank, department })
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  const { password: _, ...rest } = user
  res.json({ success: true, data: rest })
})

router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id)
  const user = db.users.findById(id)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  db.users.update(id, { name: '' })
  res.json({ success: true, data: { deleted: id } })
})

router.get('/approval-routes', async (_req: Request, res: Response): Promise<void> => {
  const routes = db.approvalRoutes.findAll().map(route => {
    const steps = db.approvalRouteSteps.findByRouteId(route.id)
    return { ...route, steps }
  })
  res.json({ success: true, data: routes })
})

router.put('/approval-routes/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id)
  const { name, min_amount, max_amount, rank } = req.body
  const route = db.approvalRoutes.update(id, { name, min_amount, max_amount, rank })
  if (!route) {
    res.status(404).json({ success: false, error: '审批路线不存在' })
    return
  }
  const steps = db.approvalRouteSteps.findByRouteId(route.id)
  res.json({ success: true, data: { ...route, steps } })
})

router.get('/subsidy-standards', async (_req: Request, res: Response): Promise<void> => {
  const standards = db.subsidyStandards.findAll().map(standard => {
    const rates = db.subsidyRates.findByStandardId(standard.id)
    return { ...standard, rates }
  })
  res.json({ success: true, data: standards })
})

router.put('/subsidy-standards/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id)
  const { city, city_tier, rates } = req.body

  const standard = db.subsidyStandards.update(id, { city, city_tier })
  if (!standard) {
    res.status(404).json({ success: false, error: '补贴标准不存在' })
    return
  }

  if (rates && Array.isArray(rates)) {
    for (const rateUpdate of rates) {
      if (rateUpdate.id) {
        db.subsidyRates.update(rateUpdate.id, { daily_amount: rateUpdate.daily_amount })
      }
    }
  }

  const updatedRates = db.subsidyRates.findByStandardId(standard.id)
  res.json({ success: true, data: { ...standard, rates: updatedRates } })
})

export default router
