import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Truck, 
  Search, 
  Filter, 
  ExternalLink, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  User, 
  Phone,
  MapPin,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';

const StatusBadge = ({ status }) => {
  const configs = {
    'Packed': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: Clock },
    'Picked Up': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: CheckCircle },
  };

  const config = configs[status] || { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8', icon: AlertCircle };
  const Icon = config.icon;

  return (
    <span style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px', 
      borderRadius: '20px', 
      fontSize: '11px', 
      fontWeight: 700,
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.color}20`
    }}>
      <Icon size={12} />
      {status.toUpperCase()}
    </span>
  );
};

const Pickup = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/sellers/orders');
      // Only show orders that are Packed or Picked Up
      const pickupOrders = data.filter(o => o.orderStatus === 'Packed' || o.orderStatus === 'Picked Up');
      setOrders(pickupOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPickedUp = async (orderId) => {
    if (!window.confirm('Mark this order as Picked Up?')) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'Picked Up' });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderIdStr = order.orderId || order._id.slice(-6).toUpperCase();
    const customerName = order.userId?.name || 'Guest';
    const driverName = order.deliveryBoyId?.name || '';
    return orderIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           driverName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Driver Pickup</h1>
          <p style={{ color: '#94a3b8' }}>Manage orders ready for driver collection.</p>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input 
          type="text" 
          placeholder="Search by Order ID, Customer, or Driver..." 
          className="input-field"
          style={{ paddingLeft: '48px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
            <div className="animate-spin" style={{ display: 'inline-block' }}><Truck size={32} color="#6366f1" /></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <AlertCircle size={40} color="#64748b" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#94a3b8' }}>No orders waiting for pickup.</p>
          </div>
        ) : filteredOrders.map((order) => (
          <div key={order._id} className="glass-card" style={{ padding: '24px', borderRadius: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>ORDER ID</div>
                <div style={{ fontWeight: 700, color: '#6366f1' }}>#{order.orderId || order._id.slice(-6).toUpperCase()}</div>
              </div>
              <StatusBadge status={order.orderStatus} />
            </div>

            {/* Driver Section */}
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.05)', 
              border: '1px solid rgba(99, 102, 241, 0.1)', 
              borderRadius: '16px', 
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} />
                ASSIGNED DRIVER
              </div>
              {order.deliveryBoyId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {order.deliveryBoyId.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{order.deliveryBoyId.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={10} /> {order.deliveryBoyId.phone}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                  No driver assigned yet.
                </div>
              )}
            </div>

            {/* Customer & Items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <User size={14} color="#64748b" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Customer: </span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{order.userId?.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={14} color="#64748b" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Items: </span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{order.items?.length} items</span>
              </div>
            </div>

            {/* Actions */}
            {order.orderStatus === 'Packed' && (
              <button 
                onClick={() => handleMarkPickedUp(order._id)}
                disabled={updatingStatus}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  background: '#6366f1', 
                  color: 'white', 
                  border: 'none', 
                  fontWeight: 700, 
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: updatingStatus ? 0.7 : 1
                }}
              >
                <CheckCircle size={18} />
                Mark as Picked Up
              </button>
            )}
            
            {order.orderStatus === 'Picked Up' && (
              <div style={{ 
                textAlign: 'center', 
                padding: '12px', 
                borderRadius: '12px', 
                background: 'rgba(34, 197, 94, 0.1)', 
                color: '#22c55e', 
                fontSize: '14px', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={18} />
                Successfully Picked Up
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Pickup;
