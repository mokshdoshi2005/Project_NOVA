import React from 'react';

const StatusBadge = ({ status }) => {
  const colorMap = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected'
  };

  return <span className={`badge ${colorMap[status]}`}>{status}</span>;
};

export default StatusBadge;
