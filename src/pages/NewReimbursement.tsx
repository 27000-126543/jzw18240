import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/store'
import type { Application, SubsidyStandard } from '@/types'
import { Send, AlertTriangle } from 'lucide-react'

const tierLabels: Record<string, string> = { tier1: '一线', tier2: '二线', tier3: '三线' }

export default function NewReimbursement() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const fetchApi = useStore((s) => s.fetchApi)
  const [app, setApp] = useState<Application | null>(null)
  const [subsidy, setSubsidy] = useState<SubsidyStandard | null>(null)
  const [costs, setCosts] = useState({ transport: '', accommodation: '', meal: '', other: '' })
  const [explanation, setExplanation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const id = Number(applicationId)
    if (!id) return
    fetchApi<Application>(`/api/applications/${id}`).then(setApp).catch(() => {})
    fetchApi<SubsidyStandard[]>('/api/admin/subsidy-standards')
      .then((standards) => {
        const arr = Array.isArray(standards) ? standards : []
        const match = arr.find((s) => app?.city && s.city === app.city)
        if (match) setSubsidy(match)
      })
      .catch(() => {})
  }, [applicationId, fetchApi])

  useEffect(() => {
    if (!app?.city) return
    fetchApi<SubsidyStandard[]>('/api/admin/subsidy-standards')
      .then((standards) => {
        const arr = Array.isArray(standards) ? standards : []
        const match = arr.find((s) => s.city === app.city)
        if (match) setSubsidy(match)
      })
      .catch(() => {})
  }, [app?.city, fetchApi])

  const totalActual = [costs.transport, costs.accommodation, costs.meal, costs.other]
    .reduce((sum, v) => sum + (Number(v) || 0), 0)

  const getRate = (category: string) => {
    const rate = subsidy?.rates?.find((r) => r.category === category)
    return rate?.daily_amount || 0
  }

  const transportSubsidy = getRate('transport') * (app?.days || 0)
  const accommodationSubsidy = getRate('accommodation') * (app?.days || 0)
  const mealSubsidy = getRate('meal') * (app?.days || 0)
  const totalSubsidy = transportSubsidy + accommodationSubsidy + mealSubsidy

  const isOverBudget = totalActual > (app?.total_cost || 0)
  const overAmount = isOverBudget ? totalActual - (app?.total_cost || 0) : 0

  const handleSubmit = async () => {
    if (!app) return
    if (isOverBudget && !explanation.trim()) return
    setSubmitting(true)
    try {
      await fetchApi('/api/reimbursements', {
        method: 'POST',
        body: JSON.stringify({
          application_id: app.id,
          transport_actual: Number(costs.transport) || 0,
          accommodation_actual: Number(costs.accommodation) || 0,
          meal_actual: Number(costs.meal) || 0,
          other_actual: Number(costs.other) || 0,
          over_budget_explanation: isOverBudget ? explanation : undefined,
        }),
      })
      navigate('/reimbursements')
    } catch { void 0 }
    setSubmitting(false)
  }

  if (!app) return <div className="py-12 text-center text-auxiliary">加载中...</div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">提交报销</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">申请信息</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-auxiliary">目的地</p>
              <p className="font-medium text-gray-900">{app.destination}</p>
            </div>
            <div>
              <p className="text-xs text-auxiliary">出行日期</p>
              <p className="font-mono text-gray-900">{app.departure_date} ~ {app.return_date}</p>
            </div>
            <div>
              <p className="text-xs text-auxiliary">出差天数</p>
              <p className="text-gray-900">{app.days} 天</p>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-auxiliary">预估费用</p>
              <div className="mt-1 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-auxiliary">交通</span>
                  <span className="font-mono">¥{app.transport_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-auxiliary">住宿</span>
                  <span className="font-mono">¥{app.accommodation_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-auxiliary">餐饮</span>
                  <span className="font-mono">¥{app.meal_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-auxiliary">其他</span>
                  <span className="font-mono">¥{app.other_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-1 font-medium">
                  <span>合计</span>
                  <span className="font-mono text-primary">¥{app.total_cost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">实际费用</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-auxiliary">交通费</label>
                <input
                  type="number"
                  value={costs.transport}
                  onChange={(e) => setCosts({ ...costs, transport: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-auxiliary">住宿费</label>
                <input
                  type="number"
                  value={costs.accommodation}
                  onChange={(e) => setCosts({ ...costs, accommodation: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-auxiliary">餐饮费</label>
                <input
                  type="number"
                  value={costs.meal}
                  onChange={(e) => setCosts({ ...costs, meal: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-auxiliary">其他</label>
                <input
                  type="number"
                  value={costs.other}
                  onChange={(e) => setCosts({ ...costs, other: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 font-medium">
              <span>实际费用合计</span>
              <span className="font-mono text-primary">¥{totalActual.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">补贴计算</h3>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-auxiliary">城市等级：</span>
              <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                {subsidy ? tierLabels[subsidy.city_tier] || subsidy.city_tier : '-'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-auxiliary">交通补贴：{app.days}天 × ¥{getRate('transport')}/天</span>
                <span className="font-mono">¥{transportSubsidy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">住宿补贴：{app.days}天 × ¥{getRate('accommodation')}/天</span>
                <span className="font-mono">¥{accommodationSubsidy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">餐饮补贴：{app.days}天 × ¥{getRate('meal')}/天</span>
                <span className="font-mono">¥{mealSubsidy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 font-medium">
                <span>补贴合计</span>
                <span className="font-mono text-success">¥{totalSubsidy.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {isOverBudget && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-danger-700">
                <AlertTriangle className="h-4 w-4" />
                超出预算 ¥{overAmount.toLocaleString()}，请说明原因
              </div>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-danger-200 bg-white px-3 py-2 text-sm outline-none focus:border-danger"
                placeholder="请输入超预算原因..."
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || (isOverBudget && !explanation.trim())}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            提交报销
          </button>
        </div>
      </div>
    </div>
  )
}
