import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Switch } from '@headlessui/react'

// Temporary mock data - will replace with Supabase later
const mockProducts = [
  {
    id: '1',
    title: 'Product 1',
    sku: 'SKU001',
    unit_price: 29.99,
    description: 'Product 1 description',
    stock_status: 'in_stock',
    stock_quantity: 100,
    is_available: true
  },
  // ... other products
]

export default function ProductsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [products, setProducts] = useState(mockProducts)

  const toggleAvailability = (productId: string) => {
    setProducts(currentProducts => 
      currentProducts.map(product => 
        product.id === productId 
          ? { ...product, is_available: !product.is_available }
          : product
      )
    )
    console.log('Toggle availability for product:', productId)
  }

  const updateStockStatus = (productId: string, status: 'in_stock' | 'low_stock') => {
    setProducts(currentProducts => 
      currentProducts.map(product => 
        product.id === productId 
          ? { ...product, stock_status: status }
          : product
      )
    )
    console.log('Update stock status:', productId, status)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
          />
        </div>
        <select className="border rounded-lg px-4 py-2">
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.stock_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={product.stock_status}
                    onChange={(e) => updateStockStatus(product.id, e.target.value as 'in_stock' | 'low_stock')}
                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Switch
                    checked={product.is_available}
                    onChange={() => toggleAvailability(product.id)}
                    className={`${
                      product.is_available ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        product.is_available ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        console.log('Delete product:', product.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false)
            setEditingProduct(null)
          }}
          onSave={(productData) => {
            console.log('Save product:', productData)
            setShowAddModal(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

// Product Modal Component
function ProductModal({ product, onClose, onSave }: any) {
  const [formData, setFormData] = useState(product || {
    title: '',
    sku: '',
    unit_price: '',
    description: '',
    stock_quantity: '',
    stock_status: 'in_stock'
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <form onSubmit={(e) => {
          e.preventDefault()
          onSave(formData)
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.stock_status}
              onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
