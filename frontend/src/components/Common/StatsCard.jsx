import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue }) => {
  return (
    <div className="glass-card p-6 flex flex-col group hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-[#f3f3f3] text-[#007185] group-hover:bg-[#007185] group-hover:text-white transition-colors duration-300">
          <Icon className="text-2xl" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend === 'up' ? '+' : '-'}{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-[#565959] mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-[#0f1111] tracking-tight">{value}</h4>
      </div>
    </div>
  );
};

export default StatsCard;
