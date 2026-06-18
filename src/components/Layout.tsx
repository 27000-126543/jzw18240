import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Plane,
  Receipt,
  BadgeDollarSign,
  BarChart3,
  Settings,
  Users,
  Route,
  Coins,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/store'

const navItems = [
  { label: '工作台', icon: LayoutDashboard, path: '/' },
  { label: '差旅申请', icon: FileText, path: '/applications' },
  { label: '差旅预订', icon: Plane, path: '/bookings' },
  { label: '差旅报销', icon: Receipt, path: '/reimbursements' },
  { label: '财务核销', icon: BadgeDollarSign, path: '/finance', role: 'finance' },
  { label: '数据报表', icon: BarChart3, path: '/reports' },
]

const adminItems = [
  { label: '用户管理', icon: Users, path: '/admin/users' },
  { label: '审批路线', icon: Route, path: '/admin/approval-routes' },
  { label: '补贴标准', icon: Coins, path: '/admin/subsidy-standards' },
]

const roleLabels: Record<string, string> = {
  employee: '员工',
  manager: '经理',
  finance: '财务',
  admin: '管理员',
  director: '总监',
}

const breadcrumbMap: Record<string, string> = {
  '/': '工作台',
  '/applications': '差旅申请',
  '/applications/new': '新建申请',
  '/bookings': '差旅预订',
  '/reimbursements': '差旅报销',
  '/reimbursements/new': '新建报销',
  '/finance': '财务核销',
  '/reports': '数据报表',
  '/admin/users': '用户管理',
  '/admin/approval-routes': '审批路线',
  '/admin/subsidy-standards': '补贴标准',
}

export default function Layout() {
  const currentUser = useStore((s) => s.currentUser)
  const location = useLocation()
  const pathParts = location.pathname.split('/').filter(Boolean)

  const breadcrumbs = []
  let currentPath = ''
  for (const part of pathParts) {
    currentPath += '/' + part
    const label = breadcrumbMap[currentPath]
    if (label) {
      breadcrumbs.push({ label, path: currentPath })
    } else if (!isNaN(Number(part))) {
      breadcrumbs.push({ label: part, path: currentPath })
    } else {
      breadcrumbs.push({ label: part, path: currentPath })
    }
  }

  const isAdmin = currentUser?.role === 'admin'

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-60 flex-shrink-0 flex-col bg-primary text-white">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">差旅管理</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems
            .filter((item) => !item.role || currentUser?.role === item.role)
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-primary-600" />
              <div className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-primary-300">
                <Settings className="mb-1 mr-1 inline h-4 w-4" />
                系统管理
              </div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-primary-600 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-300 text-sm font-bold text-primary">
              {currentUser?.name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{currentUser?.name || '未登录'}</p>
              <span className="inline-block rounded bg-primary-700 px-1.5 py-0.5 text-xs text-primary-200">
                {currentUser ? roleLabels[currentUser.role] || currentUser.role : ''}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-1 text-sm text-auxiliary">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                <span className={index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : ''}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
