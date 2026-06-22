import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineCube, 
  HiOutlineUsers, 
  HiOutlineShoppingCart,
  HiOutlineX 
} from 'react-icons/hi';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HiOutlineHome },
  { name: 'Products', path: '/products', icon: HiOutlineCube },
  { name: 'Customers', path: '/customers', icon: HiOutlineUsers },
  { name: 'Orders', path: '/orders', icon: HiOutlineShoppingCart },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in" 
          onClick={onClose} 
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-dark-border 
        flex flex-col min-h-screen transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-dark-border shrink-0 bg-[#232f3e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff9900] to-[#e68a00] flex items-center justify-center text-white font-bold text-xl shadow-sm">
              E
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Ethara<span className="text-[#ff9900]">.AI</span></span>
          </div>
          {/* Close button (mobile only) */}
          <button 
            onClick={onClose} 
            className="md:hidden p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#f3f3f3] text-[#0f1111] font-bold border-l-4 border-[#ff9900] pl-2'
                      : 'text-[#565959] hover:bg-[#f3f3f3] hover:text-[#0f1111] border-l-4 border-transparent pl-2'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`text-xl ${isActive ? 'text-[#0f1111]' : 'text-[#565959] group-hover:text-[#0f1111]'}`} />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Area */}
        <div className="p-4 border-t border-dark-border bg-[#f8f9fa]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-white border border-dark-border shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#007185] flex items-center justify-center text-white font-bold">
              NY
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0f1111] truncate">Nikesh Kumar Yadav</p>
              <p className="text-xs text-[#565959] truncate">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
