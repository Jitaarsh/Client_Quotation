import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './landing/pages/LandingPage'
import Register from './landing/pages/Register'
import Login from './landing/pages/Login'
import Quotations from './landing/pages/Quotations'
import Pricing from './landing/pages/Pricing'
import Customers from './landing/pages/Customers'
import DemoQuotation from './landing/pages/DemoQuotation'
import Navbar from './landing/components/Navbar'
import Dashboard from './pages/company/Dashboard'
import CustomerDirectory from './pages/company/customers/CustomerDirectory'
import AddCustomer from './pages/company/customers/AddCustomer'
import EditCustomer from './pages/company/customers/EditCustomer'
import BulkUploadCustomers from './pages/company/customers/BulkUploadCustomers'
import ProductDirectory from './pages/company/products/ProductDirectory'
import AddProduct from './pages/company/products/AddProduct'
import EditProduct from './pages/company/products/EditProduct'
import BulkUploadProducts from './pages/company/products/BulkUploadProducts'
import QuotationFormat from './pages/company/quotations/QuotationFormat'
import CreateQuotation from './pages/company/createQuote/CreateQuotation'
import QuotationPreviewPage from './pages/company/createQuote/QuotationPreviewPage'
import EditQuotationTemplate from './pages/company/editQuotation/EditQuotationTemplate'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import HelpCenter from './pages/company/helpCenter/HelpCenter'
import TicketDetails from './pages/company/helpCenter/TicketDetails'
import Profile from './pages/company/profile/Profile'
import CreateInvoice from './pages/company/invoice/CreateInvoice'
import Invoices from './pages/company/invoice/Invoices'
import ManageInquiries from './pages/company/inquire/ManageInquiries'
import CompanyDashboard from './pages/company/company-dashboard/CompanyDashboard'
import TermsAndConditions from './pages/company/terms-conditions/TermsAndConditions'
import AdminDashboardLayout from './pages/admin/admin-dashboard/AdminDashboardLayout'
import AdminDashboardOverview from './pages/admin/admin-dashboard/AdminDashboardOverview'
import PricingSetup from './pages/admin/pricing-setup/PricingSetup'
import PricingPlanForm from './pages/admin/pricing-setup/PricingPlanForm'
import CompaniesManagement from './pages/admin/companies/CompaniesManagement'
import EditCompany from './pages/admin/companies/EditCompany'
import TicketManagement from './pages/admin/tickets/TicketManagement'
import SystemSettings from './pages/admin/system-settings/SystemSettings'
import AdminProfile from './pages/admin/profile/AdminProfile'
import SelectCustomers from './components/SelectCustomers'
import AdminTicketDetails from './pages/admin/tickets/AdminTicketDetails'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import SharedQuotationPage from './pages/public/SharedQuotationPage'
import { Toaster } from 'react-hot-toast'
import useCurrentUser from './hooks/useCurrentUser'

const App = () => {
  useCurrentUser()

  // Global catch for internal browser/extension errors that are out of app control
  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      if (
        event.reason && 
        event.reason.message && 
        (event.reason.message.includes('A listener indicated an asynchronous response by returning true') ||
         event.reason.message.includes('message channel closed'))
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/shared-quotation/:id" element={<SharedQuotationPage />} />

        {/* Public Landing/Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/account" element={<Customers />} />
                <Route path="/demo" element={<DemoQuotation />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Display_customers" element={<SelectCustomers />} />
                {/* Redirect any other public root paths to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          } />
        </Route>

        {/* Admin Dashboard Routes - Protected */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
            <Route index element={<AdminDashboardOverview />} />
            <Route path="companies" element={<CompaniesManagement />} />
            <Route path="companies/edit/:id" element={<EditCompany />} />
            <Route path="pricing-setup" element={<PricingSetup />} />
            <Route path="pricing-setup/new" element={<PricingPlanForm />} />
            <Route path="pricing-setup/edit/:id" element={<PricingPlanForm />} />
            <Route path="tickets" element={<TicketManagement />} />
            <Route path="tickets/:id" element={<AdminTicketDetails />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>

          {/* Company Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<CompanyDashboard />} />
            <Route path="customers" element={<CustomerDirectory />} />
            <Route path="customers/add" element={<AddCustomer />} />
            <Route path="customers/edit/:id" element={<EditCustomer />} />
            <Route path="customers/bulk" element={<BulkUploadCustomers />} />
            <Route path="products" element={<ProductDirectory />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="products/bulk" element={<BulkUploadProducts />} />
            <Route path="quotation-format" element={<QuotationFormat />} />
            <Route path="create-quotation" element={<CreateQuotation />} />
            <Route path="edit-quotation/:id" element={<CreateQuotation />} />
            <Route path="quotation-preview/:id?" element={<QuotationPreviewPage />} />
            <Route path="edit-template/:id" element={<EditQuotationTemplate />} />
            <Route path="help-center" element={<HelpCenter />} />
            <Route path="help-center/:id" element={<TicketDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="invoice" element={<CreateInvoice />} />
            <Route path="invoice/edit/:id" element={<CreateInvoice />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="inquiries" element={<ManageInquiries />} />
            <Route path="company-overview" element={<CompanyDashboard />} />
            <Route path="terms" element={<TermsAndConditions />} />
          </Route>
        </Route>

        {/* Global Catch-all: Redirect to landing or dashboard depending on auth */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
