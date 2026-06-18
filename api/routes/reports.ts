import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/monthly', async (req: Request, res: Response): Promise<void> => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear()
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1
  const targetMonth = `${year}-${String(month).padStart(2, '0')}`

  const allApplications = db.applications.findAll()
  const allReimbursements = db.reimbursements.findAll()
  const users = db.users.findAll()

  const monthApplications = allApplications.filter(app =>
    app.created_at.slice(0, 7) === targetMonth
  )

  const byDepartment: Record<string, { count: number; total_budget: number; total_actual: number; total_subsidy: number }> = {}
  const byDestination: Record<string, { count: number; total_budget: number; total_actual: number; total_subsidy: number }> = {}

  let totalActual = 0
  let totalSubsidy = 0

  for (const app of monthApplications) {
    const user = users.find(u => u.id === app.user_id)
    const dept = user?.department || '未知'
    const reimb = allReimbursements.find(r => r.application_id === app.id)

    if (!byDepartment[dept]) byDepartment[dept] = { count: 0, total_budget: 0, total_actual: 0, total_subsidy: 0 }
    byDepartment[dept].count++
    byDepartment[dept].total_budget += app.total_cost
    if (reimb) {
      byDepartment[dept].total_actual += reimb.total_actual
      byDepartment[dept].total_subsidy += reimb.subsidy_amount
    }

    if (!byDestination[app.city]) byDestination[app.city] = { count: 0, total_budget: 0, total_actual: 0, total_subsidy: 0 }
    byDestination[app.city].count++
    byDestination[app.city].total_budget += app.total_cost
    if (reimb) {
      byDestination[app.city].total_actual += reimb.total_actual
      byDestination[app.city].total_subsidy += reimb.subsidy_amount
    }

    if (reimb) {
      totalActual += reimb.total_actual
      totalSubsidy += reimb.subsidy_amount
    }
  }

  const monthlyData: Record<string, { applications: number; budget: number; actual: number }> = {}
  for (let m = 0; m < 6; m++) {
    const d = new Date(year, month - 1 - m, 1)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = { applications: 0, budget: 0, actual: 0 }
  }

  for (const app of allApplications) {
    const m = app.created_at.slice(0, 7)
    if (monthlyData[m] !== undefined) {
      monthlyData[m].applications++
      monthlyData[m].budget += app.total_cost
      const reimb = allReimbursements.find(r => r.application_id === app.id)
      if (reimb) monthlyData[m].actual += reimb.total_actual
    }
  }

  const trend = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [y, mo] = key.split('-')
      return { month: `${mo}月`, fullMonth: key, ...data }
    })

  const totalBudget = monthApplications.reduce((sum, a) => sum + a.total_cost, 0)
  const pendingCount = monthApplications.filter(a => a.status === 'pending').length
  const approvedCount = monthApplications.filter(a => a.status === 'approved').length
  const rejectedCount = monthApplications.filter(a => a.status === 'rejected').length

  res.json({
    success: true,
    data: {
      summary: {
        year,
        month,
        total_applications: monthApplications.length,
        total_budget: totalBudget,
        total_actual: totalActual,
        total_subsidy: totalSubsidy,
        pending_count: pendingCount,
        approved_count: approvedCount,
        rejected_count: rejectedCount,
      },
      by_department: Object.entries(byDepartment).map(([department, data]) => ({ department, ...data })),
      by_destination: Object.entries(byDestination).map(([city, data]) => ({ city, ...data })),
      trend,
    },
  })
})

export default router
