import { useState } from 'react'
import { ShoppingCart, X, Trash2 } from 'lucide-react'
import Checkout from './Checkout'

// Temporary mock data until we connect to Supabase
const mockProducts = [
  {
    id: '1',
    title: 'Product 1',
    sku: 'SKU001',
    unit_price: 29.99,
    description: 'Product 1 description',
    stock_status: 'in_stock',
    stock_quantity: 100,
    is_available: true,
  },
  {
    id: '2',
    title: 'Product 2',
    sku: 'SKU002',
    unit_price: 39.99,
    description: 'Product 2 description',
    stock_status: 'low_stock',
    stock_quantity: 50,
    is_available: true,
  },
]

export default function Products() {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState(false)

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      delete newCart[productId]
      return newCart
    })
  }

  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = mockProducts.find(p => p.id === productId)
    return total + (product?.unit_price || 0) * quantity
  }, 0)

  const handleCheckoutComplete = () => {
    setCart({})
    setCheckoutMode(false)
    setIsCartOpen(false)
  }

  const availableProducts = mockProducts.filter(product => product.is_available)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ShoppingCart size={20} />
          <span>View Cart ({Object.values(cart).reduce((a, b) => a + b, 0)} items)</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {availableProducts.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.title}</div>
                  <div className="text-sm text-gray-500">{product.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${product.unit_price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${product.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' : 
                      product.stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {product.stock_status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(product.id, (cart[product.id] || 0) - 1)}
                      className="px-2 py-1 border rounded"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={cart[product.id] || 0}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border rounded text-center"
                    />
                    <button 
                      onClick={() => updateQuantity(product.id, (cart[product.id] || 0) + 1)}
                      className="px-2 py-1 border rounded"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cart Slide-over */}
      <div className={`fixed inset-0 overflow-hidden ${isCartOpen ? '' : 'pointer-events-none'}`}>
        {/* Dark overlay */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${
            isCartOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => {
            setIsCartOpen(false)
            setCheckoutMode(false)
          }}
        />
        
        {/* Slide-over panel */}
        <div className={`absolute inset-y-0 right-0 max-w-full flex transform transition-transform ease-in-out duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {checkoutMode ? 'Checkout' : 'Shopping Cart'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCartOpen(false)
                      setCheckoutMode(false)
                    }}
                    className="ml-3 h-7 flex items-center"
                  >
                    <X size={24} className="text-gray-400 hover:text-gray-500" />
                  </button>
                </div>
              </div>

              {checkoutMode ? (
                <Checkout
                  cart={cart}
                  products={mockProducts}
                  onClose={() => setCheckoutMode(false)}
                  onCheckoutComplete={handleCheckoutComplete}
                />
              ) : (
                <>
                  {/* Cart items */}
                  <div className="flex-1 py-6 px-4 sm:px-6 overflow-y-auto">
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = mockProducts.find(p => p.id === productId)
                      if (!product || quantity === 0) return null
                      
                      return (
                        <div key={productId} className="flex items-center py-4 border-b">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium">{product.title}</h3>
                            <p className="text-sm text-gray-500">{product.sku}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => updateQuantity(productId, quantity - 1)}
                                className="px-2 py-1 border rounded hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{quantity}</span>
                              <button 
                                onClick={() => updateQuantity(productId, quantity + 1)}
                                className="px-2 py-1 border rounded hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            <div className="w-20 text-right">
                              ${(product.unit_price * quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeFromCart(productId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Cart footer */}
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>${cartTotal.toFixed(2)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping calculated at checkout.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setCheckoutMode(true)}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}