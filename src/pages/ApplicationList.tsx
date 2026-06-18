import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import type { Application, PaginatedResponse } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Search, Eye } from 'lucide-react'

const statusTabs = [
  { label: '全部', value: '' },
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

const departments = ['技术部', '市场部', '财务部', '行政部']

export default function ApplicationList() {
  const navigate = useNavigate()
  const fetchApi = useStore((s) => s.fetchApi)
  const [data, setData] = useState<PaginatedResponse<Application>>({ items: [], total: 0, page: 1, pageSize: 10 })
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (department) params.set('department', department)
    params.set('page', String(page))
    params.set('pageSize', '10')
    fetchApi<PaginatedResponse<Application>>(`/api/applications?${params.toString()}`)
      .then(setData)
      .catch(() => {})
  }, [status, department, page, fetchApi])

  const totalPages = Math.ceil(data.total / data.pageSize)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">差旅申请</h1>
        <button
          onClick={() => navigate('/applications/new')}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          新建申请
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
          <div className="relative ml-auto">
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 outline-none focus:border-primary"
            >
              <option value="">全部部门</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-auxiliary">
                <th className="px-4 py-3 font-medium">申请编号</th>
                <th className="px-4 py-3 font-medium">申请人</th>
                <th className="px-4 py-3 font-medium">目的地</th>
                <th className="px-4 py-3 font-medium">出行日期</th>
                <th className="px-4 py-3 font-medium">预估费用</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-auxiliary">
                    <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    暂无数据
                  </td>
                </tr>
              ) : (
                data.items.map((app) => (
                  <tr key={app.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">APP-{String(app.id).padStart(4, '0')}</td>
                    <td className="px-4 py-3">{app.user_name}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{app.destination}</span>
                      <span className="ml-1 text-auxiliary">({app.city})</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">
                      {app.departure_date} ~ {app.return_date}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-primary">
                      ¥{app.total_cost.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-auxiliary">
                      {app.created_at.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-primary hover:bg-primary-50"
                      >
                        <Eye className="h-4 w-4" />
                        查看
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
            <span className="text-sm text-auxiliary">
              共 {data.total} 条记录
            </span>
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
                    p === page
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
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
