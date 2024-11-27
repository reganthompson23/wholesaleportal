import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Product {
  id?: string
  title: string
  sku: string
  unit_price: number
  description: string
  stock_quantity: number
  is_available: boolean
}

interface Props {
  product?: Product
  onClose: () => void
  onSave: (productData: Omit<Product, 'id'>) => Promise<void>
}

export default function ProductFormModal({ product, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    title: '',
    sku: '',
    unit_price: 0,
    description: '',
    stock_quantity: 0,
    is_available: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        sku: product.sku,
        unit_price: product.unit_price,
        description: product.description,
        stock_quantity: product.stock_quantity,
        is_available: product.is_available,
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
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
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">Available for Purchase</label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
