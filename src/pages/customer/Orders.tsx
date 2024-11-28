import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Order {
  id: string
  display_id: number
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
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  useEffect(() => {
    fetchOrders()
  }, [user.id])

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            unit_price,
            product:products (
              title
            )
          )
        `)
        .eq('customer_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedOrders = ordersData.map(order => ({
        id: order.id,
        display_id: order.display_id,
        created_at: order.created_at,
        total: order.total,
        status: order.status,
        shipping_address: order.shipping_address,
        items: order.order_items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          product_title: item.product.title
        }))
      }))

      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

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
              <div 
                className="px-6 py-4 border-b border-gray-200 bg-gray-50 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Order #{order.display_id.toString().padStart(5, '0')}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {format(new Date(order.created_at), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {expandedOrders.includes(order.id) ? 
                      <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    }
                  </div>
                </div>
              </div>

              {expandedOrders.includes(order.id) && (
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
