import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/monthly', async (req: Request, res: Response): Promise<void> => {
  const month = req.query.month as string || new Date().toISOString().slice(0, 7)

  const applications = db.applications.findAll()
  const reimbursements = db.reimbursements.findAll()
  const users = db.users.findAll()

  const byDepartment: Record<string, { count: number; total_budget: number; total_actual: number }> = {}
  for (const app of applications) {
    const user = users.find(u => u.id === app.user_id)
    const dept = user?.department || '未知'
    if (!byDepartment[dept]) byDepartment[dept] = { count: 0, total_budget: 0, total_actual: 0 }
    byDepartment[dept].count++
    byDepartment[dept].total_budget += app.total_cost
    const reimb = reimbursements.find(r => r.application_id === app.id)
    if (reimb) byDepartment[dept].total_actual += reimb.total_actual
  }

  const byDestination: Record<string, { count: number; total_budget: number }> = {}
  for (const app of applications) {
    if (!byDestination[app.city]) byDestination[app.city] = { count: 0, total_budget: 0 }
    byDestination[app.city].count++
    byDestination[app.city].total_budget += app.total_cost
  }

  const monthlyData: Record<string, { applications: number; budget: number; actual: number }> = {}
  for (const app of applications) {
    const m = app.created_at.slice(0, 7)
    if (!monthlyData[m]) monthlyData[m] = { applications: 0, budget: 0, actual: 0 }
    monthlyData[m].applications++
    monthlyData[m].budget += app.total_cost
    const reimb = reimbursements.find(r => r.application_id === app.id)
    if (reimb) monthlyData[m].actual += reimb.total_actual
  }

  const trend = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }))

  const totalBudget = applications.reduce((sum, a) => sum + a.total_cost, 0)
  const totalActual = reimbursements.reduce((sum, r) => sum + r.total_actual, 0)
  const totalSubsidy = reimbursements.reduce((sum, r) => sum + r.subsidy_amount, 0)
  const pendingCount = applications.filter(a => a.status === 'pending').length
  const approvedCount = applications.filter(a => a.status === 'approved').length
  const rejectedCount = applications.filter(a => a.status === 'rejected').length

  res.json({
    success: true,
    data: {
      summary: { total_applications: applications.length, total_budget: totalBudget, total_actual: totalActual, total_subsidy: totalSubsidy, pending_count: pendingCount, approved_count: approvedCount, rejected_count: rejectedCount },
      by_department: Object.entries(byDepartment).map(([department, data]) => ({ department, ...data })),
      by_destination: Object.entries(byDestination).map(([city, data]) => ({ city, ...data })),
      trend,
    },
  })
})

export default router
