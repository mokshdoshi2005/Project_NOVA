import React, { useState } from 'react';
import { Plus, Search, AlertTriangle } from 'lucide-react';

const Inventory = ({ shops, inventory, setInventory }) => {
  const [newProduct, setNewProduct] = useState({
    product: '',
    current: '',
    predicted: '',
    threshold: '',
    perishable: false,
    shelfLife: ''
  });
  const [selectedShop, setSelectedShop] = useState(shops[0]?.id || 1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShop, setFilterShop] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const addProduct = () => {
    if (newProduct.product && newProduct.current && newProduct.predicted) {
      const newId = Math.max(...inventory.map(i => i.id), 0) + 1;
      setInventory([...inventory, {
        id: newId,
        shopId: selectedShop,
        ...newProduct,
        current: parseInt(newProduct.current),
        predicted: parseInt(newProduct.predicted),
        threshold: parseInt(newProduct.threshold) || Math.floor(parseInt(newProduct.predicted) * 0.2),
        shelfLife: parseInt(newProduct.shelfLife) || 365
      }]);
      setNewProduct({ product: '', current: '', predicted: '', threshold: '', perishable: false, shelfLife: '' });
    }
  };

  const updateStock = (id, newValue) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, current: parseInt(newValue) } : item
    ));
  };

  const deleteProduct = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShop = filterShop === 'all' || item.shopId === parseInt(filterShop);
    const status = item.current > item.predicted ? 'overstock' : 
                  item.current < item.threshold ? 'critical' : 'normal';
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesShop && matchesStatus;
  });

  const criticalCount = inventory.filter(i => i.current < i.threshold).length;

  return (
    <div className="inventory-container">
      {criticalCount > 0 && (
        <div className="analytics-card" style={{ borderLeft: '4px solid #dc2626', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={24} color="#dc2626" />
          <div>
            <h4 style={{ margin: '0', color: '#dc2626' }}>Critical Stock Alert</h4>
            <p style={{ margin: '4px 0 0 0' }}>{criticalCount} products below threshold</p>
          </div>
        </div>
      )}

      {/* Add Product Form */}
      <div className="add-product-form">
        <h3>Add New Product</h3>
        <div className="form-grid">
          <select 
            value={selectedShop} 
            onChange={(e) => setSelectedShop(parseInt(e.target.value))}
          >
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Product name"
            value={newProduct.product}
            onChange={(e) => setNewProduct({ ...newProduct, product: e.target.value })}
          />
          <input
            type="number"
            placeholder="Current stock"
            value={newProduct.current}
            onChange={(e) => setNewProduct({ ...newProduct, current: e.target.value })}
          />
          <input
            type="number"
            placeholder="Predicted demand"
            value={newProduct.predicted}
            onChange={(e) => setNewProduct({ ...newProduct, predicted: e.target.value })}
          />
          <input
            type="number"
            placeholder="Threshold (optional)"
            value={newProduct.threshold}
            onChange={(e) => setNewProduct({ ...newProduct, threshold: e.target.value })}
          />
          <button onClick={addProduct} className="add-btn">
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="analytics-card">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select 
            value={filterShop} 
            onChange={(e) => setFilterShop(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="all">All Locations</option>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="all">All Status</option>
            <option value="normal">Normal</option>
            <option value="critical">Critical</option>
            <option value="overstock">Overstock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="analytics-card">
        <h3>Current Inventory</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Location</th>
              <th>Current Stock</th>
              <th>Predicted</th>
              <th>Threshold</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const shop = shops.find(s => s.id === item.shopId);
              const status = item.current > item.predicted ? 'overstock' : 
                           item.current < item.threshold ? 'critical' : 'normal';
              
              return (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>{shop?.name}</td>
                  <td>
                    <input
                      type="number"
                      value={item.current}
                      onChange={(e) => updateStock(item.id, e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </td>
                  <td>{item.predicted}</td>
                  <td>{item.threshold}</td>
                  <td><span className={`status ${status}`}>{status}</span></td>
                  <td>
                    <button 
                      onClick={() => deleteProduct(item.id)}
                      style={{ background: '#dc2626' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
