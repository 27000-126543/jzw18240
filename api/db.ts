export interface User {
  id: number
  name: string
  email: string
  password: string
  role: string
  rank: string
  department: string
  created_at: string
}

export interface Application {
  id: number
  user_id: number
  destination: string
  city: string
  departure_date: string
  return_date: string
  purpose: string
  transport_cost: number
  accommodation_cost: number
  meal_cost: number
  other_cost: number
  total_cost: number
  status: string
  days: number
  created_at: string
  updated_at: string
}

export interface Approval {
  id: number
  application_id: number
  approver_id: number
  step_order: number
  status: string
  comment: string
  approved_at: string | null
  created_at: string
}

export interface Booking {
  id: number
  application_id: number
  type: string
  reference_id: string
  detail: string
  amount: number
  booked_at: string
}

export interface Reimbursement {
  id: number
  application_id: number
  transport_actual: number
  accommodation_actual: number
  meal_actual: number
  other_actual: number
  total_actual: number
  subsidy_amount: number
  over_budget_explanation: string
  status: string
  settled_at: string | null
  created_at: string
}

export interface ApprovalRoute {
  id: number
  name: string
  min_amount: number
  max_amount: number | null
  rank: string
}

export interface ApprovalRouteStep {
  id: number
  route_id: number
  step_order: number
  approver_role: string
}

export interface SubsidyStandard {
  id: number
  city: string
  city_tier: string
}

export interface SubsidyRate {
  id: number
  standard_id: number
  category: string
  daily_amount: number
}

let nextUserId = 7
let nextApplicationId = 6
let nextApprovalId = 10
let nextBookingId = 4
let nextReimbursementId = 3
let nextApprovalRouteId = 4
let nextApprovalRouteStepId = 7
let nextSubsidyStandardId = 9
let nextSubsidyRateId = 25

const users: User[] = [
  { id: 1, name: '张伟', email: 'zhangwei@company.com', password: '123456', role: 'employee', rank: 'junior', department: '技术部', created_at: '2025-01-15T08:00:00Z' },
  { id: 2, name: '李娜', email: 'lina@company.com', password: '123456', role: 'manager', rank: 'senior', department: '技术部', created_at: '2025-01-15T08:00:00Z' },
  { id: 3, name: '王强', email: 'wangqiang@company.com', password: '123456', role: 'finance', rank: 'senior', department: '财务部', created_at: '2025-01-15T08:00:00Z' },
  { id: 4, name: '赵敏', email: 'zhaomin@company.com', password: '123456', role: 'admin', rank: 'director', department: '行政部', created_at: '2025-01-15T08:00:00Z' },
  { id: 5, name: '刘洋', email: 'liuyang@company.com', password: '123456', role: 'employee', rank: 'senior', department: '市场部', created_at: '2025-01-15T08:00:00Z' },
  { id: 6, name: '陈静', email: 'chenjing@company.com', password: '123456', role: 'manager', rank: 'director', department: '市场部', created_at: '2025-01-15T08:00:00Z' },
]

const applications: Application[] = [
  {
    id: 1, user_id: 1, destination: '北京总部', city: '北京',
    departure_date: '2025-03-10', return_date: '2025-03-12', purpose: '参加年度技术峰会',
    transport_cost: 2000, accommodation_cost: 1500, meal_cost: 300, other_cost: 200, total_cost: 4000,
    status: 'approved', days: 3, created_at: '2025-03-01T09:00:00Z', updated_at: '2025-03-02T14:30:00Z',
  },
  {
    id: 2, user_id: 5, destination: '上海分公司', city: '上海',
    departure_date: '2025-03-15', return_date: '2025-03-19', purpose: '市场推广活动',
    transport_cost: 3000, accommodation_cost: 4000, meal_cost: 800, other_cost: 500, total_cost: 8300,
    status: 'approved', days: 5, created_at: '2025-03-05T10:00:00Z', updated_at: '2025-03-07T11:20:00Z',
  },
  {
    id: 3, user_id: 1, destination: '深圳客户现场', city: '深圳',
    departure_date: '2025-04-01', return_date: '2025-04-03', purpose: '客户系统部署',
    transport_cost: 2500, accommodation_cost: 1200, meal_cost: 240, other_cost: 300, total_cost: 4240,
    status: 'pending', days: 3, created_at: '2025-03-20T08:30:00Z', updated_at: '2025-03-20T08:30:00Z',
  },
  {
    id: 4, user_id: 5, destination: '成都办事处', city: '成都',
    departure_date: '2025-03-25', return_date: '2025-03-28', purpose: '区域市场调研',
    transport_cost: 1800, accommodation_cost: 2100, meal_cost: 280, other_cost: 500, total_cost: 4680,
    status: 'rejected', days: 4, created_at: '2025-03-10T11:00:00Z', updated_at: '2025-03-12T16:00:00Z',
  },
  {
    id: 5, user_id: 1, destination: '广州项目验收', city: '广州',
    departure_date: '2025-04-10', return_date: '2025-04-14', purpose: '项目终验交付',
    transport_cost: 2800, accommodation_cost: 3200, meal_cost: 400, other_cost: 600, total_cost: 7000,
    status: 'approved', days: 5, created_at: '2025-03-25T09:15:00Z', updated_at: '2025-03-28T10:00:00Z',
  },
]

