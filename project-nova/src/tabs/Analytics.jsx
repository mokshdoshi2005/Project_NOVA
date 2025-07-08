import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Analytics = ({ shops, inventory }) => {
  // Calculate shop-specific metrics
  const shopMetrics = shops.map(shop => {
    const shopInventory = inventory.filter(i => i.shopId === shop.id);
    const totalStock = shopInventory.reduce((sum, item) => sum + item.current, 0);
    const criticalItems = shopInventory.filter(i => i.current < i.threshold).length;
    const overstockItems = shopInventory.filter(i => i.current > i.predicted).length;
    
    return {
      name: shop.name,
      totalStock,
      criticalItems,
      overstockItems,
      efficiency: ((shopInventory.length - criticalItems - overstockItems) / shopInventory.length * 100).toFixed(1)
    };
  });

  // Calculate overall statistics
  const totalStock = inventory.reduce((sum, item) => sum + item.current, 0);
  const stockValue = inventory.reduce((sum, item) => sum + (item.current * 100), 0); // Assuming average price of 100
  const stockTurnover = 4.2; // This would typically be calculated from historical data
  
  // Distribution data for pie chart
  const stockDistribution = shops.map(shop => ({
    name: shop.name,
    value: inventory.filter(i => i.shopId === shop.id)
      .reduce((sum, item) => sum + item.current, 0)
  }));

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

  return (
    <div className="analytics-container">
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="analytics-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>Total Stock Value</h3>
              <p style={{ fontSize: '24px', fontWeight: '600', margin: '0', color: '#0ea5e9' }}>
                ${stockValue.toLocaleString()}
              </p>
            </div>
            <DollarSign size={32} color="#0ea5e9" />
          </div>
        </div>

        <div className="analytics-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>Stock Turnover</h3>
              <p style={{ fontSize: '24px', fontWeight: '600', margin: '0', color: '#8b5cf6' }}>
                {stockTurnover}x <span style={{ fontSize: '14px', color: '#64748b' }}>per year</span>
              </p>
            </div>
            <TrendingUp size={32} color="#8b5cf6" />
          </div>
        </div>

        <div className="analytics-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>Total Units</h3>
              <p style={{ fontSize: '24px', fontWeight: '600', margin: '0', color: '#f59e0b' }}>
                {totalStock.toLocaleString()}
              </p>
            </div>
            <TrendingDown size={32} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
        {/* Stock Distribution */}
        <div className="analytics-card">
          <h3>Stock Distribution by Location</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <PieChart width={400} height={300}>
              <Pie
                data={stockDistribution}
                cx={200}
                cy={150}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {stockDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* Efficiency Chart */}
        <div className="analytics-card">
          <h3>Location Efficiency</h3>
          <BarChart width={500} height={300} data={shopMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="efficiency" fill="#10b981" name="Stock Efficiency" />
          </BarChart>
        </div>
      </div>

      {/* Shop Performance Table */}
      <div className="analytics-card" style={{ marginTop: '20px' }}>
        <h3>Location Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Total Stock</th>
              <th>Critical Items</th>
              <th>Overstock Items</th>
              <th>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {shopMetrics.map((shop) => (
              <tr key={shop.name}>
                <td>{shop.name}</td>
                <td>{shop.totalStock}</td>
                <td>
                  <span className="status critical">{shop.criticalItems}</span>
                </td>
                <td>
                  <span className="status overstock">{shop.overstockItems}</span>
                </td>
                <td>
                  <span className={`status ${parseFloat(shop.efficiency) > 80 ? 'normal' : 'warning'}`}>
                    {shop.efficiency}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
