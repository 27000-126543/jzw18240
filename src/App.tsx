import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import ApplicationList from '@/pages/ApplicationList'
import ApplicationDetail from '@/pages/ApplicationDetail'
import NewApplication from '@/pages/NewApplication'
import Bookings from '@/pages/Bookings'
import ReimbursementList from '@/pages/ReimbursementList'
import NewReimbursement from '@/pages/NewReimbursement'
import ReimbursementDetail from '@/pages/ReimbursementDetail'
import Finance from '@/pages/Finance'
import Reports from '@/pages/Reports'
import AdminUsers from '@/pages/AdminUsers'
import AdminApprovalRoutes from '@/pages/AdminApprovalRoutes'
import AdminSubsidyStandards from '@/pages/AdminSubsidyStandards'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationList />} />
          <Route path="/applications/new" element={<NewApplication />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/reimbursements" element={<ReimbursementList />} />
          <Route path="/reimbursements/new/:applicationId" element={<NewReimbursement />} />
          <Route path="/reimbursements/:id" element={<ReimbursementDetail />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/approval-routes" element={<AdminApprovalRoutes />} />
          <Route path="/admin/subsidy-standards" element={<AdminSubsidyStandards />} />
        </Route>
      </Routes>
    </Router>
  )
}
