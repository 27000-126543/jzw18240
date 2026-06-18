import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const status = req.query.status as string
  const department = req.query.department as string

  let list = db.applications.findAll()
  if (status) list = list.filter(a => a.status === status)
  if (department) {
    const deptUsers = db.users.findAll().filter(u => u.department === department)
    const deptUserIds = deptUsers.map(u => u.id)
    list = list.filter(a => deptUserIds.includes(a.user_id))
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const total = list.length
  const items = list.slice((page - 1) * pageSize, page * pageSize).map(app => {
    const user = db.users.findById(app.user_id)
    return { ...app, user_name: user?.name || '' }
  })

  res.json({ success: true, data: { items, total, page, pageSize } })
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { user_id, destination, city, departure_date, return_date, purpose, transport_cost, accommodation_cost, meal_cost, other_cost } = req.body

  const user = db.users.findById(user_id)
  if (!user) {
    res.status(400).json({ success: false, error: '用户不存在' })
    return
  }

  const total_cost = transport_cost + accommodation_cost + meal_cost + other_cost
  const departure = new Date(departure_date)
  const returnD = new Date(return_date)
  const days = Math.ceil((returnD.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const application = db.applications.create({
    user_id, destination, city, departure_date, return_date, purpose,
    transport_cost, accommodation_cost, meal_cost, other_cost, total_cost,
    status: 'pending', days,
  })

  const route = db.approvalRoutes.findMatchingRoute(total_cost, user.rank)
  if (route) {
    const steps = db.approvalRouteSteps.findByRouteId(route.id)
    steps.sort((a, b) => a.step_order - b.step_order)
    for (const step of steps) {
      const approvers = db.users.findAll().filter(u => u.role === step.approver_role)
      const approver = approvers[0]
      if (approver) {
        db.approvals.create({
          application_id: application.id,
          approver_id: approver.id,
          step_order: step.step_order,
          status: step.step_order === 1 ? 'pending' : 'pending',
          comment: '',
          approved_at: null,
        })
      }
    }
  }

  res.json({ success: true, data: application })
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id)
  const application = db.applications.findById(id)
  if (!application) {
    res.status(404).json({ success: false, error: '申请不存在' })
    return
  }

  const user = db.users.findById(application.user_id)
  const approvals = db.approvals.findByApplicationId(id).map(a => {
    const approver = db.users.findById(a.approver_id)
    return { ...a, approver_name: approver?.name || '' }
  })
  const bookings = db.bookings.findByApplicationId(id)

  res.json({ success: true, data: { ...application, user_name: user?.name || '', approvals, bookings } })
})

router.put('/:id/approve', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id)
  const { approver_id, status, comment } = req.body

  const application = db.applications.findById(id)
  if (!application) {
    res.status(404).json({ success: false, error: '申请不存在' })
    return
  }

  const pendingApprovals = db.approvals.findPendingByApplicationId(id)
  if (pendingApprovals.length === 0) {
    res.status(400).json({ success: false, error: '没有待审批记录' })
    return
  }

  const currentStep = Math.min(...pendingApprovals.map(a => a.step_order))
  const currentApproval = pendingApprovals.find(a => a.step_order === currentStep)
  if (!currentApproval) {
    res.status(400).json({ success: false, error: '审批步骤异常' })
    return
  }

  db.approvals.update(currentApproval.id, {
    status,
    comment: comment || '',
    approved_at: new Date().toISOString(),
  })

  if (status === 'rejected') {
    db.applications.update(id, { status: 'rejected' })
    res.json({ success: true, data: { application: db.applications.findById(id), action: 'rejected' } })
    return
  }

  const remainingPending = db.approvals.findPendingByApplicationId(id)
  if (remainingPending.length === 0) {
    db.applications.update(id, { status: 'approved' })
    res.json({ success: true, data: { application: db.applications.findById(id), action: 'fully_approved' } })
    return
  }

  res.json({ success: true, data: { application: db.applications.findById(id), action: 'step_approved' } })
})

export default router
