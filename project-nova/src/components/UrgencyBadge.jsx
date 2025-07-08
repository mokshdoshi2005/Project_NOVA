import React from 'react';
import { AlertTriangle, Clock, ArrowDown } from 'lucide-react';

const UrgencyBadge = ({ urgency }) => {
  const getUrgencyConfig = () => {
    switch (urgency) {
      case 'high':
        return {
          className: 'badge-urgent',
          icon: <AlertTriangle size={14} />,
          label: 'High Priority'
        };
      case 'medium':
        return {
          className: 'badge-medium',
          icon: <Clock size={14} />,
          label: 'Medium Priority'
        };
      case 'low':
        return {
          className: 'badge-low',
          icon: <ArrowDown size={14} />,
          label: 'Low Priority'
        };
      default:
        return {
          className: 'badge-medium',
          icon: <Clock size={14} />,
          label: urgency
        };
    }
  };

  const { className, icon, label } = getUrgencyConfig();

  return (
    <span className={`badge ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {icon}
      {label}
    </span>
  );
};

export default UrgencyBadge;
