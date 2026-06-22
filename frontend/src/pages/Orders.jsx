import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiPlus, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import api from '../services/api';

import DataTable from '../components/Common/DataTable';
import Modal from '../components/Common/Modal';
import StatusBadge from '../components/Common/StatusBadge';
import { useApp } from '../context/AppContext';

const Orders = () => {
  const { fetchDashboardStats } = useApp();
  
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Form resources
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Pagination & Search
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      customer_id: '',
      items: [{ product_id: '', quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Watch form fields for dynamic total calculation
  const watchItems = watch("items");

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders', {
        params: { page, page_size: pageSize, search: searchTerm, status: statusFilter }
      });
      setOrders(response.data.items);
      setTotal(response.data.total_pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchOrders]);

  // Fetch Customers & Products for dropdowns
  const fetchResources = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers', { params: { page_size: 100 } }),
        api.get('/products', { params: { page_size: 100 } })
      ]);
      setCustomers(custRes.data.items);
      setProducts(prodRes.data.items);
    } catch (error) {
      console.error('Failed to load resources', error);
    }
  };

  // Handlers
  const handleAdd = () => {
    fetchResources();
    reset({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
    setIsFormOpen(true);
  };

  // Submit form
  const onSubmit = async (data) => {
    // Transform string IDs to numbers
    const payload = {
      customer_id: parseInt(data.customer_id, 10),
      items: data.items.map(item => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10)
      }))
    };

    setIsSubmitting(true);
    try {
      await api.post('/orders', payload);
      toast.success('Order created successfully');
      setIsFormOpen(false);
      fetchOrders();
      fetchDashboardStats();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate dynamic total
  const calculateTotal = () => {
    if (!products.length || !watchItems) return 0;
    let total = 0;
    watchItems.forEach(item => {
      if (item.product_id && item.quantity) {
        const product = products.find(p => p.id === parseInt(item.product_id, 10));
        if (product) {
          total += product.price * parseInt(item.quantity, 10);
        }
      }
    });
    return total;
  };

  // Table Columns
  const columns = [
    { header: 'Order ID', accessor: 'id', cell: (row) => (
      <Link to={`/orders/${row.id}`} className="font-bold text-[#007185] hover:text-[#c7511f]">
        #{row.id.toString().padStart(4, '0')}
      </Link>
    ) },
    { header: 'Customer', accessor: 'customer_name', cell: (row) => (
      <div>
        <div className="font-bold text-[#0f1111]">{row.customer_name || 'Unknown'}</div>
        <div className="text-xs text-[#565959]">{row.customer_email || ''}</div>
      </div>
    ) },
    { header: 'Date', accessor: 'order_date', cell: (row) => <span className="text-[#0f1111]">{new Date(row.order_date).toLocaleString()}</span> },
    { header: 'Items', accessor: 'items_count', cell: (row) => <span className="text-[#565959]">{row.items_count} items</span> },
    { header: 'Total', accessor: 'total_amount', cell: (row) => <span className="font-bold text-[#0f1111]">${row.total_amount.toFixed(2)}</span> },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Actions', accessor: 'actions', cell: (row) => (
      <div className="flex items-center gap-3">
        <Link to={`/orders/${row.id}`} className="text-[#565959] hover:text-[#007185] transition-colors">
          <HiOutlineEye className="text-lg" />
        </Link>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1111] tracking-tight">Orders</h1>
          <p className="text-sm text-[#565959] mt-1">Manage customer orders and track fulfillment status.</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <HiPlus className="text-lg" />
          <span>Create Order</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="form-input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        page={page}
        totalPages={total}
        onPageChange={setPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search orders by customer name..."
      />

      {/* Create Order Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title="Create New Order"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <label className="form-label">Select Customer *</label>
            <select 
              className="form-input" 
              {...register('customer_id', { required: 'Customer is required' })}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
              ))}
            </select>
            {errors.customer_id && <p className="text-red-400 text-xs mt-1">{errors.customer_id.message}</p>}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-dark-border pb-2">
              <label className="form-label mb-0">Order Items *</label>
              <button 
                type="button" 
                onClick={() => append({ product_id: '', quantity: 1 })}
                className="text-xs text-[#007185] hover:text-[#c7511f] font-bold"
              >
                + Add Item
              </button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start bg-[#f3f3f3] p-3 rounded-lg border border-dark-border">
                <div className="flex-1 space-y-1">
                  <select 
                    className="form-input text-sm" 
                    {...register(`items.${index}.product_id`, { required: 'Product required' })}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                        {p.name} - ${p.price.toFixed(2)} (Stock: {p.stock_quantity})
                      </option>
                    ))}
                  </select>
                  {errors?.items?.[index]?.product_id && <p className="text-red-400 text-xs">{errors.items[index].product_id.message}</p>}
                </div>
                
                <div className="w-24 space-y-1">
                  <input 
                    type="number" 
                    min="1"
                    className="form-input text-sm" 
                    {...register(`items.${index}.quantity`, { 
                      required: 'Required', 
                      valueAsNumber: true,
                      min: { value: 1, message: 'Min 1' } 
                    })} 
                  />
                  {errors?.items?.[index]?.quantity && <p className="text-red-400 text-xs">{errors.items[index].quantity.message}</p>}
                </div>
                
                <button 
                  type="button" 
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length === 1}
                  className="p-2 text-gray-500 hover:text-red-400 disabled:opacity-30 mt-0.5"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            ))}
            {errors.items && !Array.isArray(errors.items) && <p className="text-red-400 text-xs mt-1">{errors.items.message}</p>}
          </div>

          <div className="bg-[#f3f3f3] p-4 rounded-lg border border-dark-border flex justify-between items-center">
            <span className="text-[#565959] font-bold">Estimated Total:</span>
            <span className="text-xl font-bold text-[#0f1111]">${calculateTotal().toFixed(2)}</span>
          </div>
          
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-dark-border">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;
