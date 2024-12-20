import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/auth/Login'
import CustomerProducts from './pages/customer/Products'
import AdminProducts from './pages/admin/products/ProductsList'
import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './layouts/AdminLayout'
import Orders from './pages/customer/Orders'
import AdminOrders from './pages/admin/orders/OrdersList'
import CustomersList from './pages/admin/customers/CustomersList'

export default function AppRoutes() {
  const { user } = useAuth()
  const isAdmin = user?.email === 'regan@syndicatestore.com.au'

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Admin routes
  if (isAdmin) {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<CustomersList />} />
          <Route path="*" element={<Navigate to="/admin/products" replace />} />
        </Route>
      </Routes>
    )
  }

  // Customer routes
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/products" element={<CustomerProducts />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  )
}
