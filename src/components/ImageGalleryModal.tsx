import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
}

interface Props {
  images: ProductImage[]
  onClose: () => void
}

export default function ImageGalleryModal({ images, onClose }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-[80vh] aspect-square mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 p-2.5 rounded-full z-10"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={images[currentImageIndex].image_url}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 p-2.5 rounded-full"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 p-2.5 rounded-full"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
