import React from 'react';
import { useLocation } from 'react-router-dom';
import { HiOutlineBell, HiOutlineSearch, HiOutlineMenu } from 'react-icons/hi';

const Header = ({ onMenuToggle }) => {
  const location = useLocation();
  
  // Format pathname to title
  const title = location.pathname
    .split('/')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' / ') || 'Dashboard';

  return (
    <header className="h-16 bg-[#232f3e] border-b border-dark-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <HiOutlineMenu className="text-xl" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <HiOutlineSearch className="text-gray-500" />
          </div>
          <input
            type="text"
            className="form-input pl-10 bg-white border-transparent focus:border-[#ff9900] w-64 rounded-md transition-all text-[#0f1111]"
            placeholder="Search..."
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <HiOutlineBell className="text-xl" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff9900]"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
