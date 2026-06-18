import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import type { Reimbursement } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Search, Eye } from 'lucide-react'

const statusTabs = [
  { label: '全部', value: '' },
  { label: '待核销', value: 'pending' },
  { label: '已核销', value: 'settled' },
]

interface ReimbursementPage {
  items: Reimbursement[]
  total: number
}

export default function ReimbursementList() {
  const navigate = useNavigate()
  const fetchApi = useStore((s) => s.fetchApi)
  const [data, setData] = useState<ReimbursementPage>({ items: [], total: 0 })
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (status) params.set('status', status)
    fetchApi<ReimbursementPage>(`/api/reimbursements?${params.toString()}`)
      .then(setData)
      .catch(() => {})
  }, [status, page, fetchApi])

  const totalPages = Math.ceil(data.total / pageSize)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">差旅报销</h1>
        <button
          onClick={() => navigate('/reimbursements/new/0')}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          提交报销
        </button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3">
          <div className="flex gap-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatus(tab.value); setPage(1) }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  status === tab.value
                    ? 'bg-primary text-white'
                    : 'text-auxiliary hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-auxiliary">
                <th className="px-4 py-3 font-medium">报销编号</th>
                <th className="px-4 py-3 font-medium">关联申请</th>
                <th className="px-4 py-3 font-medium">实际费用</th>
                <th className="px-4 py-3 font-medium">补贴金额</th>
                <th className="px-4 py-3 font-medium">超预算说明</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-auxiliary">
                    <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    暂无数据
                  </td>
                </tr>
              ) : (
                data.items.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">REI-{String(r.id).padStart(4, '0')}</td>
                    <td className="px-4 py-3 font-mono">APP-{String(r.application_id).padStart(4, '0')}</td>
                    <td className="px-4 py-3 font-mono font-medium text-primary">
                      ¥{r.total_actual.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-success">
                      ¥{r.subsidy_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-auxiliary">
                      {r.over_budget_explanation || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/reimbursements/${r.id}`)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-primary hover:bg-primary-50"
                      >
                        <Eye className="h-4 w-4" /> 查看
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-sm text-auxiliary">共 {data.total} 条记录</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded px-3 py-1 text-sm ${
                    p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
