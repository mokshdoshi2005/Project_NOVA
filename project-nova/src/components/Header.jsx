import React from 'react';
import { Box, BarChart3, ShieldCheck } from 'lucide-react';

const Header = () => (
  <header className="header">
    <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Box size={28} color="#0ea5e9" />
        <h1>NOVA</h1>
      </div>
      <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>
        Smart Inventory Management
      </span>
    </div>
    <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <BarChart3 size={18} color="#059669" />
        <span>Performance Analytics</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldCheck size={18} color="#0ea5e9" />
        <span>Eco-Friendly Supply Chain 🌱</span>
      </div>
    </div>
  </header>
);

export default Header;
