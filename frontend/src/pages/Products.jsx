import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import api from '../services/api';

import DataTable from '../components/Common/DataTable';
import Modal from '../components/Common/Modal';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useApp } from '../context/AppContext';

const Products = () => {
  const { fetchDashboardStats } = useApp();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Pagination & Search
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: { page, page_size: pageSize, search: searchTerm }
      });
      setProducts(response.data.items);
      setTotal(response.data.total_pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  // Handlers
  const handleAdd = () => {
    setSelectedProduct(null);
    reset({ name: '', sku: '', price: '', stock_quantity: '', category: '', description: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    reset(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  // Submit form (Create / Update)
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, data);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data);
        toast.success('Product created successfully');
      }
      setIsFormOpen(false);
      fetchProducts();
      fetchDashboardStats(); // Update global stats
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      toast.success('Product deleted successfully');
      setIsDeleteOpen(false);
      fetchProducts();
      fetchDashboardStats(); // Update global stats
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns
  const columns = [
    { header: 'ID', accessor: 'id', cell: (row) => <span className="text-[#565959]">#{row.id}</span> },
    { header: 'Product', accessor: 'name', cell: (row) => (
      <div>
        <div className="font-bold text-[#0f1111]">{row.name}</div>
        <div className="text-xs text-[#565959]">{row.sku}</div>
      </div>
    ) },
    { header: 'Category', accessor: 'category', cell: (row) => row.category || '-' },
    { header: 'Price', accessor: 'price', cell: (row) => <span className="font-bold text-[#0f1111]">${row.price.toFixed(2)}</span> },
    { header: 'Stock', accessor: 'stock_quantity', cell: (row) => (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${row.stock_quantity <= 10 ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200' : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200'}`}>
        {row.stock_quantity}
      </span>
    ) },
    { header: 'Actions', accessor: 'actions', cell: (row) => (
      <div className="flex items-center gap-3">
        <button onClick={() => handleEdit(row)} className="text-[#565959] hover:text-[#007185] transition-colors">
          <HiOutlinePencil className="text-lg" />
        </button>
        <button onClick={() => handleDeleteClick(row)} className="text-[#565959] hover:text-red-600 transition-colors">
          <HiOutlineTrash className="text-lg" />
        </button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1111] tracking-tight">Products</h1>
          <p className="text-sm text-[#565959] mt-1">Manage your inventory products and stock levels.</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <HiPlus className="text-lg" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        page={page}
        totalPages={total}
        onPageChange={setPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search products by name or SKU..."
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="form-label">Product Name *</label>
              <input 
                type="text" 
                className="form-input" 
                {...register('name', { required: 'Name is required' })} 
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="form-label">SKU *</label>
              <input 
                type="text" 
                className="form-input uppercase" 
                {...register('sku', { required: 'SKU is required' })} 
              />
              {errors.sku && <p className="text-red-400 text-xs mt-1">{errors.sku.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="form-label">Price ($) *</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                className="form-input" 
                {...register('price', { required: 'Price is required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })} 
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="form-label">Stock Quantity *</label>
              <input 
                type="number" 
                min="0"
                className="form-input" 
                {...register('stock_quantity', { required: 'Stock is required', valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })} 
              />
              {errors.stock_quantity && <p className="text-red-400 text-xs mt-1">{errors.stock_quantity.message}</p>}
            </div>
            
            <div className="space-y-1 sm:col-span-2">
              <label className="form-label">Category</label>
              <input 
                type="text" 
                className="form-input" 
                {...register('category')} 
              />
            </div>
            
            <div className="space-y-1 sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea 
                rows={3}
                className="form-input resize-none" 
                {...register('description')} 
              />
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-dark-border">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => !isSubmitting && setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Products;
