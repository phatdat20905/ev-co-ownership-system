import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/auth'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Dashboard from '@/pages/dashboard/Index'
import Booking from '@/pages/booking/Index'
import Vehicle from '@/pages/vehicle/Index'
import Group from '@/pages/group/Index'
import Cost from '@/pages/cost/Index'
import Contract from '@/pages/contract/Index'
import Admin from '@/pages/admin/Index'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          <Route
            path="/login"
            element={
              <MainLayout>
                <Login />
              </MainLayout>
            }
          />
          <Route
            path="/register"
            element={
              <MainLayout>
                <Register />
              </MainLayout>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Booking />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicle"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Vehicle />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/group"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Group />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cost"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Cost />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contract"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Contract />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Admin />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