const approvals: Approval[] = [
  { id: 1, application_id: 1, approver_id: 2, step_order: 1, status: 'approved', comment: '同意', approved_at: '2025-03-02T10:00:00Z', created_at: '2025-03-01T09:00:00Z' },
  { id: 2, application_id: 2, approver_id: 6, step_order: 1, status: 'approved', comment: '同意，注意控制费用', approved_at: '2025-03-06T09:00:00Z', created_at: '2025-03-05T10:00:00Z' },
  { id: 3, application_id: 2, approver_id: 4, step_order: 2, status: 'approved', comment: '批准', approved_at: '2025-03-07T11:20:00Z', created_at: '2025-03-05T10:00:00Z' },
  { id: 4, application_id: 3, approver_id: 2, step_order: 1, status: 'pending', comment: '', approved_at: null, created_at: '2025-03-20T08:30:00Z' },
  { id: 5, application_id: 4, approver_id: 6, step_order: 1, status: 'rejected', comment: '预算不合理，请重新评估', approved_at: '2025-03-12T16:00:00Z', created_at: '2025-03-10T11:00:00Z' },
  { id: 6, application_id: 5, approver_id: 2, step_order: 1, status: 'approved', comment: '同意', approved_at: '2025-03-26T09:00:00Z', created_at: '2025-03-25T09:15:00Z' },
  { id: 7, application_id: 5, approver_id: 4, step_order: 2, status: 'approved', comment: '批准', approved_at: '2025-03-28T10:00:00Z', created_at: '2025-03-25T09:15:00Z' },
  { id: 8, application_id: 5, approver_id: 4, step_order: 3, status: 'pending', comment: '', approved_at: null, created_at: '2025-03-25T09:15:00Z' },
  { id: 9, application_id: 5, approver_id: 2, step_order: 3, status: 'pending', comment: '', approved_at: null, created_at: '2025-03-25T09:15:00Z' },
]

const bookings: Booking[] = [
  { id: 1, application_id: 1, type: 'flight', reference_id: 'CA1234', detail: '去程 北京-上海 08:00-10:30', amount: 1200, booked_at: '2025-03-02T15:00:00Z' },
  { id: 2, application_id: 1, type: 'flight', reference_id: 'CA5678', detail: '回程 上海-北京 18:00-20:30', amount: 1200, booked_at: '2025-03-02T15:01:00Z' },
  { id: 3, application_id: 5, type: 'hotel', reference_id: 'HTL-GZ001', detail: '广州天河希尔顿 标准间 4晚', amount: 2800, booked_at: '2025-03-28T11:00:00Z' },
]

const reimbursements: Reimbursement[] = [
  {
    id: 1, application_id: 1, transport_actual: 2100, accommodation_actual: 1600, meal_actual: 280, other_actual: 150,
    total_actual: 4130, subsidy_amount: 540, over_budget_explanation: '', status: 'settled',
    settled_at: '2025-03-15T10:00:00Z', created_at: '2025-03-13T09:00:00Z',
  },
  {
    id: 2, application_id: 2, transport_actual: 3200, accommodation_actual: 4200, meal_actual: 750, other_actual: 600,
    total_actual: 8750, subsidy_amount: 900, over_budget_explanation: '住宿超标因会议期间房源紧张', status: 'pending',
    settled_at: null, created_at: '2025-03-20T14:00:00Z',
  },
]

