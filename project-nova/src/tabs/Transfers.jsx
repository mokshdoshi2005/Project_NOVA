import React, { useState } from 'react';
import { CheckCircle, X, Plus, Truck, AlertTriangle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';

const Transfers = ({ shops, transfers, setTransfers }) => {
  const [newTransfer, setNewTransfer] = useState({
    product: '',
    from: '',
    to: '',
    quantity: '',
    distance: '',
    urgency: 'medium'
  });

  const addTransfer = () => {
    if (newTransfer.product && newTransfer.from && newTransfer.to && newTransfer.quantity) {
      const newId = Math.max(...transfers.map(t => t.id), 0) + 1;
      setTransfers([...transfers, {
        id: newId,
        ...newTransfer,
        status: 'pending',
        quantity: parseInt(newTransfer.quantity),
        distance: parseInt(newTransfer.distance) || 0
      }]);
      setNewTransfer({ product: '', from: '', to: '', quantity: '', distance: '', urgency: 'medium' });
    }
  };

  const approveTransfer = (id) => {
    setTransfers(transfers.map(t =>
      t.id === id ? { ...t, status: 'approved' } : t
    ));
  };

  const rejectTransfer = (id) => {
    setTransfers(transfers.map(t =>
      t.id === id ? { ...t, status: 'rejected' } : t
    ));
  };

  const pendingTransfers = transfers.filter(t => t.status === 'pending');
  const completedTransfers = transfers.filter(t => t.status !== 'pending');

  return (
    <div className="transfers-container">
      {/* New Transfer Form */}
      <div className="analytics-card">
        <h3>Create Transfer Request</h3>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Product name"
            value={newTransfer.product}
            onChange={(e) => setNewTransfer({ ...newTransfer, product: e.target.value })}
          />
          <select
            value={newTransfer.from}
            onChange={(e) => setNewTransfer({ ...newTransfer, from: e.target.value })}
          >
            <option value="">From Location</option>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
          <select
            value={newTransfer.to}
            onChange={(e) => setNewTransfer({ ...newTransfer, to: e.target.value })}
          >
            <option value="">To Location</option>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantity"
            value={newTransfer.quantity}
            onChange={(e) => setNewTransfer({ ...newTransfer, quantity: e.target.value })}
          />
          <input
            type="number"
            placeholder="Distance (km)"
            value={newTransfer.distance}
            onChange={(e) => setNewTransfer({ ...newTransfer, distance: e.target.value })}
          />
          <select
            value={newTransfer.urgency}
            onChange={(e) => setNewTransfer({ ...newTransfer, urgency: e.target.value })}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button onClick={addTransfer} className="add-btn">
            <Plus size={20} /> Create Transfer
          </button>
        </div>
      </div>

      {/* Pending Transfers */}
      {pendingTransfers.length > 0 && (
        <div className="analytics-card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <AlertTriangle size={24} color="#f59e0b" />
            <h3 style={{ margin: 0 }}>Pending Transfers ({pendingTransfers.length})</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>From</th>
                <th>To</th>
                <th>Quantity</th>
                <th>Distance</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTransfers.map((t) => {
                const from = shops.find(s => s.id === parseInt(t.from))?.name || '';
                const to = shops.find(s => s.id === parseInt(t.to))?.name || '';
                return (
                  <tr key={t.id}>
                    <td>{t.product}</td>
                    <td>{from}</td>
                    <td>{to}</td>
                    <td>{t.quantity}</td>
                    <td>{t.distance} km</td>
                    <td><UrgencyBadge urgency={t.urgency} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => approveTransfer(t.id)}
                          style={{ background: '#059669' }}
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => rejectTransfer(t.id)}
                          style={{ background: '#dc2626' }}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Completed Transfers */}
      {completedTransfers.length > 0 && (
        <div className="analytics-card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Truck size={24} color="#0ea5e9" />
            <h3 style={{ margin: 0 }}>Transfer History</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>From</th>
                <th>To</th>
                <th>Quantity</th>
                <th>Distance</th>
                <th>Urgency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {completedTransfers.map((t) => {
                const from = shops.find(s => s.id === parseInt(t.from))?.name || '';
                const to = shops.find(s => s.id === parseInt(t.to))?.name || '';
                return (
                  <tr key={t.id}>
                    <td>{t.product}</td>
                    <td>{from}</td>
                    <td>{to}</td>
                    <td>{t.quantity}</td>
                    <td>{t.distance} km</td>
                    <td><UrgencyBadge urgency={t.urgency} /></td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transfers;
