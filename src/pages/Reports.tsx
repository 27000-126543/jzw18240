import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = ['#1e3a5f', '#e67e22', '#10b981', '#64748b', '#ef4444', '#8b5cf6']

interface ReportResponse {
  totalExpense: number
  byDepartment: { department: string; count: number; total_budget: number; total_actual: number }[]
  byDestination: { city: string; count: number; total_budget: number }[]
  trend: { month: string; applications: number; budget: number; actual: number }[]
}

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

export default function Reports() {
  const fetchApi = useStore((s) => s.fetchApi)
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [report, setReport] = useState<ReportResponse | null>(null)

  useEffect(() => {
    fetchApi<ReportResponse>(`/api/reports/monthly?year=${year}&month=${month}`)
      .then(setReport)
      .catch(() => {})
  }, [year, month, fetchApi])

  const trend = report?.trend?.length ? report.trend : []
  const byDept = report?.byDepartment?.length ? report.byDepartment : []
  const byDest = report?.byDestination?.length ? report.byDestination : []

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">数据报表</h1>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {years.map((y) => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {months.map((m) => <option key={m} value={m}>{m}月</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">月度费用趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e67e22" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#e67e22" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="budget" stroke="#1e3a5f" fill="url(#budgetGrad)" strokeWidth={2} name="预算" />
            <Area type="monotone" dataKey="actual" stroke="#e67e22" fill="url(#actualGrad)" strokeWidth={2} name="实际" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">部门费用分析</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={byDept}
                dataKey="total_actual"
                nameKey="department"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
              >
                {byDept.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-auxiliary">
                <th className="pb-2 font-medium">部门</th>
                <th className="pb-2 font-medium">出差人次</th>
                <th className="pb-2 font-medium">预算</th>
                <th className="pb-2 font-medium">实际</th>
              </tr>
            </thead>
            <tbody>
              {byDept.map((d) => (
                <tr key={d.department} className="border-b border-gray-50">
                  <td className="py-2">{d.department}</td>
                  <td className="py-2">{d.count}</td>
                  <td className="py-2 font-mono">¥{d.total_budget.toLocaleString()}</td>
                  <td className="py-2 font-mono">¥{d.total_actual.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">目的地费用分析</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byDest} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 12 }} stroke="#94a3b8" width={60} />
              <Tooltip />
              <Bar dataKey="total_budget" fill="#1e3a5f" radius={[0, 4, 4, 0]} name="费用" />
            </BarChart>
          </ResponsiveContainer>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-auxiliary">
                <th className="pb-2 font-medium">目的地</th>
                <th className="pb-2 font-medium">出差人次</th>
                <th className="pb-2 font-medium">费用</th>
              </tr>
            </thead>
            <tbody>
              {byDest.map((d) => (
                <tr key={d.city} className="border-b border-gray-50">
                  <td className="py-2">{d.city}</td>
                  <td className="py-2">{d.count}</td>
                  <td className="py-2 font-mono">¥{d.total_budget.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
