import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/pending', async (_req: Request, res: Response): Promise<void> => {
  const pending = db.reimbursements.findByStatus('pending')
  const items = pending.map(r => {
    const application = db.applications.findById(r.application_id)
    const user = application ? db.users.findById(application.user_id) : null
    return {
      ...r,
      destination: application?.destination || '',
      city: application?.city || '',
      user_name: user?.name || '',
      department: user?.department || '',
      departure_date: application?.departure_date || '',
      return_date: application?.return_date || '',
    }
  })
  res.json({ success: true, data: items })
})

router.post('/settle', async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ success: false, error: '请提供要结算的报销单ID列表' })
    return
  }

  const settled: any[] = []
  const failed: any[] = []

  for (const id of ids) {
    const reimbursement = db.reimbursements.findById(id)
    if (!reimbursement) {
      failed.push({ id, reason: '报销单不存在' })
      continue
    }
    if (reimbursement.status !== 'pending') {
      failed.push({ id, reason: '报销单状态不是待结算' })
      continue
    }
    const updated = db.reimbursements.update(id, {
      status: 'settled',
      settled_at: new Date().toISOString(),
    })
    if (updated) settled.push(updated)
  }

  res.json({ success: true, data: { settled, failed, settled_count: settled.length, failed_count: failed.length } })
})

export default router
