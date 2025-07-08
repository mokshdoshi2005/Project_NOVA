import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = ({ inventory, shops }) => {
  // Calculate summary statistics
  const totalProducts = inventory?.length || 0;
  const totalStock = inventory?.reduce((sum, item) => sum + item.current, 0) || 0;
  const criticalItems = inventory?.filter(item => item.current < item.threshold).length || 0;

  // Prepare data for charts
  const shopData = shops?.map(shop => {
    const shopInventory = inventory?.filter(item => item.shopId === shop.id) || [];
    return {
      name: shop.name,
      totalStock: shopInventory.reduce((sum, item) => sum + item.current, 0),
      criticalItems: shopInventory.filter(item => item.current < item.threshold).length
    };
  }) || [];

  // Sample prediction data (you can replace this with real data)
  const predictionData = [
    { name: 'Jan', actual: 4000, predicted: 4400 },
    { name: 'Feb', actual: 3000, predicted: 3200 },
    { name: 'Mar', actual: 2000, predicted: 2400 },
    { name: 'Apr', actual: 2780, predicted: 2800 },
    { name: 'May', actual: 1890, predicted: 2200 },
    { name: 'Jun', actual: 2390, predicted: 2800 },
  ];

  return (
    <div className="dashboard-container">
      {/* Summary Cards */}
      <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="analytics-card">
          <h3>Total Products</h3>
          <p className="stat" style={{ fontSize: '32px', fontWeight: '600', color: '#0ea5e9', margin: '8px 0' }}>{totalProducts}</p>
          <p className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Across all locations</p>
        </div>
        <div className="analytics-card">
          <h3>Total Stock</h3>
          <p className="stat" style={{ fontSize: '32px', fontWeight: '600', color: '#059669', margin: '8px 0' }}>{totalStock}</p>
          <p className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Units in inventory</p>
        </div>
        <div className="analytics-card">
          <h3>Critical Items</h3>
          <p className="stat" style={{ fontSize: '32px', fontWeight: '600', color: '#dc2626', margin: '8px 0' }}>{criticalItems}</p>
          <p className="stat-label" style={{ color: '#64748b', fontSize: '14px' }}>Below threshold</p>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
        {/* Stock Distribution Chart */}
        <div className="analytics-card">
          <h3>Stock Distribution by Shop</h3>
          <BarChart width={500} height={300} data={shopData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalStock" fill="#0ea5e9" name="Total Stock" />
            <Bar dataKey="criticalItems" fill="#dc2626" name="Critical Items" />
          </BarChart>
        </div>

        {/* Prediction vs Actual Chart */}
        <div className="analytics-card">
          <h3>Stock Predictions vs Actual</h3>
          <LineChart width={500} height={300} data={predictionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={2} name="Actual Stock" />
            <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} name="Predicted Stock" />
          </LineChart>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="analytics-card" style={{ marginTop: '20px' }}>
        <h3>Stock Status Overview</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Location</th>
              <th>Current Stock</th>
              <th>Predicted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory?.map(item => {
              const shop = shops?.find(s => s.id === item.shopId);
              const status = item.current > item.predicted ? 'overstock' : item.current < item.threshold ? 'critical' : 'normal';
              
              return (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>{shop?.name}</td>
                  <td>{item.current}</td>
                  <td>{item.predicted}</td>
                  <td><span className={`status ${status}`}>{status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
