import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/products" className="font-bold text-xl">
                Wholesale Portal Admin
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/admin/products"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/admin/products'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Products
                </Link>
                <Link
                  to="/admin/orders"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/admin/orders'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  to="/admin/customers"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/admin/customers'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Customers
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
