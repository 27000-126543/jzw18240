import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import type { ApprovalRoute } from '@/types'
import { MapPin, Calendar, DollarSign, ChevronRight } from 'lucide-react'

const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '西安']

const costItems = [
  { key: 'transport_cost', label: '交通费' },
  { key: 'accommodation_cost', label: '住宿费' },
  { key: 'meal_cost', label: '餐饮费' },
  { key: 'other_cost', label: '其他费用' },
] as const

export default function NewApplication() {
  const navigate = useNavigate()
  const fetchApi = useStore((s) => s.fetchApi)
  const currentUser = useStore((s) => s.currentUser)

  const [form, setForm] = useState({
    destination: '',
    city: '',
    departure_date: '',
    return_date: '',
    purpose: '',
    transport_cost: 0,
    accommodation_cost: 0,
    meal_cost: 0,
    other_cost: 0,
  })
  const [matchedRoute, setMatchedRoute] = useState<ApprovalRoute | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalCost = form.transport_cost + form.accommodation_cost + form.meal_cost + form.other_cost

  const days = form.departure_date && form.return_date
    ? Math.ceil(
        (new Date(form.return_date).getTime() - new Date(form.departure_date).getTime()) /
        (1000 * 60 * 60 * 24),
      ) + 1
    : 0

  const checkApprovalRoute = async (amount: number) => {
    if (amount <= 0 || !currentUser) {
      setMatchedRoute(null)
      return
    }
    try {
      const routes = await fetchApi<ApprovalRoute[]>('/api/admin/approval-routes')
      const match = routes.find(
        (r) =>
          r.rank === currentUser.rank &&
          amount >= r.min_amount &&
          (r.max_amount === null || amount < r.max_amount),
      )
      setMatchedRoute(match || null)
    } catch {
      setMatchedRoute(null)
      void 0
    }
  }

  const handleCostChange = (key: string, value: number) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value }
      const newTotal = updated.transport_cost + updated.accommodation_cost + updated.meal_cost + updated.other_cost
      setTimeout(() => checkApprovalRoute(newTotal), 300)
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await fetchApi('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          user_id: currentUser?.id,
          ...form,
        }),
      })
      navigate('/applications')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '提交失败'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">新建差旅申请</h1>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="h-4 w-4" />
            基本信息
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-auxiliary">目的地</label>
              <input
                type="text"
                value={form.destination}
                onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
                placeholder="如：北京总部"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-auxiliary">城市</label>
              <select
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                required
              >
                <option value="">请选择城市</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-auxiliary">出发日期</label>
              <input
                type="date"
                value={form.departure_date}
                onChange={(e) => setForm((prev) => ({ ...prev, departure_date: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-auxiliary">返回日期</label>
              <input
                type="date"
                value={form.return_date}
                onChange={(e) => setForm((prev) => ({ ...prev, return_date: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-auxiliary">出差事由</label>
              <textarea
                value={form.purpose}
                onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
                placeholder="请描述出差目的和内容"
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
          </div>
          {days > 0 && (
            <p className="mt-2 text-sm text-auxiliary">
              <Calendar className="mr-1 inline h-4 w-4" />
              出差天数：<span className="font-mono font-medium text-primary">{days}</span> 天
            </p>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <DollarSign className="h-4 w-4" />
            预估费用
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-auxiliary">
                <th className="pb-2 font-medium">费用项目</th>
                <th className="pb-2 text-right font-medium">金额（元）</th>
              </tr>
            </thead>
            <tbody>
              {costItems.map((item) => (
                <tr key={item.key} className="border-b border-gray-50">
                  <td className="py-2.5">{item.label}</td>
                  <td className="py-2.5 text-right">
                    <input
                      type="number"
                      min="0"
                      value={form[item.key] || ''}
                      onChange={(e) => handleCostChange(item.key, Number(e.target.value))}
                      className="w-32 rounded border border-gray-200 px-2 py-1 text-right font-mono text-sm outline-none focus:border-primary"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2.5">合计</td>
                <td className="py-2.5 text-right font-mono text-primary">
                  ¥{totalCost.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {matchedRoute && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ChevronRight className="h-4 w-4" />
              审批路由预览
            </h2>
            <div className="rounded-lg bg-primary-50 p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">
                  {matchedRoute.name}
                </span>
                <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">
                  {currentUser?.rank === 'junior' ? '员工' : currentUser?.rank === 'senior' ? '高级员工' : currentUser?.rank === 'director' ? '总监' : '副总裁'}
                </span>
              </div>
              <p className="mt-1 text-xs text-auxiliary">
                费用范围：¥{matchedRoute.min_amount.toLocaleString()} - {matchedRoute.max_amount ? `¥${matchedRoute.max_amount.toLocaleString()}` : '无上限'}
              </p>
              {matchedRoute.steps && matchedRoute.steps.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {matchedRoute.steps.map((step, idx) => (
                    <span key={step.id} className="flex items-center gap-2 text-xs">
                      <span className="rounded bg-primary px-2.5 py-1 font-medium text-white">
                        第{step.step_order}步：{step.approver_role === 'manager' ? '部门经理' : step.approver_role === 'director' ? '总监' : '副总裁'}
                      </span>
                      {idx < matchedRoute.steps!.length - 1 && <ChevronRight className="h-3 w-3 text-auxiliary" />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? '提交中...' : '提交申请'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
