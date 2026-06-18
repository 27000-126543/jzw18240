import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import type { Application, SubsidyStandard, SubsidyRate } from '@/types'
import { ArrowLeft, Receipt, MapPin, Calendar, DollarSign } from 'lucide-react'

interface SubsidyResult {
  standard: SubsidyStandard | null
  rates: SubsidyRate[]
  accommodation: number
  meal: number
  transport: number
  total: number
}

export default function NewReimbursement() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const fetchApi = useStore((s) => s.fetchApi)
  const [application, setApplication] = useState<Application | null>(null)
  const [subsidy, setSubsidy] = useState<SubsidyResult | null>(null)
  const [costs, setCosts] = useState({ transport: '', accommodation: '', meal: '', other: '' })
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const appId = Number(applicationId)

  useEffect(() => {
    if (!appId) return
    setLoading(true)
    fetchApi<Application>(`/api/applications/${appId}`)
      .then((app) => {
        setApplication(app)
        const city = app.city
        const days = app.days
        const tier = ['北京', '上海'].includes(city) ? 'tier1' : ['广州', '深圳', '成都', '杭州'].includes(city) ? 'tier2' : 'tier3'
        const accommodationRate = tier === 'tier1' ? 500 : tier === 'tier2' ? 400 : 300
        const mealRate = tier === 'tier1' ? 100 : tier === 'tier2' ? 80 : 60
        const transportRate = tier === 'tier1' ? 80 : tier === 'tier2' ? 60 : 40
        setSubsidy({
          standard: { id: 0, city, city_tier: tier },
          rates: [
            { id: 1, standard_id: 0, category: '住宿', daily_amount: accommodationRate },
            { id: 2, standard_id: 0, category: '餐饮', daily_amount: mealRate },
            { id: 3, standard_id: 0, category: '交通', daily_amount: transportRate },
          ],
          accommodation: accommodationRate * days,
          meal: mealRate * days,
          transport: transportRate * days,
          total: (accommodationRate + mealRate + transportRate) * days,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [appId, fetchApi])

  const totalActual = Number(costs.transport) + Number(costs.accommodation) + Number(costs.meal) + Number(costs.other)
  const isOverBudget = application && totalActual > application.total_cost
  const overAmount = isOverBudget ? totalActual - (application?.total_cost || 0) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appId) return
    if (isOverBudget && !explanation.trim()) {
      alert('请填写超预算说明')
      return
    }
    setSubmitting(true)
    try {
      await fetchApi('/api/reimbursements', {
        method: 'POST',
        body: JSON.stringify({
          application_id: appId,
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

  const tierLabel = (tier: string) => tier === 'tier1' ? '一线城市' : tier === 'tier2' ? '二线城市' : '三线城市'

  if (loading) {
    return <div className="rounded-lg bg-white p-12 text-center text-auxiliary shadow-sm">加载中...</div>
  }

  if (!application) {
    return <div className="rounded-lg bg-white p-12 text-center text-danger shadow-sm">申请不存在</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-auxiliary hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
        <h1 className="text-xl font-bold text-gray-900">提交报销</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin className="h-4 w-4 text-primary" />
              申请摘要
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-auxiliary">目的地</span>
                <span className="font-medium text-gray-900">{application.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">城市</span>
                <span className="font-medium text-gray-900">{application.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">出行日期</span>
                <span className="font-medium text-gray-900">
                  {application.departure_date} ~ {application.return_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">出差天数</span>
                <span className="font-medium text-primary">{application.days} 天</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <DollarSign className="h-4 w-4 text-success" />
              预估费用
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-auxiliary">交通费</span>
                <span className="font-mono">¥{application.transport_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">住宿费</span>
                <span className="font-mono">¥{application.accommodation_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">餐饮费</span>
                <span className="font-mono">¥{application.meal_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">其他</span>
                <span className="font-mono">¥{application.other_cost.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">预算合计</span>
                  <span className="font-mono font-bold text-primary">¥{application.total_cost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-success-200 bg-success-50 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-success">
              <Receipt className="h-4 w-4" />
              补贴计算
            </h3>
            {subsidy ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-auxiliary">城市等级</span>
                  <span className="font-medium text-success">{tierLabel(subsidy.standard?.city_tier || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-auxiliary">住宿补贴</span>
                  <span className="font-mono">
                    {subsidy.rates.find(r => r.category === '住宿')?.daily_amount || 0} × {application.days} = ¥{subsidy.accommodation.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-auxiliary">餐饮补贴</span>
                  <span className="font-mono">
                    {subsidy.rates.find(r => r.category === '餐饮')?.daily_amount || 0} × {application.days} = ¥{subsidy.meal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-auxiliary">交通补贴</span>
                  <span className="font-mono">
                    {subsidy.rates.find(r => r.category === '交通')?.daily_amount || 0} × {application.days} = ¥{subsidy.transport.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-success-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-success">补贴合计</span>
                    <span className="font-mono font-bold text-success">¥{subsidy.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-auxiliary">该城市暂无补贴标准</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">实际费用明细</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  交通费
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-auxiliary">¥</span>
                  <input
                    type="number"
                    value={costs.transport}
                    onChange={(e) => setCosts({ ...costs, transport: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  住宿费
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-auxiliary">¥</span>
                  <input
                    type="number"
                    value={costs.accommodation}
                    onChange={(e) => setCosts({ ...costs, accommodation: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  餐饮费
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-auxiliary">¥</span>
                  <input
                    type="number"
                    value={costs.meal}
                    onChange={(e) => setCosts({ ...costs, meal: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  其他费用
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-auxiliary">¥</span>
                  <input
                    type="number"
                    value={costs.other}
                    onChange={(e) => setCosts({ ...costs, other: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg border-2 border-gray-100 bg-gray-50 p-4">
              <div>
                <p className="text-sm text-auxiliary">实际费用合计</p>
                <p className={`font-mono text-2xl font-bold ${isOverBudget ? 'text-danger' : 'text-primary'}`}>
                  ¥{totalActual.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-auxiliary">
                  预算: ¥{application.total_cost.toLocaleString()}
                </p>
                {isOverBudget && (
                  <p className="text-sm font-medium text-danger">
                    超支 ¥{overAmount.toLocaleString()}
                  </p>
                )}
                {!isOverBudget && totalActual > 0 && (
                  <p className="text-sm font-medium text-success">
                    节约 ¥{(application.total_cost - totalActual).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {isOverBudget && (
              <div className="mt-5 rounded-lg border-2 border-danger-200 bg-danger-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-danger">
                  超出预算说明
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full rounded-lg border border-danger-300 p-3 text-sm outline-none focus:border-danger"
                  rows={3}
                  placeholder="请详细说明超出预算 ¥{overAmount.toLocaleString()} 的原因..."
                  required
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting || totalActual === 0}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交报销'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
