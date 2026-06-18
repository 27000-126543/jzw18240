import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import type { ApprovalRoute } from '@/types'
import { Edit2, X, Route } from 'lucide-react'

const roleLabels: Record<string, string> = {
  employee: '员工', manager: '经理', finance: '财务', admin: '管理员', director: '总监',
}

export default function AdminApprovalRoutes() {
  const fetchApi = useStore((s) => s.fetchApi)
  const [routes, setRoutes] = useState<ApprovalRoute[]>([])
  const [editingRoute, setEditingRoute] = useState<ApprovalRoute | null>(null)
  const [form, setForm] = useState({ min_amount: '', max_amount: '' })

  const fetchRoutes = () => {
    fetchApi<ApprovalRoute[]>('/api/admin/approval-routes')
      .then((data) => setRoutes(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => { fetchRoutes() }, [fetchApi])

  const openEdit = (route: ApprovalRoute) => {
    setEditingRoute(route)
    setForm({
      min_amount: String(route.min_amount),
      max_amount: route.max_amount === null ? '' : String(route.max_amount),
    })
  }

  const handleSubmit = async () => {
    if (!editingRoute) return
    try {
      await fetchApi(`/api/admin/approval-routes/${editingRoute.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          min_amount: Number(form.min_amount) || 0,
          max_amount: form.max_amount ? Number(form.max_amount) : null,
        }),
      })
      setEditingRoute(null)
      fetchRoutes()
    } catch { void 0 }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">审批路由配置</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {routes.map((route) => (
          <div key={route.id} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <Route className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium text-gray-900">{route.name}</h3>
              </div>
              <button
                onClick={() => openEdit(route)}
                className="flex items-center gap-1 rounded px-2 py-1 text-primary hover:bg-primary-50"
              >
                <Edit2 className="h-3.5 w-3.5" /> 编辑
              </button>
            </div>
            <div className="mb-3 flex items-center gap-4 text-sm">
              <span className="text-auxiliary">金额范围：</span>
              <span className="font-mono font-medium text-primary">
                ¥{route.min_amount.toLocaleString()} ~ {route.max_amount !== null ? `¥${route.max_amount.toLocaleString()}` : '无上限'}
              </span>
            </div>
            {route.rank && (
              <div className="mb-3 text-sm">
                <span className="text-auxiliary">适用职级：</span>
                <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">{route.rank}</span>
              </div>
            )}
            {route.steps && route.steps.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-auxiliary">审批步骤</p>
                <div className="space-y-2">
                  {route.steps
                    .sort((a, b) => a.step_order - b.step_order)
                    .map((step) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                          {step.step_order}
                        </div>
                        <span className="text-sm text-gray-700">
                          {roleLabels[step.approver_role] || step.approver_role} 审批
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {routes.length === 0 && (
        <div className="py-12 text-center text-auxiliary">暂无审批路由数据</div>
      )}

      {editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">编辑审批路由</h2>
              <button onClick={() => setEditingRoute(null)} className="text-auxiliary hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-auxiliary">{editingRoute.name}</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-auxiliary">最低金额</label>
                <input
                  type="number"
                  value={form.min_amount}
                  onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-auxiliary">最高金额（留空表示无上限）</label>
                <input
                  type="number"
                  value={form.max_amount}
                  onChange={(e) => setForm({ ...form, max_amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingRoute(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
