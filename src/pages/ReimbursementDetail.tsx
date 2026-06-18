import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import type { Reimbursement } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { AlertTriangle } from 'lucide-react'

export default function ReimbursementDetail() {
  const { id } = useParams<{ id: string }>()
  const fetchApi = useStore((s) => s.fetchApi)
  const [reimbursement, setReimbursement] = useState<Reimbursement | null>(null)

  useEffect(() => {
    if (!id) return
    fetchApi<Reimbursement>(`/api/reimbursements/${id}`).then(setReimbursement).catch(() => {})
  }, [id, fetchApi])

  if (!reimbursement) return <div className="py-12 text-center text-auxiliary">加载中...</div>

  const app = reimbursement.application
  const isOverBudget = reimbursement.total_actual > (app?.total_cost || 0)
  const overAmount = isOverBudget ? reimbursement.total_actual - (app?.total_cost || 0) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">报销详情</h1>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-auxiliary">REI-{String(reimbursement.id).padStart(4, '0')}</span>
          <StatusBadge status={reimbursement.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">关联申请信息</h3>
          {app ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-auxiliary">申请编号</span>
                <span className="font-mono">APP-{String(app.id).padStart(4, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">目的地</span>
                <span className="font-medium">{app.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">出行日期</span>
                <span className="font-mono">{app.departure_date} ~ {app.return_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">出差天数</span>
                <span>{app.days} 天</span>
              </div>
              <div className="flex justify-between">
                <span className="text-auxiliary">事由</span>
                <span>{app.purpose}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-auxiliary">暂无关联申请信息</p>
          )}
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">费用对比</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-auxiliary">
                <th className="pb-2 font-medium">费用项</th>
                <th className="pb-2 font-medium">预估</th>
                <th className="pb-2 font-medium">实际</th>
                <th className="pb-2 font-medium">差额</th>
              </tr>
            </thead>
            <tbody>
              {([
                { label: '交通', estimated: app?.transport_cost || 0, actual: reimbursement.transport_actual },
                { label: '住宿', estimated: app?.accommodation_cost || 0, actual: reimbursement.accommodation_actual },
                { label: '餐饮', estimated: app?.meal_cost || 0, actual: reimbursement.meal_actual },
                { label: '其他', estimated: app?.other_cost || 0, actual: reimbursement.other_actual },
              ]).map((row) => (
                <tr key={row.label} className="border-b border-gray-50">
                  <td className="py-2">{row.label}</td>
                  <td className="py-2 font-mono">¥{row.estimated.toLocaleString()}</td>
                  <td className="py-2 font-mono">¥{row.actual.toLocaleString()}</td>
                  <td className={`py-2 font-mono ${row.actual > row.estimated ? 'text-danger' : 'text-success'}`}>
                    {row.actual > row.estimated ? '+' : ''}¥{(row.actual - row.estimated).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="font-medium">
                <td className="py-2">合计</td>
                <td className="py-2 font-mono">¥{(app?.total_cost || 0).toLocaleString()}</td>
                <td className="py-2 font-mono">¥{reimbursement.total_actual.toLocaleString()}</td>
                <td className={`py-2 font-mono ${isOverBudget ? 'text-danger' : 'text-success'}`}>
                  {overAmount > 0 ? '+' : ''}¥{(reimbursement.total_actual - (app?.total_cost || 0)).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">补贴明细</h3>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-auxiliary">补贴金额</p>
            <p className="font-mono text-2xl font-bold text-success">¥{reimbursement.subsidy_amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-auxiliary">实际费用</p>
            <p className="font-mono text-2xl font-bold text-primary">¥{reimbursement.total_actual.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-auxiliary">核销状态</p>
            <StatusBadge status={reimbursement.status} className="mt-1" />
          </div>
        </div>
      </div>

      {isOverBudget && reimbursement.over_budget_explanation && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-danger-700">
            <AlertTriangle className="h-4 w-4" />
            超预算说明（超出 ¥{overAmount.toLocaleString()}）
          </div>
          <p className="text-sm text-danger-600">{reimbursement.over_budget_explanation}</p>
        </div>
      )}
    </div>
  )
}
