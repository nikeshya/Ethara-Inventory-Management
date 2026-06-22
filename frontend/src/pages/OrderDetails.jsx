
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePrinter, HiOutlineTrash, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api';

import StatusBadge from '../components/Common/StatusBadge';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useApp } from '../context/AppContext';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDashboardStats } = useApp();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        navigate('/orders');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order deleted successfully');
      fetchDashboardStats();
      navigate('/orders');
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/orders" className="p-2 text-[#565959] hover:text-[#0f1111] hover:bg-[#f3f3f3] rounded-lg transition-colors">
            <HiOutlineArrowLeft className="text-xl" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#0f1111] tracking-tight">Order #{order.id.toString().padStart(4, '0')}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-[#565959] mt-1">Placed on {new Date(order.order_date).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
            <HiOutlinePrinter className="text-lg" />
            <span className="hidden sm:inline">Print Invoice</span>
          </button>
          <button onClick={() => setIsDeleteOpen(true)} className="btn-danger flex items-center gap-2">
            <HiOutlineTrash className="text-lg" />
            <span className="hidden sm:inline">Delete Order</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-dark-border bg-[#f3f3f3]">
              <h2 className="text-lg font-bold text-[#0f1111]">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-[#0f1111]">
                <thead className="text-xs text-[#565959] uppercase bg-[#f3f3f3] border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Product</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Price</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Qty</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f8f9fa] bg-white transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0f1111]">{item.product_name}</div>
                        <div className="text-xs text-[#565959]">{item.product_sku}</div>
                      </td>
                      <td className="px-6 py-4 text-right">${item.unit_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#0f1111]">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#f3f3f3]">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-bold text-[#565959]">Total Amount</td>
                    <td className="px-6 py-4 text-right font-bold text-xl text-[#0f1111]">
                      ${order.total_amount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar - Customer Info */}
        <div className="space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-dark-border bg-[#f3f3f3]">
              <h2 className="text-lg font-bold text-[#0f1111]">Customer Details</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-bold text-[#565959] mb-1">Customer Name</p>
                <p className="text-base font-bold text-[#0f1111]">{order.customer_name || 'Unknown User'}</p>
              </div>
              
              {order.customer_email && (
                <div>
                  <p className="text-sm font-bold text-[#565959] mb-1">Email Address</p>
                  <div className="flex items-center gap-2 text-[#0f1111]">
                    <HiOutlineMail className="text-[#007185]" />
                    <a href={`mailto:${order.customer_email}`} className="hover:text-[#007185] transition-colors">
                      {order.customer_email}
                    </a>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-dark-border">
                <Link to="/customers" className="text-sm font-bold text-[#007185] hover:text-[#c7511f] transition-colors">
                  View Full Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => !isDeleting && setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete Order #${order.id.toString().padStart(4, '0')}? This action cannot be undone.`}
        confirmText="Delete Order"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default OrderDetails;
