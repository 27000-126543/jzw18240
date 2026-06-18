import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import type { SubsidyStandard, SubsidyRate } from '@/types'
import { Edit2, X, Search } from 'lucide-react'

const tierLabels: Record<string, string> = { tier1: '一线', tier2: '二线', tier3: '三线' }
const tierColors: Record<string, string> = {
  tier1: 'bg-red-100 text-red-700',
  tier2: 'bg-amber-100 text-amber-700',
  tier3: 'bg-green-100 text-green-700',
}
const categoryLabels: Record<string, string> = { accommodation: '住宿', meal: '餐饮', transport: '交通' }

export default function AdminSubsidyStandards() {
  const fetchApi = useStore((s) => s.fetchApi)
  const [standards, setStandards] = useState<SubsidyStandard[]>([])
  const [editingStandard, setEditingStandard] = useState<SubsidyStandard | null>(null)
  const [rates, setRates] = useState<SubsidyRate[]>([])

  const fetchStandards = () => {
    fetchApi<SubsidyStandard[]>('/api/admin/subsidy-standards')
      .then((data) => setStandards(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => { fetchStandards() }, [fetchApi])

  const openEdit = (std: SubsidyStandard) => {
    setEditingStandard(std)
    setRates(std.rates?.length ? std.rates.map((r) => ({ ...r })) : [])
  }

  const updateRate = (id: number, amount: number) => {
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, daily_amount: amount } : r)))
  }

  const handleSubmit = async () => {
    if (!editingStandard) return
    try {
      await fetchApi(`/api/admin/subsidy-standards/${editingStandard.id}`, {
        method: 'PUT',
        body: JSON.stringify({ rates }),
      })
      setEditingStandard(null)
      fetchStandards()
    } catch { void 0 }
  }

  const getRate = (std: SubsidyStandard, category: string) => {
    return std.rates?.find((r) => r.category === category)?.daily_amount ?? 0
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">城市补贴标准</h1>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-auxiliary">
                <th className="px-4 py-3 font-medium">城市</th>
                <th className="px-4 py-3 font-medium">城市等级</th>
                <th className="px-4 py-3 font-medium">住宿（元/天）</th>
                <th className="px-4 py-3 font-medium">餐饮（元/天）</th>
                <th className="px-4 py-3 font-medium">交通（元/天）</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {standards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-auxiliary">
                    <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" /> 暂无数据
                  </td>
                </tr>
              ) : (
                standards.map((std) => (
                  <tr key={std.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{std.city}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[std.city_tier] || 'bg-gray-100 text-gray-600'}`}>
                        {tierLabels[std.city_tier] || std.city_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">¥{getRate(std, 'accommodation')}</td>
                    <td className="px-4 py-3 font-mono">¥{getRate(std, 'meal')}</td>
                    <td className="px-4 py-3 font-mono">¥{getRate(std, 'transport')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(std)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-primary hover:bg-primary-50"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> 编辑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingStandard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                编辑补贴标准 - {editingStandard.city}
              </h2>
              <button onClick={() => setEditingStandard(null)} className="text-auxiliary hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {rates.map((rate) => (
                <div key={rate.id}>
                  <label className="mb-1 block text-sm text-auxiliary">
                    {categoryLabels[rate.category] || rate.category}（元/天）
                  </label>
                  <input
                    type="number"
                    value={rate.daily_amount}
                    onChange={(e) => updateRate(rate.id, Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              ))}
              {rates.length === 0 && (
                <p className="text-sm text-auxiliary">暂无补贴费率</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingStandard(null)}
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
