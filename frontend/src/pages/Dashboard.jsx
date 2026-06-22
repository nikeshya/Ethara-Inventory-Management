import React, { useEffect } from 'react';
import { 
  HiOutlineCube, 
  HiOutlineUsers, 
  HiOutlineShoppingCart, 
  HiOutlineExclamationCircle,
  HiOutlineCurrencyDollar 
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/Common/StatsCard';
import StatusBadge from '../components/Common/StatusBadge';

const Dashboard = () => {
  const { dashboardStats, loadingStats, fetchDashboardStats } = useApp();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loadingStats || !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const {
    total_products,
    total_customers,
    total_orders,
    low_stock_products,
    total_revenue,
    recent_orders
  } = dashboardStats;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`$${total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={HiOutlineCurrencyDollar}
          trend="up"
          trendValue="12%"
        />
        <StatsCard
          title="Total Orders"
          value={total_orders}
          icon={HiOutlineShoppingCart}
          trend="up"
          trendValue="5%"
        />
        <StatsCard
          title="Total Products"
          value={total_products}
          icon={HiOutlineCube}
        />
        <StatsCard
          title="Total Customers"
          value={total_customers}
          icon={HiOutlineUsers}
          trend="up"
          trendValue="18%"
        />
        <div className="glass-card p-6 flex flex-col group hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              <HiOutlineExclamationCircle className="text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-[#565959] mb-1">Low Stock Products</p>
            <h4 className={`text-2xl font-bold tracking-tight ${low_stock_products > 0 ? 'text-red-600' : 'text-[#0f1111]'}`}>
              {low_stock_products}
            </h4>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-dark-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0f1111] tracking-tight">Recent Orders</h2>
          <Link to="/orders" className="text-sm font-bold text-[#007185] hover:text-[#c7511f] transition-colors">
            View All →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[#0f1111]">
            <thead className="text-xs text-[#565959] uppercase bg-[#f3f3f3] border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Order ID</th>
                <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">Total</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {recent_orders.length > 0 ? (
                recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f8f9fa] transition-colors group bg-white">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/orders/${order.id}`} className="font-bold text-[#007185] group-hover:text-[#c7511f]">
                        #{order.id.toString().padStart(4, '0')}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-[#0f1111]">{order.customer_name || 'Unknown'}</div>
                      <div className="text-xs text-[#565959]">{order.customer_email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#565959]">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[#0f1111]">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td colSpan={5} className="px-6 py-8 text-center text-[#565959]">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
