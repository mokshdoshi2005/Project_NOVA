import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './tabs/Dashboard';
import Inventory from './tabs/Inventory';
import Transfers from './tabs/Transfers';
import Analytics from './tabs/Analytics';
import './styles/App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sample data
  const [shops] = useState([
    { id: 1, name: 'Downtown Store' },
    { id: 2, name: 'Mall Branch' },
    { id: 3, name: 'Airport Shop' }
  ]);

  const [inventory, setInventory] = useState([
    { id: 1, shopId: 1, product: 'Laptop', current: 45, predicted: 50, threshold: 20, perishable: false, shelfLife: 365 },
    { id: 2, shopId: 1, product: 'Smartphone', current: 15, predicted: 30, threshold: 10, perishable: false, shelfLife: 365 },
    { id: 3, shopId: 2, product: 'Headphones', current: 25, predicted: 20, threshold: 8, perishable: false, shelfLife: 365 }
  ]);

  const [transfers, setTransfers] = useState([
    { id: 1, product: 'Laptop', from: 1, to: 2, quantity: 5, distance: 12, urgency: 'high', status: 'pending' },
    { id: 2, product: 'Smartphone', from: 2, to: 3, quantity: 3, distance: 8, urgency: 'medium', status: 'approved' }
  ]);

  return (
    <div className="app">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="content">
        {activeTab === 'dashboard' && <Dashboard inventory={inventory} shops={shops} />}
        {activeTab === 'inventory' && <Inventory shops={shops} inventory={inventory} setInventory={setInventory} />}
        {activeTab === 'transfers' && <Transfers shops={shops} transfers={transfers} setTransfers={setTransfers} />}
        {activeTab === 'analytics' && <Analytics shops={shops} inventory={inventory} />}
      </main>
    </div>
  );
};

export default App;
