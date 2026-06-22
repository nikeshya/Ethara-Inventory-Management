import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiPlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import api from '../services/api';

import DataTable from '../components/Common/DataTable';
import Modal from '../components/Common/Modal';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useApp } from '../context/AppContext';

const Customers = () => {
  const { fetchDashboardStats } = useApp();
  
  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Pagination & Search
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers', {
        params: { page, page_size: pageSize, search: searchTerm }
      });
      setCustomers(response.data.items);
      setTotal(response.data.total_pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchCustomers]);

  // Handlers
  const handleAdd = () => {
    setSelectedCustomer(null);
    reset({ full_name: '', email: '', phone: '', address: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    reset(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  // Submit form
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer.id}`, data);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', data);
        toast.success('Customer created successfully');
      }
      setIsFormOpen(false);
      fetchCustomers();
      fetchDashboardStats();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/customers/${selectedCustomer.id}`);
      toast.success('Customer deleted successfully');
      setIsDeleteOpen(false);
      fetchCustomers();
      fetchDashboardStats();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns
  const columns = [
    { header: 'ID', accessor: 'id', cell: (row) => <span className="text-[#565959]">#{row.id}</span> },
    { header: 'Customer Info', accessor: 'info', cell: (row) => (
      <div>
        <div className="font-bold text-[#0f1111]">{row.full_name}</div>
        <div className="text-xs text-[#565959] flex items-center gap-1 mt-0.5">
          <HiOutlineMail /> {row.email}
        </div>
      </div>
    ) },
    { header: 'Phone', accessor: 'phone', cell: (row) => (
      row.phone ? (
        <div className="flex items-center gap-1.5 text-[#0f1111]">
          <HiOutlinePhone className="text-[#565959]" />
          <span>{row.phone}</span>
        </div>
      ) : <span className="text-[#565959]">-</span>
    ) },
    { header: 'Address', accessor: 'address', cell: (row) => (
      <span className="text-[#565959] truncate max-w-[200px] block" title={row.address}>
        {row.address || '-'}
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
          <h1 className="text-2xl font-bold text-[#0f1111] tracking-tight">Customers</h1>
          <p className="text-sm text-[#565959] mt-1">Manage customer profiles and contact details.</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <HiPlus className="text-lg" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        page={page}
        totalPages={total}
        onPageChange={setPage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search customers by name, email, or phone..."
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="form-label">Full Name *</label>
            <input 
              type="text" 
              className="form-input" 
              {...register('full_name', { required: 'Name is required' })} 
            />
            {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              className="form-input" 
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
              })} 
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="form-label">Phone Number</label>
            <input 
              type="text" 
              className="form-input" 
              {...register('phone')} 
            />
          </div>
          
          <div className="space-y-1">
            <label className="form-label">Address</label>
            <textarea 
              rows={3}
              className="form-input resize-none" 
              {...register('address')} 
            />
          </div>
          
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-dark-border">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => !isSubmitting && setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${selectedCustomer?.full_name}"? This will also delete all their order history. This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Customers;
