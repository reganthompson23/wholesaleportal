import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import CustomerFormModal from './CustomerFormModal'

interface Customer {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  address: string
  state: string
  postcode: string
  country: string
  created_at: string
  updated_at: string
}

export default function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('business_name')

      if (error) throw error

      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (customer?: Customer) => {
    setEditingCustomer(customer)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setEditingCustomer(undefined)
    setShowModal(false)
  }

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            ...customerData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCustomer.id)

        if (error) throw error

        setCustomers(prev =>
          prev.map(c => (c.id === editingCustomer.id ? { ...c, ...customerData } : c))
        )
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            ...customerData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error

        setCustomers(prev => [...prev, data])
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Failed to save customer')
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCustomers(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer')
    }
  }

  const filteredCustomers = customers.filter(customer => 
    customer.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-4">Loading customers...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email/Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{customer.business_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.contact_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {customer.state}, {customer.country}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(customer)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
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
        <CustomerFormModal
          customer={editingCustomer}
          onClose={handleCloseModal}
          onSave={handleSaveCustomer}
        />
      )}
    </div>
  )
}
