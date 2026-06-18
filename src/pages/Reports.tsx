import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import type { ReportData } from '@/types'
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
import { LayoutDashboard, Users, MapPin, TrendingUp } from 'lucide-react'

const COLORS = ['#1e3a5f', '#e67e22', '#10b981', '#64748b', '#ef4444', '#8b5cf6']

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

export default function Reports() {
  const fetchApi = useStore((s) => s.fetchApi)
  const [year, setYear] = useState(2025)
  const [month, setMonth] = useState(currentMonth)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchApi<ReportData>(`/api/reports/monthly?year=${year}&month=${month}`)
      .then((data) => {
        setReport(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year, month, fetchApi])

  const trend = report?.trend?.length ? report.trend : []
  const byDept = report?.by_department?.length ? report.by_department : []
  const byDest = report?.by_destination?.length ? report.by_destination : []
  const summary = report?.summary

  const years = Array.from({ length: 5 }, (_, i) => 2023 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const rankLabel = (count: number) => count > 0 ? `共${count}笔` : '无数据'

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

      {loading ? (
        <div className="rounded-lg bg-white p-12 text-center text-auxiliary shadow-sm">加载中...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-auxiliary">本月申请数</p>
                  <p className="font-mono text-xl font-bold text-primary">
                    {summary?.total_applications ?? 0}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-auxiliary">
                待批 {summary?.pending_count ?? 0} · 已批 {summary?.approved_count ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-auxiliary">预算总额</p>
                  <p className="font-mono text-xl font-bold text-amber-600">
                    ¥{(summary?.total_budget ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-auxiliary">{rankLabel(summary?.total_applications ?? 0)}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-auxiliary">实际支出</p>
                  <p className="font-mono text-xl font-bold text-success">
                    ¥{(summary?.total_actual ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-auxiliary">
                {summary && summary.total_budget > 0
                  ? `超支率 ${(((summary.total_actual - summary.total_budget) / summary.total_budget) * 100).toFixed(1)}%`
                  : '暂无报销'}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-auxiliary">补贴总额</p>
                  <p className="font-mono text-xl font-bold text-accent">
                    ¥{(summary?.total_subsidy ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-auxiliary">自动按城市标准计算</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-gray-700">月度费用趋势（近6个月）</h3>
            <p className="mb-4 text-xs text-auxiliary">预算与实际支出对比</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e67e22" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e67e22" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(val: number) => `¥${val.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="budget" stroke="#1e3a5f" fill="url(#budgetGrad)" strokeWidth={2} name="预算" />
                <Area type="monotone" dataKey="actual" stroke="#e67e22" fill="url(#actualGrad)" strokeWidth={2} name="实际" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-700">部门费用分析</h3>
              </div>
              <p className="mb-4 text-xs text-auxiliary">按部门统计差旅支出</p>
              {byDept.length === 0 ? (
                <div className="py-12 text-center text-sm text-auxiliary">本月无数据</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={byDept}
                        dataKey="total_actual"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {byDept.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => `¥${val.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <table className="mt-2 w-full text-sm">
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
                          <td className="py-1.5">{d.department}</td>
                          <td className="py-1.5">{d.count}</td>
                          <td className="py-1.5 font-mono">¥{d.total_budget.toLocaleString()}</td>
                          <td className="py-1.5 font-mono font-medium text-primary">¥{d.total_actual.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-gray-700">目的地费用分析</h3>
              </div>
              <p className="mb-4 text-xs text-auxiliary">按城市统计差旅支出</p>
              {byDest.length === 0 ? (
                <div className="py-12 text-center text-sm text-auxiliary">本月无数据</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={byDest} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis type="category" dataKey="city" tick={{ fontSize: 12 }} stroke="#94a3b8" width={50} />
                      <Tooltip formatter={(val: number) => `¥${val.toLocaleString()}`} />
                      <Bar dataKey="total_actual" fill="#e67e22" radius={[0, 4, 4, 0]} name="实际支出" />
                    </BarChart>
                  </ResponsiveContainer>
                  <table className="mt-2 w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-auxiliary">
                        <th className="pb-2 font-medium">目的地</th>
                        <th className="pb-2 font-medium">出差人次</th>
                        <th className="pb-2 font-medium">预算</th>
                        <th className="pb-2 font-medium">实际</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byDest.map((d) => (
                        <tr key={d.city} className="border-b border-gray-50">
                          <td className="py-1.5">{d.city}</td>
                          <td className="py-1.5">{d.count}</td>
                          <td className="py-1.5 font-mono">¥{d.total_budget.toLocaleString()}</td>
                          <td className="py-1.5 font-mono font-medium text-accent">¥{d.total_actual.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