const approvalRoutes: ApprovalRoute[] = [
  { id: 1, name: '低额审批', min_amount: 0, max_amount: 5000, rank: 'junior' },
  { id: 2, name: '中额审批', min_amount: 5000, max_amount: 20000, rank: 'junior' },
  { id: 3, name: '高额审批', min_amount: 20000, max_amount: null, rank: 'junior' },
]

const approvalRouteSteps: ApprovalRouteStep[] = [
  { id: 1, route_id: 1, step_order: 1, approver_role: 'manager' },
  { id: 2, route_id: 2, step_order: 1, approver_role: 'manager' },
  { id: 3, route_id: 2, step_order: 2, approver_role: 'director' },
  { id: 4, route_id: 3, step_order: 1, approver_role: 'manager' },
  { id: 5, route_id: 3, step_order: 2, approver_role: 'director' },
  { id: 6, route_id: 3, step_order: 3, approver_role: 'vp' },
]

const subsidyStandards: SubsidyStandard[] = [
  { id: 1, city: '北京', city_tier: 'tier1' },
  { id: 2, city: '上海', city_tier: 'tier1' },
  { id: 3, city: '广州', city_tier: 'tier2' },
  { id: 4, city: '深圳', city_tier: 'tier2' },
  { id: 5, city: '成都', city_tier: 'tier2' },
  { id: 6, city: '杭州', city_tier: 'tier2' },
  { id: 7, city: '武汉', city_tier: 'tier3' },
  { id: 8, city: '西安', city_tier: 'tier3' },
]

const subsidyRates: SubsidyRate[] = [
  { id: 1, standard_id: 1, category: '住宿', daily_amount: 500 },
  { id: 2, standard_id: 1, category: '餐饮', daily_amount: 100 },
  { id: 3, standard_id: 1, category: '交通', daily_amount: 80 },
  { id: 4, standard_id: 2, category: '住宿', daily_amount: 500 },
  { id: 5, standard_id: 2, category: '餐饮', daily_amount: 100 },
  { id: 6, standard_id: 2, category: '交通', daily_amount: 80 },
  { id: 7, standard_id: 3, category: '住宿', daily_amount: 400 },
  { id: 8, standard_id: 3, category: '餐饮', daily_amount: 80 },
  { id: 9, standard_id: 3, category: '交通', daily_amount: 60 },
  { id: 10, standard_id: 4, category: '住宿', daily_amount: 400 },
  { id: 11, standard_id: 4, category: '餐饮', daily_amount: 80 },
  { id: 12, standard_id: 4, category: '交通', daily_amount: 60 },
  { id: 13, standard_id: 5, category: '住宿', daily_amount: 350 },
  { id: 14, standard_id: 5, category: '餐饮', daily_amount: 70 },
  { id: 15, standard_id: 5, category: '交通', daily_amount: 50 },
  { id: 16, standard_id: 6, category: '住宿', daily_amount: 350 },
  { id: 17, standard_id: 6, category: '餐饮', daily_amount: 70 },
  { id: 18, standard_id: 6, category: '交通', daily_amount: 50 },
  { id: 19, standard_id: 7, category: '住宿', daily_amount: 300 },
  { id: 20, standard_id: 7, category: '餐饮', daily_amount: 60 },
  { id: 21, standard_id: 7, category: '交通', daily_amount: 40 },
  { id: 22, standard_id: 8, category: '住宿', daily_amount: 300 },
  { id: 23, standard_id: 8, category: '餐饮', daily_amount: 60 },
  { id: 24, standard_id: 8, category: '交通', daily_amount: 40 },
]

