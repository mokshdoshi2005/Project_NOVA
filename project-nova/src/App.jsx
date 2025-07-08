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

  return (
    <div className="app">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'transfers' && <Transfers />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
};

export default App;
