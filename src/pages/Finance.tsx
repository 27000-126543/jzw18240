import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import type { Reimbursement } from '@/types'
import { CheckSquare, Square, BadgeDollarSign, Search } from 'lucide-react'

export default function Finance() {
  const fetchApi = useStore((s) => s.fetchApi)
  const [list, setList] = useState<Reimbursement[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [settling, setSettling] = useState(false)

  const fetchData = () => {
    fetchApi<Reimbursement[]>('/api/finance/pending')
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
  }

  useEffect(() => { fetchData() }, [fetchApi])

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === list.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(list.map((r) => r.id)))
    }
  }

  const totalAmount = list
    .filter((r) => selected.has(r.id))
    .reduce((sum, r) => sum + r.total_actual, 0)

  const handleSettle = async () => {
    if (selected.size === 0) return
    setSettling(true)
    try {
      await fetchApi('/api/finance/settle', {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      setSelected(new Set())
      fetchData()
    } catch { void 0 }
    setSettling(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">财务核销</h1>

      <div className="flex gap-4">
        <div className="flex-1 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <BadgeDollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-auxiliary">待核销笔数</p>
              <p className="font-mono text-xl font-bold text-gray-900">{list.length}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <BadgeDollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-auxiliary">待核销总金额</p>
              <p className="font-mono text-xl font-bold text-primary">
                ¥{list.reduce((s, r) => s + r.total_actual, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-primary-50 px-4 py-3">
          <span className="text-sm text-primary">
            已选择 {selected.size} 项，合计 ¥{totalAmount.toLocaleString()}
          </span>
          <button
            onClick={handleSettle}
            disabled={settling}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <BadgeDollarSign className="h-4 w-4" />
            批量核销
          </button>
        </div>
      )}

      <div className="rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-auxiliary">
                <th className="px-4 py-3 font-medium">
                  <button onClick={toggleAll} className="text-primary">
                    {selected.size === list.length && list.length > 0
                      ? <CheckSquare className="h-4 w-4" />
                      : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">报销编号</th>
                <th className="px-4 py-3 font-medium">申请人</th>
                <th className="px-4 py-3 font-medium">目的地</th>
                <th className="px-4 py-3 font-medium">实际费用</th>
                <th className="px-4 py-3 font-medium">补贴金额</th>
                <th className="px-4 py-3 font-medium">申请日期</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-auxiliary">
                    <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    暂无待核销数据
                  </td>
                </tr>
              ) : (
                list.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(r.id)} className="text-primary">
                        {selected.has(r.id)
                          ? <CheckSquare className="h-4 w-4" />
                          : <Square className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-900">REI-{String(r.id).padStart(4, '0')}</td>
                    <td className="px-4 py-3">{r.user_name || '-'}</td>
                    <td className="px-4 py-3">{r.destination || '-'}</td>
                    <td className="px-4 py-3 font-mono font-medium text-primary">
                      ¥{r.total_actual.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-success">
                      ¥{r.subsidy_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-auxiliary">{r.created_at?.slice(0, 10) || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
