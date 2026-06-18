import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import type { ReportData } from '@/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Clock, Receipt, DollarSign, Users, Plus, Plane, FileText } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const fetchApi = useStore((s) => s.fetchApi)
  const [report, setReport] = useState<ReportData | null>(null)

  useEffect(() => {
    fetchApi<ReportData>('/api/reports/monthly').then(setReport).catch(() => {})
    fetchApi('/api/applications').catch(() => {})
  }, [fetchApi])

  const pendingCount = report?.summary.pending_count ?? 0
  const reimbursementPending = 0
  const totalBudget = report?.summary.total_budget ?? 0
  const totalApps = report?.summary.total_applications ?? 0

  const trend = report?.trend?.length
    ? report.trend
    : [
        { month: '2025-01', budget: 12000, actual: 10500 },
        { month: '2025-02', budget: 8500, actual: 9200 },
        { month: '2025-03', budget: 15600, actual: 14200 },
        { month: '2025-04', budget: 11200, actual: 10800 },
        { month: '2025-05', budget: 18400, actual: 16900 },
        { month: '2025-06', budget: 14000, actual: 12300 },
      ]

  const departmentData = report?.by_department?.length
    ? report.by_department
    : [
        { department: '技术部', total_budget: 24000, total_actual: 22000, count: 3 },
        { department: '市场部', total_budget: 18000, total_actual: 19500, count: 2 },
        { department: '行政部', total_budget: 8000, total_actual: 7500, count: 1 },
      ]

  const statCards = [
    {
      label: '待审批数',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: '待报销数',
      value: reimbursementPending,
      icon: Receipt,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '本月费用总额',
      value: `¥${totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary-50',
    },
    {
      label: '本月出差人次',
      value: totalApps,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-auxiliary">{card.label}</p>
                <p className="font-mono text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">月度费用趋势</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="budget" stroke="#1e3a5f" strokeWidth={2} name="预算" />
              <Line type="monotone" dataKey="actual" stroke="#e67e22" strokeWidth={2} name="实际" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">部门费用排名</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="department" tick={{ fontSize: 12 }} stroke="#94a3b8" width={60} />
              <Tooltip />
              <Bar dataKey="total_budget" fill="#1e3a5f" radius={[0, 4, 4, 0]} name="预算" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">快捷操作</h3>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/applications/new')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            新建申请
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-600"
          >
            <Plane className="h-4 w-4" />
            差旅预订
          </button>
          <button
            onClick={() => navigate('/reimbursements')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            提交报销
          </button>
        </div>
      </div>
    </div>
  )
}
