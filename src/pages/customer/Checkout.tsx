import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface CheckoutProps {
  cart: Record<string, number>
  products: any[]
  onClose: () => void
  onCheckoutComplete: () => void
}

export default function Checkout({ cart, products, onClose, onCheckoutComplete }: CheckoutProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [shippingDetails, setShippingDetails] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    postcode: '',
    country: '',
    notes: ''
  })

  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === productId)
    return total + (product?.unit_price || 0) * quantity
  }, 0)

  const handleSubmitOrder = async () => {
    try {
      setLoading(true)
      
      // Debug: Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user)
      if (!user) {
        throw new Error('Not authenticated')
      }
      
      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'new',
          payment_status: 'unpaid',
          total: cartTotal,
          shipping_address: `${shippingDetails.businessName}\n${shippingDetails.contactName}\n${shippingDetails.email}\n${shippingDetails.phone}\n${shippingDetails.address}\n${shippingDetails.state} ${shippingDetails.postcode}\n${shippingDetails.country}`,
          internal_notes: shippingDetails.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Create order items
      const orderItems = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)
        if (!product) throw new Error(`Product ${productId} not found`)

        return {
          order_id: order.id,
          product_id: productId,
          quantity: quantity,
          unit_price: product.unit_price,
          created_at: new Date().toISOString()
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear the cart and navigate
      onCheckoutComplete()
      onClose()
      navigate('/orders')

    } catch (error) {
      console.error('Error:', error)
      alert('There was an error submitting your order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Order Summary */}
      <div className="flex-1 py-4 px-4 sm:px-6 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-900 mb-3">Order Summary</h3>
          {Object.entries(cart).map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId)
            if (!product || quantity === 0) return null
            
            return (
              <div key={productId} className="flex items-center py-4 border-b">
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{product.title}</h3>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                  <p className="text-sm text-gray-500">Qty: {quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${(product.unit_price * quantity).toFixed(2)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Checkout Form */}
        <div className="space-y-3">
          {/* Business Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={shippingDetails.businessName}
              onChange={(e) => setShippingDetails(prev => ({ ...prev, businessName: e.target.value }))}
              className="block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              value={shippingDetails.contactName}
              onChange={(e) => setShippingDetails(prev => ({ ...prev, contactName: e.target.value }))}
              className="block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={shippingDetails.email}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, email: e.target.value }))}
                className="block w-full border rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={shippingDetails.phone}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, phone: e.target.value }))}
                className="block w-full border rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>

          {/* Address Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={shippingDetails.address}
              onChange={(e) => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
              className="block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={shippingDetails.state}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, state: e.target.value }))}
                className="block w-full border rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode
              </label>
              <input
                type="text"
                value={shippingDetails.postcode}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, postcode: e.target.value }))}
                className="block w-full border rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={shippingDetails.country}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, country: e.target.value }))}
                className="block w-full border rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>

          {/* Order Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Notes (Optional)
            </label>
            <input
              type="text"
              value={shippingDetails.notes}
              onChange={(e) => setShippingDetails(prev => ({ ...prev, notes: e.target.value }))}
              className="block w-full border rounded-md shadow-sm p-2"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Total</p>
          <p>${cartTotal.toFixed(2)}</p>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">Shipping will be calculated after order submission.</p>
        <div className="mt-4">
          <button
            onClick={handleSubmitOrder}
            disabled={loading}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Submit Order'}
          </button>
        </div>
      </div>
    </>
  )
}
