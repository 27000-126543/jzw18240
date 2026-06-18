export interface User {
  id: number
  name: string
  email: string
  role: string
  rank: string
  department: string
  created_at: string
}

export interface Application {
  id: number
  user_id: number
  user_name?: string
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
  approvals?: ApprovalWithApprover[]
  bookings?: Booking[]
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

export interface ApprovalWithApprover extends Approval {
  approver_name: string
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
  destination?: string
  city?: string
  user_name?: string
  application?: Application
  bookings?: Booking[]
}

export interface ApprovalRoute {
  id: number
  name: string
  min_amount: number
  max_amount: number | null
  rank: string
  steps?: ApprovalRouteStep[]
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
  rates?: SubsidyRate[]
}

export interface SubsidyRate {
  id: number
  standard_id: number
  category: string
  daily_amount: number
}

export interface Flight {
  id: string
  flight_no: string
  airline: string
  origin: string
  destination: string
  date: string
  departure_time: string
  arrival_time: string
  duration: string
  price: number
  cabin: string
  seats_remaining: number
}

export interface Hotel {
  id: string
  name: string
  city: string
  location: string
  stars: number
  price_per_night: number
  total_price: number
  nights: number
  rating: string
  room_type: string
  amenities: string[]
  availability: number
}

export interface ReportData {
  summary: {
    year: number
    month: number
    total_applications: number
    total_budget: number
    total_actual: number
    total_subsidy: number
    pending_count: number
    approved_count: number
    rejected_count: number
  }
  by_department: {
    department: string
    count: number
    total_budget: number
    total_actual: number
    total_subsidy: number
  }[]
  by_destination: {
    city: string
    count: number
    total_budget: number
    total_actual: number
    total_subsidy: number
  }[]
  trend: {
    month: string
    fullMonth: string
    applications: number
    budget: number
    actual: number
  }[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
