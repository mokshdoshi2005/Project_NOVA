import React from 'react';

const UrgencyBadge = ({ urgency }) => {
  const colorMap = {
    high: 'badge-urgent',
    medium: 'badge-medium',
    low: 'badge-low'
  };

  return <span className={`badge ${colorMap[urgency]}`}>{urgency}</span>;
};

export default UrgencyBadge;
