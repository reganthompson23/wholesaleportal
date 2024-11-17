import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'

interface Order {
  id: string
  created_at: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  shipping_address: string
  items: {
    product_id: string
    quantity: number
    unit_price: number
    product_title: string
  }[]
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Later we'll fetch from Supabase
    setOrders([
      {
        id: '1',
        created_at: new Date().toISOString(),
        total: 89.97,
        status: 'pending',
        shipping_address: '123 Main St, City, State, 12345',
        items: [
          {
            product_id: '1',
            quantity: 2,
            unit_price: 29.99,
            product_title: 'Product 1'
          },
          {
            product_id: '2',
            quantity: 1,
            unit_price: 39.99,
            product_title: 'Product 2'
          }
        ]
      }
    ])
    setLoading(false)
  }, [user.id])

  if (loading) {
    return <div>Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {format(new Date(order.created_at), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.product_title}</h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.quantity * item.unit_price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center font-medium">
                    <p>Total</p>
                    <p>${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600">{order.shipping_address}</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Later we'll implement reordering
                    console.log('Reorder items from order:', order.id)
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Reorder Items
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
