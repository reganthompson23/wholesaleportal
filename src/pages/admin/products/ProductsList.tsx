import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import ProductFormModal from './ProductFormModal'
import ImageGalleryModal from '../../../components/ImageGalleryModal'

interface Product {
  id: string
  title: string
  sku: string
  unit_price: number
  description: string
  stock_status: string
  stock_quantity: number
  is_available: boolean
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .order('title')

      if (error) throw error

      // Sort the images by display_order
      const productsWithSortedImages = data?.map(product => ({
        ...product,
        images: (product.images || []).sort((a, b) => a.display_order - b.display_order)
      })) || []

      setProducts(productsWithSortedImages)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setEditingProduct(undefined)
    setShowModal(false)
  }

  const handleSaveProduct = async (
    productData: Omit<Product, 'id'>, 
    images: File[],
    imageOrder: ProductImage[]
  ) => {
    try {
      if (editingProduct) {
        // Update product details
        const { error: productError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (productError) throw productError

        // Update image orders - simplified version
        for (const [index, image] of imageOrder.entries()) {
          const { error } = await supabase
            .from('product_images')
            .update({ display_order: index })
            .eq('id', image.id)
          
          if (error) throw error
        }

        // Handle new image uploads
        if (images.length > 0) {
          const startOrder = imageOrder.length
          for (let i = 0; i < images.length; i++) {
            const file = images[i]
            const fileExt = file.name.split('.').pop()
            const fileName = `${editingProduct.id}/${Date.now()}-${i}.${fileExt}`

            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName)

            const { error: dbError } = await supabase
              .from('product_images')
              .insert([{
                product_id: editingProduct.id,
                image_url: publicUrl,
                display_order: startOrder + i,
                created_at: new Date().toISOString()
              }])

            if (dbError) throw dbError
          }
        }

        // Fetch updated product to ensure we have the latest data
        const { data: updatedProduct, error: fetchError } = await supabase
          .from('products')
          .select(`
            *,
            images:product_images(*)
          `)
          .eq('id', editingProduct.id)
          .single()

        if (fetchError) throw fetchError

        // Update local state with sorted images
        setProducts(prev =>
          prev.map(p => {
            if (p.id === editingProduct.id) {
              return {
                ...updatedProduct,
                images: (updatedProduct.images || []).sort((a, b) => a.display_order - b.display_order)
              }
            }
            return p
          })
        )
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error
        if (!data) throw new Error('No data returned from insert')
        
        setProducts(prev => [...prev, data])
      }

      // Handle new image uploads if there are any
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${editingProduct?.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError, data } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          const { error: dbError } = await supabase
            .from('product_images')
            .insert([{
              product_id: editingProduct?.id,
              image_url: publicUrl,
              display_order: imageOrder.length + i,
              created_at: new Date().toISOString()
            }]);

          if (dbError) throw dbError;
        }
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading products...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.images && product.images.length > 0 && (
                    <img 
                      src={product.images[0].image_url} 
                      alt="" 
                      className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-75"
                      onClick={() => setSelectedProduct(product)}
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${product.unit_price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.stock_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.is_available ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}

      {/* Image Gallery Modal */}
      {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 && (
        <ImageGalleryModal
          images={selectedProduct.images}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
