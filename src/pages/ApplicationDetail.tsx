import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import type { Application, ApprovalWithApprover, Booking } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { MapPin, Calendar, FileText, CheckCircle, XCircle, Clock, Receipt, Plane } from 'lucide-react'

interface ApplicationDetail extends Application {
  approvals: ApprovalWithApprover[]
  bookings: Booking[]
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fetchApi = useStore((s) => s.fetchApi)
  const currentUser = useStore((s) => s.currentUser)
  const [detail, setDetail] = useState<ApplicationDetail | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchApi<ApplicationDetail>(`/api/applications/${id}`).then(setDetail).catch(() => {})
  }, [id, fetchApi])

  if (!detail) {
    return <div className="py-20 text-center text-auxiliary">加载中...</div>
  }

  const pendingApprovals = detail.approvals?.filter((a) => a.status === 'pending') || []
  const currentStep = pendingApprovals.length > 0
    ? Math.min(...pendingApprovals.map((a) => a.step_order))
    : null
  const isCurrentApprover = currentStep !== null && pendingApprovals.some(
    (a) => a.step_order === currentStep && a.approver_id === currentUser?.id
  )
  const hasReimbursement = false

  const handleApprove = async (status: string) => {
    if (!id || !currentUser) return
    setSubmitting(true)
    try {
      await fetchApi(`/api/applications/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ approver_id: currentUser.id, status, comment }),
      })
      const updated = await fetchApi<ApplicationDetail>(`/api/applications/${id}`)
      setDetail(updated)
      setComment('')
    } catch {
      void 0
    } finally {
      setSubmitting(false)
    }
  }

  const costRows = [
    { label: '交通费', value: detail.transport_cost },
    { label: '住宿费', value: detail.accommodation_cost },
    { label: '餐饮费', value: detail.meal_cost },
    { label: '其他费用', value: detail.other_cost },
  ]

  const stepStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="h-5 w-5 text-success" />
    if (status === 'rejected') return <XCircle className="h-5 w-5 text-danger" />
    return <Clock className="h-5 w-5 text-amber-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">申请详情</h1>
          <StatusBadge status={detail.status} />
        </div>
        {detail.status === 'approved' && !hasReimbursement && (
          <button
            onClick={() => navigate(`/reimbursements/new/${detail.id}`)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-600"
          >
            <Receipt className="h-4 w-4" />
            提交报销
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">申请信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-auxiliary" />
                <div>
                  <p className="text-xs text-auxiliary">目的地</p>
                  <p className="font-medium">{detail.destination}（{detail.city}）</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-auxiliary" />
                <div>
                  <p className="text-xs text-auxiliary">出行日期</p>
                  <p className="font-mono font-medium">{detail.departure_date} ~ {detail.return_date}（{detail.days}天）</p>
                </div>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <FileText className="mt-0.5 h-4 w-4 text-auxiliary" />
                <div>
                  <p className="text-xs text-auxiliary">出差事由</p>
                  <p className="font-medium">{detail.purpose}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">预估费用</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-auxiliary">
                  <th className="pb-2 font-medium">费用项目</th>
                  <th className="pb-2 text-right font-medium">金额（元）</th>
                </tr>
              </thead>
              <tbody>
                {costRows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-50">
                    <td className="py-2.5">{row.label}</td>
                    <td className="py-2.5 text-right font-mono">¥{row.value.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2.5">合计</td>
                  <td className="py-2.5 text-right font-mono text-primary">¥{detail.total_cost.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {isCurrentApprover && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">审批操作</h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请输入审批意见..."
                className="mb-4 w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-primary"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove('approved')}
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-success-600 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  通过
                </button>
                <button
                  onClick={() => handleApprove('rejected')}
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-danger-600 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  驳回
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">审批流程</h2>
            <div className="space-y-0">
              {detail.approvals?.map((approval, idx) => (
                <div key={approval.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {stepStatusIcon(approval.status)}
                    {idx < (detail.approvals?.length || 0) - 1 && (
                      <div className="h-8 w-px bg-gray-200" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{approval.approver_name}</p>
                    <p className="text-xs text-auxiliary">
                      第{approval.step_order}步 · <StatusBadge status={approval.status} />
                    </p>
                    {approval.comment && (
                      <p className="mt-1 text-xs text-gray-500">{approval.comment}</p>
                    )}
                    {approval.approved_at && (
                      <p className="text-xs text-auxiliary">{approval.approved_at.slice(0, 16).replace('T', ' ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">关联预订</h2>
            {detail.bookings?.length === 0 ? (
              <p className="text-sm text-auxiliary">暂无预订记录</p>
            ) : (
              <div className="space-y-3">
                {detail.bookings?.map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center gap-2">
                      {booking.type === 'flight' ? (
                        <Plane className="h-4 w-4 text-primary" />
                      ) : (
                        <MapPin className="h-4 w-4 text-accent" />
                      )}
                      <span className="text-sm font-medium">{booking.reference_id}</span>
                    </div>
                    <p className="mt-1 text-xs text-auxiliary">{booking.detail}</p>
                    <p className="mt-1 font-mono text-sm font-medium text-primary">
                      ¥{booking.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
