import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Package, TrendingUp, AlertTriangle, ArrowRight, Plus, Store, Truck, Leaf, Users, Calendar, CheckCircle, Clock, X } from 'lucide-react';

const InventoryBalancingPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shops, setShops] = useState([
    { id: 1, name: 'Downtown Store', location: 'Downtown', distance: 0 },
    { id: 2, name: 'Mall Branch', location: 'Shopping Mall', distance: 2.5 },
    { id: 3, name: 'Suburb Outlet', location: 'Residential Area', distance: 5.2 },
    { id: 4, name: 'Highway Store', location: 'Highway Junction', distance: 8.1 }
  ]);

  const [inventory, setInventory] = useState([
    { id: 1, product: 'Milk', shopId: 1, current: 45, predicted: 65, threshold: 20, perishable: true, shelfLife: 3 },
    { id: 2, product: 'Bread', shopId: 1, current: 80, predicted: 45, threshold: 30, perishable: true, shelfLife: 2 },
    { id: 3, product: 'Apples', shopId: 2, current: 25, predicted: 80, threshold: 40, perishable: true, shelfLife: 7 },
    { id: 4, product: 'Milk', shopId: 2, current: 85, predicted: 40, threshold: 20, perishable: true, shelfLife: 3 },
    { id: 5, product: 'Cereal', shopId: 3, current: 15, predicted: 50, threshold: 25, perishable: false, shelfLife: 365 },
    { id: 6, product: 'Bread', shopId: 3, current: 95, predicted: 30, threshold: 30, perishable: true, shelfLife: 2 },
    { id: 7, product: 'Apples', shopId: 4, current: 120, predicted: 60, threshold: 40, perishable: true, shelfLife: 7 },
    { id: 8, product: 'Milk', shopId: 4, current: 30, predicted: 75, threshold: 20, perishable: true, shelfLife: 3 }
  ]);

  const [transfers, setTransfers] = useState([
    { id: 1, product: 'Milk', from: 2, to: 1, quantity: 20, status: 'pending', urgency: 'high', distance: 2.5 },
    { id: 2, product: 'Bread', from: 3, to: 1, quantity: 15, status: 'approved', urgency: 'medium', distance: 5.2 },
    { id: 3, product: 'Apples', from: 4, to: 2, quantity: 30, status: 'pending', urgency: 'high', distance: 6.7 }
  ]);

  const [newProduct, setNewProduct] = useState({ product: '', current: '', predicted: '', threshold: '', perishable: false, shelfLife: '' });
  const [selectedShop, setSelectedShop] = useState(1);

  // Calculate metrics
  const totalProducts = inventory.reduce((sum, item) => sum + item.current, 0);
  const wasteReduction = 85; // percentage
  const fuelSavings = 42; // percentage
  const availability = 94; // percentage

  // Generate recommendations
  const generateRecommendations = () => {
    const recommendations = [];
    
    inventory.forEach(item => {
      const shop = shops.find(s => s.id === item.shopId);
      const surplus = item.current - item.predicted;
      const deficit = item.predicted - item.current;
      
      if (surplus > 10) {
        // Find shops that need this product
        const needyShops = inventory.filter(i => 
          i.product === item.product && 
          i.shopId !== item.shopId && 
          i.current < i.predicted
        );
        
        needyShops.forEach(needyShop => {
          const targetShop = shops.find(s => s.id === needyShop.shopId);
          const distance = Math.abs(shop.distance - targetShop.distance);
          
          recommendations.push({
            product: item.product,
            from: item.shopId,
            to: needyShop.shopId,
            quantity: Math.min(surplus, needyShop.predicted - needyShop.current),
            urgency: item.perishable && item.shelfLife < 3 ? 'high' : 'medium',
            distance: distance,
            reason: deficit > 10 ? 'Critical shortage' : 'Optimize stock levels'
          });
        });
      }
    });
    
    return recommendations.slice(0, 5);
  };

  const addProduct = () => {
    if (newProduct.product && newProduct.current && newProduct.predicted) {
      const newId = Math.max(...inventory.map(i => i.id)) + 1;
      setInventory([...inventory, {
        id: newId,
        shopId: selectedShop,
        ...newProduct,
        current: parseInt(newProduct.current),
        predicted: parseInt(newProduct.predicted),
        threshold: parseInt(newProduct.threshold) || 20,
        shelfLife: parseInt(newProduct.shelfLife) || 365
      }]);
      setNewProduct({ product: '', current: '', predicted: '', threshold: '', perishable: false, shelfLife: '' });
    }
  };

  const approveTransfer = (transferId) => {
    setTransfers(transfers.map(t => 
      t.id === transferId ? { ...t, status: 'approved' } : t
    ));
  };

  const rejectTransfer = (transferId) => {
    setTransfers(transfers.map(t => 
      t.id === transferId ? { ...t, status: 'rejected' } : t
    ));
  };

  // Chart data
  const demandData = [
    { name: 'Mon', actual: 240, predicted: 220 },
    { name: 'Tue', actual: 300, predicted: 280 },
    { name: 'Wed', actual: 200, predicted: 210 },
    { name: 'Thu', actual: 278, predicted: 290 },
    { name: 'Fri', actual: 189, predicted: 200 },
    { name: 'Sat', actual: 350, predicted: 340 },
    { name: 'Sun', actual: 280, predicted: 270 }
  ];

  const stockData = inventory.map(item => ({
    name: `${item.product} (${shops.find(s => s.id === item.shopId)?.name})`,
    current: item.current,
    predicted: item.predicted,
    threshold: item.threshold
  }));

  const impactData = [
    { name: 'Waste Reduced', value: wasteReduction, color: '#10b981' },
    { name: 'Fuel Saved', value: fuelSavings, color: '#3b82f6' },
    { name: 'Availability', value: availability, color: '#8b5cf6' }
  ];

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const UrgencyBadge = ({ urgency }) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[urgency]}`}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Smart Inventory Balancing</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Leaf className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Eco-Friendly Supply Chain</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'transfers', label: 'Transfers', icon: Truck },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Waste Reduction</p>
                    <p className="text-2xl font-bold text-gray-900">{wasteReduction}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Truck className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Fuel Savings</p>
                    <p className="text-2xl font-bold text-gray-900">{fuelSavings}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Availability</p>
                    <p className="text-2xl font-bold text-gray-900">{availability}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={demandData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Metrics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={impactData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {impactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Recommendations</h3>
              <div className="space-y-3">
                {generateRecommendations().map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Transfer {rec.quantity} {rec.product} from {shops.find(s => s.id === rec.from)?.name} to {shops.find(s => s.id === rec.to)?.name}
                        </p>
                        <p className="text-sm text-gray-600">Distance: {rec.distance.toFixed(1)}km • {rec.reason}</p>
                      </div>
                    </div>
                    <UrgencyBadge urgency={rec.urgency} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Add Product Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <select
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Product name"
                  value={newProduct.product}
                  onChange={(e) => setNewProduct({...newProduct, product: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Current stock"
                  value={newProduct.current}
                  onChange={(e) => setNewProduct({...newProduct, current: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Predicted demand"
                  value={newProduct.predicted}
                  onChange={(e) => setNewProduct({...newProduct, predicted: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Shelf life (days)"
                  value={newProduct.shelfLife}
                  onChange={(e) => setNewProduct({...newProduct, shelfLife: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Current Inventory</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Demand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf Life</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => {
                      const shop = shops.find(s => s.id === item.shopId);
                      const status = item.current > item.predicted ? 'overstock' : 
                                   item.current < item.threshold ? 'critical' : 'normal';
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {shop?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.product}
                            {item.perishable && <span className="ml-2 text-orange-600">🥛</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.current}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.predicted}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'overstock' ? 'bg-blue-100 text-blue-800' :
                              status === 'critical' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.shelfLife} days
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Levels Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Levels Overview</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="current" fill="#3b82f6" name="Current Stock" />
                  <Bar dataKey="predicted" fill="#10b981" name="Predicted Demand" />
                  <Bar dataKey="threshold" fill="#ef4444" name="Threshold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transfer Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transfers.map((transfer) => {
                      const fromShop = shops.find(s => s.id === transfer.from);
                      const toShop = shops.find(s => s.id === transfer.to);
                      return (
                        <tr key={transfer.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transfer.product}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {fromShop?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {toShop?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.distance} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <UrgencyBadge urgency={transfer.urgency} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={transfer.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {transfer.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => approveTransfer(transfer.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => rejectTransfer(transfer.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CO2 Emissions Reduced</span>
                    <span className="text-lg font-bold text-green-600">1.2 tons</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fuel Saved</span>
                    <span className="text-lg font-bold text-blue-600">450 L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Food Waste Prevented</span>
                    <span className="text-lg font-bold text-purple-600">85 kg</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Savings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transportation Costs</span>
                    <span className="text-lg font-bold text-green-600">$2,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Waste Disposal</span>
                    <span className="text-lg font-bold text-blue-600">$780</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Savings</span>
                    <span className="text-lg font-bold text-purple-600">$3,230</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {shops.map(shop => {
                  const shopInventory = inventory.filter(item => item.shopId === shop.id);
                  const totalStock = shopInventory.reduce((sum, item) => sum + item.current, 0);
                  const overstocked = shopInventory.filter(item => item.current > item.predicted).length;
                  const understocked = shopInventory.filter(item => item.current < item.threshold).length;
                  
                  return (
                    <div key={shop.id} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{shop.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Stock</span>
                          <span className="text-sm font-medium">{totalStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Overstocked</span>
                          <span className="text-sm font-medium text-blue-600">{overstocked}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Understocked</span>
                          <span className="text-sm font-medium text-red-600">{understocked}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryBalancingPlatform;