export const db = {
  users: {
    findAll: () => [...users],
    findById: (id: number) => users.find(u => u.id === id) || null,
    findByEmail: (email: string) => users.find(u => u.email === email) || null,
    create: (data: Omit<User, 'id' | 'created_at'>) => {
      const user: User = { id: nextUserId++, ...data, created_at: new Date().toISOString() }
      users.push(user)
      return user
    },
    update: (id: number, data: Partial<User>) => {
      const idx = users.findIndex(u => u.id === id)
      if (idx === -1) return null
      users[idx] = { ...users[idx], ...data }
      return users[idx]
    },
  },
  applications: {
    findAll: () => [...applications],
    findById: (id: number) => applications.find(a => a.id === id) || null,
    findByUserId: (userId: number) => applications.filter(a => a.user_id === userId),
    findByStatus: (status: string) => applications.filter(a => a.status === status),
    create: (data: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => {
      const app: Application = { id: nextApplicationId++, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      applications.push(app)
      return app
    },
    update: (id: number, data: Partial<Application>) => {
      const idx = applications.findIndex(a => a.id === id)
      if (idx === -1) return null
      applications[idx] = { ...applications[idx], ...data, updated_at: new Date().toISOString() }
      return applications[idx]
    },
  },
  approvals: {
    findAll: () => [...approvals],
    findByApplicationId: (applicationId: number) => approvals.filter(a => a.application_id === applicationId),
    findPendingByApplicationId: (applicationId: number) => approvals.filter(a => a.application_id === applicationId && a.status === 'pending'),
    create: (data: Omit<Approval, 'id' | 'created_at'>) => {
      const approval: Approval = { id: nextApprovalId++, ...data, created_at: new Date().toISOString() }
      approvals.push(approval)
      return approval
    },
    update: (id: number, data: Partial<Approval>) => {
      const idx = approvals.findIndex(a => a.id === id)
      if (idx === -1) return null
      approvals[idx] = { ...approvals[idx], ...data }
      return approvals[idx]
    },
  },
  bookings: {
    findAll: () => [...bookings],
    findByApplicationId: (applicationId: number) => bookings.filter(b => b.application_id === applicationId),
    create: (data: Omit<Booking, 'id' | 'booked_at'>) => {
      const booking: Booking = { id: nextBookingId++, ...data, booked_at: new Date().toISOString() }
      bookings.push(booking)
      return booking
    },
  },
  reimbursements: {
    findAll: () => [...reimbursements],
    findById: (id: number) => reimbursements.find(r => r.id === id) || null,
    findByApplicationId: (applicationId: number) => reimbursements.find(r => r.application_id === applicationId) || null,
    findByStatus: (status: string) => reimbursements.filter(r => r.status === status),
    create: (data: Omit<Reimbursement, 'id' | 'created_at'>) => {
      const reimb: Reimbursement = { id: nextReimbursementId++, ...data, created_at: new Date().toISOString() }
      reimbursements.push(reimb)
      return reimb
    },
    update: (id: number, data: Partial<Reimbursement>) => {
      const idx = reimbursements.findIndex(r => r.id === id)
      if (idx === -1) return null
      reimbursements[idx] = { ...reimbursements[idx], ...data }
      return reimbursements[idx]
    },
  },
  approvalRoutes: {
    findAll: () => [...approvalRoutes],
    findById: (id: number) => approvalRoutes.find(r => r.id === id) || null,
    findMatchingRoute: (amount: number) => {
      return approvalRoutes.find(r => amount >= r.min_amount && (r.max_amount === null || amount < r.max_amount)) || null
    },
    update: (id: number, data: Partial<ApprovalRoute>) => {
      const idx = approvalRoutes.findIndex(r => r.id === id)
      if (idx === -1) return null
      approvalRoutes[idx] = { ...approvalRoutes[idx], ...data }
      return approvalRoutes[idx]
    },
  },
  approvalRouteSteps: {
    findByRouteId: (routeId: number) => approvalRouteSteps.filter(s => s.route_id === routeId),
  },
  subsidyStandards: {
    findAll: () => [...subsidyStandards],
    findById: (id: number) => subsidyStandards.find(s => s.id === id) || null,
    findByCity: (city: string) => subsidyStandards.find(s => s.city === city) || null,
    update: (id: number, data: Partial<SubsidyStandard>) => {
      const idx = subsidyStandards.findIndex(s => s.id === id)
      if (idx === -1) return null
      subsidyStandards[idx] = { ...subsidyStandards[idx], ...data }
      return subsidyStandards[idx]
    },
  },
  subsidyRates: {
    findByStandardId: (standardId: number) => subsidyRates.filter(r => r.standard_id === standardId),
    update: (id: number, data: Partial<SubsidyRate>) => {
      const idx = subsidyRates.findIndex(r => r.id === id)
      if (idx === -1) return null
      subsidyRates[idx] = { ...subsidyRates[idx], ...data }
      return subsidyRates[idx]
    },
  },
}
