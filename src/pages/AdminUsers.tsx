import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import type { User } from '@/types'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'

const roleLabels: Record<string, string> = { employee: '员工', manager: '经理', finance: '财务', admin: '管理员' }
const roleColors: Record<string, string> = {
  employee: 'bg-blue-100 text-blue-700',
  manager: 'bg-purple-100 text-purple-700',
  finance: 'bg-amber-100 text-amber-700',
  admin: 'bg-red-100 text-red-700',
}
const rankLabels: Record<string, string> = { junior: '初级', senior: '高级', director: '总监', vp: '副总裁' }
const roleOptions = [
  { value: 'employee', label: '员工' },
  { value: 'manager', label: '经理' },
  { value: 'finance', label: '财务' },
  { value: 'admin', label: '管理员' },
]
const rankOptions = [
  { value: 'junior', label: '初级' },
  { value: 'senior', label: '高级' },
  { value: 'director', label: '总监' },
  { value: 'vp', label: '副总裁' },
]

interface UserForm {
  name: string
  email: string
  role: string
  rank: string
  department: string
}

const emptyForm: UserForm = { name: '', email: '', role: 'employee', rank: 'junior', department: '' }

export default function AdminUsers() {
  const fetchApi = useStore((s) => s.fetchApi)
  const [users, setUsers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)

  const fetchUsers = () => {
    fetchApi<User[]>('/api/admin/users').then((data) => setUsers(Array.isArray(data) ? data : [])).catch(() => {})
  }

  useEffect(() => { fetchUsers() }, [fetchApi])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (user: User) => {
    setEditingId(user.id)
    setForm({ name: user.name, email: user.email, role: user.role, rank: user.rank, department: user.department })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await fetchApi(`/api/admin/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
      } else {
        await fetchApi('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      }
      setShowModal(false)
      fetchUsers()
    } catch { void 0 }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchApi(`/api/admin/users/${id}`, { method: 'DELETE' })
      fetchUsers()
    } catch { void 0 }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">用户管理</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> 添加用户
        </button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-auxiliary">
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium">邮箱</th>
                <th className="px-4 py-3 font-medium">角色</th>
                <th className="px-4 py-3 font-medium">职级</th>
                <th className="px-4 py-3 font-medium">部门</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-auxiliary">
                    <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" /> 暂无数据
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-auxiliary">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{rankLabels[u.rank] || u.rank}</td>
                    <td className="px-4 py-3">{u.department}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="flex items-center gap-1 rounded px-2 py-1 text-primary hover:bg-primary-50">
                          <Edit2 className="h-3.5 w-3.5" /> 编辑
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="flex items-center gap-1 rounded px-2 py-1 text-danger hover:bg-danger-50">
                          <Trash2 className="h-3.5 w-3.5" /> 删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? '编辑用户' : '添加用户'}</h2>
              <button onClick={() => setShowModal(false)} className="text-auxiliary hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-auxiliary">姓名</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-auxiliary">邮箱</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-auxiliary">角色</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-auxiliary">职级</label>
                <select
                  value={form.rank}
                  onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {rankOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-auxiliary">部门</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  {editingId ? '保存' : '添加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
