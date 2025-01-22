import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CompanyThemeProvider } from './components/providers/company-theme-provider'
import Dashboard from './components/pages/Dashboard'
import { DashboardLayout } from './components/layouts/DashboardLayout'
import Tickets from './components/pages/Tickets'
import { ModalProvider } from './components/providers/modal-provider'

function App() {
  return (
    <BrowserRouter>
      <CompanyThemeProvider>
        <ModalProvider>
          <Routes>
            {/* Dashboard routes - wrapped in DashboardLayout */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tickets" element={<Tickets />} />
              {/* Add other dashboard routes as you create them:
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/chats" element={<Chats />} /> 
              */}
            </Route>

            {/* Non-dashboard routes (if any) would go here */}
            {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/register" element={<Register />} /> */}
          </Routes>
        </ModalProvider>
      </CompanyThemeProvider>
    </BrowserRouter>
  )
}

export default App
