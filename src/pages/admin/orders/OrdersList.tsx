import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Search, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import ProductSelectorModal from './ProductSelectorModal'
import { supabase } from '../../../lib/supabase'

interface Order {
  id: string
  display_id: number
  created_at: string
  total: number
  status: 'new' | 'invoiced' | 'dispatched'
  payment_status: 'unpaid' | 'paid'
  customer: {
    business_name: string
    contact_name: string
    email: string
    phone: string
    address: string
  }
  internal_notes: string
  items: {
    id: string
    product_id: string
    product_title: string
    quantity: number
    unit_price: number
  }[]
  shipping_cost: number
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [showProductSelector, setShowProductSelector] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<Order['status'] | 'all'>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<Order['payment_status'] | 'all'>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Force token refresh
      await supabase.auth.refreshSession()
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user and role:', user)

      // Add this to check the raw JWT token
      const { data: { session } } = await supabase.auth.getSession()
      console.log('JWT token:', session?.access_token)

      console.log('Fetching orders...')
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers (
            business_name,
            contact_name,
            email,
            phone,
            address
          ),
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            product:products (
              title
            )
          )
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      console.log('Raw orders data:', ordersData)

      if (error) throw error

      const transformedOrders = ordersData.map(order => ({
        id: order.id,
        display_id: order.display_id,
        created_at: order.created_at,
        total: order.total,
        status: order.status || 'new',  // Add default value
        payment_status: order.payment_status || 'unpaid',  // Add default value
        shipping_cost: order.shipping_cost || 0,
        internal_notes: order.internal_notes || '',
        customer: {
          business_name: order.customer?.business_name || 'Unknown',
          contact_name: order.customer?.contact_name || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
          address: order.customer?.address || ''
        },
        items: order.order_items?.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_title: item.product?.title || 'Unknown Product',
          quantity: item.quantity || 0,
          unit_price: item.unit_price || 0
        })) || []
      }))

      console.log('Transformed orders:', transformedOrders)
      setOrders(transformedOrders)

      // Add this to check if orders are set
      console.log('Orders state after setting:', orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search and status filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.business_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    
    const matchesOrderStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter

    return matchesSearch && matchesOrderStatus && matchesPaymentStatus
  })

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(currentOrders =>
        currentOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      )
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const updatePaymentStatus = async (orderId: string, newStatus: Order['payment_status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(currentOrders =>
        currentOrders.map(order =>
          order.id === orderId
            ? { ...order, payment_status: newStatus }
            : order
        )
      )
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }

  const updateInternalNotes = async (orderId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ internal_notes: notes })
        .eq('id', orderId)

      if (error) throw error

      setOrders(currentOrders =>
        currentOrders.map(order =>
          order.id === orderId
            ? { ...order, internal_notes: notes }
            : order
        )
      )
      setEditingNotes(null)
    } catch (error) {
      console.error('Error updating internal notes:', error)
    }
  }

  const updateShippingCost = async (orderId: string, cost: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ shipping_cost: cost })
        .eq('id', orderId)

      if (error) throw error

      setOrders(currentOrders =>
        currentOrders.map(order =>
          order.id === orderId
            ? { ...order, shipping_cost: cost }
            : order
        )
      )
    } catch (error) {
      console.error('Error updating shipping cost:', error)
    }
  }

  const calculateOrderTotal = (order: Order) => {
    const itemsTotal = order.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    )
    return itemsTotal + (order.shipping_cost || 0)
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(current => 
      current.includes(orderId) 
        ? current.filter(id => id !== orderId)
        : [...current, orderId]
    )
  }

  const updateOrderItem = (orderId: string, itemId: string, updates: Partial<Order['items'][0]>) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map(item =>
                item.id === itemId
                  ? { ...item, ...updates }
                  : item
              )
            }
          : order
      )
    )
    // Later we'll update in Supabase
    console.log('Update order item:', orderId, itemId, updates)
  }

  const deleteOrderItem = (orderId: string, itemId: string) => {
    if (!confirm('Are you sure you want to remove this item from the order?')) return

    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.filter(item => item.id !== itemId)
            }
          : order
      )
    )
    // Later we'll update in Supabase
    console.log('Delete order item:', orderId, itemId)
  }

  const addProductToOrder = (orderId: string, product: { id: string, title: string, price: number }) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: [...order.items, {
                id: Date.now().toString(),
                product_id: product.id,
                product_title: product.title,
                quantity: 1,
                unit_price: product.price
              }]
            }
          : order
      )
    )
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to hide this order? It will be removed from view but stored in the database.')) {
      return
    }

    try {
      console.log('Before update:', await supabase
        .from('orders')
        .select('id, is_deleted')
        .eq('id', orderId)
        .single()
      )
      
      // More explicit update query
      const { data, error } = await supabase.rpc('mark_order_as_deleted', {
        order_id: orderId
      })

      console.log('Update response:', { data, error })

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      // Check the result
      console.log('After update:', await supabase
        .from('orders')
        .select('id, is_deleted')
        .eq('id', orderId)
        .single()
      )

      setOrders(currentOrders => 
        currentOrders.filter(order => order.id !== orderId)
      )

    } catch (error) {
      console.error('Error in delete process:', error)
      alert('Failed to delete order. Please try again.')
    }
  }

  if (loading) {
    return <div>Loading orders...</div>
  }

  console.log('Filtered orders:', filteredOrders)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders Management</h1>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
            />
          </div>

          {/* Order Status Filter */}
          <div>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value as Order['status'] | 'all')}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="all">All Order Statuses</option>
              <option value="new">New</option>
              <option value="invoiced">Invoiced</option>
              <option value="dispatched">Dispatched</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as Order['payment_status'] | 'all')}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="all">All Payment Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header Section - Always Visible */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium">
                    <span className="text-gray-500">#{order.display_id?.toString().padStart(5, '0') || order.id.slice(0, 8)}</span> • {order.customer.business_name}
                  </h3>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Order Status */}
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="invoiced">Invoiced</option>
                    <option value="dispatched">Dispatched</option>
                  </select>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${order.status === 'dispatched' ? 'bg-green-100 text-green-800' :
                      order.status === 'invoiced' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>

                  {/* Payment Status */}
                  <select
                    value={order.payment_status}
                    onChange={(e) => updatePaymentStatus(order.id, e.target.value as Order['payment_status'])}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'}`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>

                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Delete Order"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Summary Info - Always Visible */}
              <div className="mt-2 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>{format(new Date(order.created_at), 'PPP')}</p>
                  <p>Contact: {order.customer.contact_name} ({order.customer.email})</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">Total: ${calculateOrderTotal(order).toFixed(2)}</div>
                    {order.shipping_cost > 0 && (
                      <div className="text-sm text-gray-500">
                        (includes ${order.shipping_cost.toFixed(2)} shipping)
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <span>Details</span>
                    {expandedOrders.includes(order.id) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable Details Section */}
            {expandedOrders.includes(order.id) && (
              <div className="px-6 py-4">
                {/* Order Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Order Items</h4>
                    <button
                      onClick={() => {
                        setEditingOrderId(order.id)
                        setShowProductSelector(true)
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Item
                    </button>
                  </div>

                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                      {/* Product Title - Left Side */}
                      <div className="flex-1 min-w-0 mr-4">
                        <h5 className="font-medium truncate">{item.product_title}</h5>
                      </div>

                      {/* Controls - Right Side */}
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(
                              order.id,
                              item.id,
                              { quantity: parseInt(e.target.value) || 1 }
                            )}
                            className="w-16 border rounded-md shadow-sm p-1 text-center"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">$</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateOrderItem(
                              order.id,
                              item.id,
                              { unit_price: parseFloat(e.target.value) || 0 }
                            )}
                            className="w-24 border rounded-md shadow-sm p-1 text-right"
                          />
                        </div>

                        <div className="w-24 text-right font-medium">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </div>

                        <button
                          onClick={() => deleteOrderItem(order.id, item.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Totals Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-end space-y-2">
                      <div className="w-64">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Subtotal</span>
                          <span>${order.items.reduce((sum, item) => 
                            sum + (item.quantity * item.unit_price), 0
                          ).toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <label className="text-gray-600" htmlFor={`shipping-${order.id}`}>
                            Shipping Cost
                          </label>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-600">$</span>
                            <input
                              id={`shipping-${order.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={order.shipping_cost || ''}
                              onChange={(e) => updateShippingCost(order.id, parseFloat(e.target.value) || 0)}
                              className="w-20 border rounded-md shadow-sm p-1 text-right"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t font-medium">
                          <span>Total</span>
                          <span>${calculateOrderTotal(order).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600">{order.customer.address}</p>
                </div>

                {/* Internal Notes */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-2">Internal Notes</h4>
                  {editingNotes === order.id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full border rounded-md shadow-sm p-2"
                        rows={3}
                        defaultValue={order.internal_notes}
                        onBlur={(e) => updateInternalNotes(order.id, e.target.value)}
                      />
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingNotes(order.id)}
                      className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      {order.internal_notes || 'Click to add internal notes...'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showProductSelector && editingOrderId && (
        <ProductSelectorModal
          onClose={() => setShowProductSelector(false)}
          onSelectProduct={(product) => {
            addProductToOrder(editingOrderId, product)
            setShowProductSelector(false)
          }}
        />
      )}
    </div>
  )
}
