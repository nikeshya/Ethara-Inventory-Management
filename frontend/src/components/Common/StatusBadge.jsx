import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-neutral';
  let label = status || 'Unknown';

  if (typeof status === 'string') {
    const s = status.toLowerCase();
    switch (s) {
      case 'delivered':
        badgeClass = 'badge-success';
        break;
      case 'confirmed':
      case 'shipped':
        badgeClass = 'badge-info';
        break;
      case 'pending':
        badgeClass = 'badge-warning';
        break;
      case 'cancelled':
        badgeClass = 'badge-danger';
        break;
      default:
        badgeClass = 'badge-neutral';
    }
    label = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
