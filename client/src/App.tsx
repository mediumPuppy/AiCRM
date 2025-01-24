import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
// import { CompanyThemeProvider } from './components/providers/company-theme-provider'
import Dashboard from './components/pages/Dashboard'
import { DashboardLayout } from './components/layouts/DashboardLayout'
import Tickets from './components/pages/Tickets'
import Contacts from './components/pages/Contacts'
import ChatSessions from './components/pages/ChatSessions'
import { ModalProvider } from './components/providers/modal-provider'
import { CustomerLayout } from './components/layouts/CustomerLayout'
import CustomerChatSessions from './components/customer/pages/CustomerChatSessions'
import CustomerChatSessionDetail from './components/customer/pages/CustomerChatSessionDetail'
import { AdminLogin } from './components/auth/AdminLogin'
import { AdminSignup } from './components/auth/AdminSignup'
import { ClientLogin } from './components/auth/ClientLogin'
import { ClientSignup } from './components/auth/ClientSignup'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { UnauthorizedPage } from './components/auth/UnauthorizedPage'

function App() {
  const ChatSessionDetailWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    return (
      <CustomerChatSessionDetail 
        sessionId={parseInt(id || '0')} 
        onClose={() => navigate('/customer/chat/sessions')} 
      />
    );
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/signup" element={<ClientSignup />} />

            {/* Protected dashboard routes */}
            <Route element={<DashboardLayout />}>
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tickets" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Tickets />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contacts" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Contacts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chats" 
                element={
                  <ProtectedRoute requireAdmin>
                    <ChatSessions />
                  </ProtectedRoute>
                } 
              />
              {/* Add other dashboard routes as they're created */}
            </Route>

            {/* Protected customer portal routes */}
            <Route element={<CustomerLayout />}>
              <Route 
                path="/customer/chat/sessions" 
                element={
                  <ProtectedRoute>
                    <CustomerChatSessions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/chat/sessions/:id" 
                element={
                  <ProtectedRoute>
                    <ChatSessionDetailWrapper />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Redirect root to appropriate dashboard based on user type */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />

            {/* Catch unauthorized access */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Catch all other routes - redirect to login */}
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
