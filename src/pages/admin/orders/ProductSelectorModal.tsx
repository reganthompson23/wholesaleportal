import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
}

interface Props {
  onClose: () => void
  onSelectProduct: (product: Product) => void
}

export default function ProductSelectorModal({ onClose, onSelectProduct }: Props) {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    // Later we'll fetch from Supabase
    setProducts([
      { id: '1', title: 'NATIVE VERSA FORK BLACK', price: 29.99 },
      { id: '2', title: 'VERSATYL DECK PURPLE', price: 39.99 },
      { id: '3', title: 'ETHIC ERAWAN DECK', price: 89.99 },
      // ... more products
    ])
  }, [])

  useEffect(() => {
    const searchLower = search.toLowerCase()
    setFilteredProducts(
      products.filter(product => {
        const titleLower = product.title.toLowerCase()
        // Check if letters appear in sequence anywhere in the title
        let index = 0
        for (const char of searchLower) {
          index = titleLower.indexOf(char, index)
          if (index === -1) return false
          index += 1
        }
        return true
      })
    )
  }, [search, products])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-h-[80vh] w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">Add Product to Order</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              autoFocus
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onSelectProduct(product)
                  onClose()
                }}
                className="w-full px-4 py-3 hover:bg-gray-50 flex justify-between items-center text-left"
              >
                <span className="font-medium">{product.title}</span>
                <span className="text-gray-600">${product.price.toFixed(2)}</span>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No products found matching "{search}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
