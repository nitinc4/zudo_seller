import React, { useState, useEffect } from 'react';
import api, { IMAGE_BASE_URL, getImageUrl } from '../utils/api';
import { ShoppingBag, Search, Filter, MoreHorizontal, Calendar, User, MapPin, ExternalLink, Clock, CheckCircle, Truck, XCircle, RefreshCcw } from 'lucide-react';
import Layout from '../components/Layout';

const StatusBadge = ({ status }) => {
  const configs = {
    'Pending': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: Clock },
    'Packed': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: CheckCircle },
    'Picked Up': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: Truck },
    'Processing': { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', icon: RefreshCcw },
    'Shipped': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: Truck },
    'Delivered': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: CheckCircle },
    'Cancelled': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: XCircle },
  };

  const config = configs[status] || configs['Pending'];
  const Icon = config.icon || Clock;

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
      {status?.toUpperCase()}
    </span>
  );
};

const StatusSelector = ({ status, onUpdate, disabled }) => {
  const configs = {
    'Pending': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    'Packed': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
    'Picked Up': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
    'Processing': { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
    'Shipped': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
    'Delivered': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
    'Cancelled': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  };

  const config = configs[status] || configs['Pending'];
  const selectableStatuses = ['Pending', 'Packed'];

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <select 
        value={status || 'Pending'} 
        onChange={(e) => onUpdate(e.target.value)}
        disabled={disabled}
        style={{
          appearance: 'none',
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.color}40`,
          padding: '6px 28px 6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
          width: '130px'
        }}
      >
        {/* Always show current status as an option */}
        {!selectableStatuses.includes(status) && status && (
          <option value={status} style={{ background: '#0f172a', color: 'white' }}>{status.toUpperCase()}</option>
        )}
        {selectableStatuses.map(s => (
          <option key={s} value={s} style={{ background: '#0f172a', color: 'white' }}>{s.toUpperCase()}</option>
        ))}
      </select>
      <div style={{ 
        position: 'absolute', 
        right: '10px', 
        top: '50%', 
        transform: 'translateY(-50%)', 
        pointerEvents: 'none',
        color: config.color,
        fontSize: '10px'
      }}>
        ▼
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus } : null);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const OrderDetailPanel = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        width: '500px', 
        height: '100vh', 
        background: 'var(--bg-dark)', 
        borderLeft: '1px solid var(--border-color)',
        boxShadow: '-20px 0 50px rgba(0,0,0,0.5)',
        zIndex: 1000,
        padding: '32px',
        overflowY: 'auto',
        transition: 'transform 0.3s ease-in-out',
      }} className="order-detail-panel">
        <style>
          {`
            @media (max-width: 600px) {
              .order-detail-panel {
                width: 100% !important;
                padding: 24px !important;
              }
            }
          `}
        </style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>Order Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <XCircle size={24} />
          </button>
        </div>

        {/* Customer & Status */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>ORDER ID</div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#6366f1' }}>#{order.orderId || order._id.slice(-6).toUpperCase()}</div>
            </div>
            <StatusBadge status={order.orderStatus} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '10px' }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{order.userId?.name || 'Guest'}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{order.userId?.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '10px' }}>
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>{order.shippingAddress?.address}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{order.shippingAddress?.city}, {order.shippingAddress?.pincode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Items Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <img 
                  src={getImageUrl(item.image)} 
                  alt="" 
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} 
                  onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Qty: {item.quantity} × ₹{item.price}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>₹{item.quantity * item.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Update Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['Pending', 'Packed'].map(s => (
              <button 
                key={s}
                disabled={updatingStatus || order.orderStatus === s}
                onClick={() => updateOrderStatus(order._id, s)}
                style={{ 
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: order.orderStatus === s ? 'rgba(99, 102, 241, 0.2)' : 'var(--glass-bg)',
                  color: order.orderStatus === s ? '#6366f1' : 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: updatingStatus ? 0.5 : 1
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/sellers/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderIdStr = order.orderId || order._id.slice(-6).toUpperCase();
    const customerName = order.userId?.name || 'Guest';
    const matchesSearch = orderIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (order.orderStatus || 'Pending') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>Orders</h1>
          <p style={{ color: 'var(--text-dim)' }}>Monitor and manage your customer orders.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="input-field"
            style={{ paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', background: 'var(--glass-bg)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-color)', overflowX: 'auto' }} className="hide-scrollbar">
          {['All', 'Pending', 'Processing', 'Packed'].map(s => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{ 
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: statusFilter === s ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: statusFilter === s ? '#6366f1' : 'var(--text-dim)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="glass-card desktop-only" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--glass-bg)' }}>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>ORDER ID</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>DATE</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>CUSTOMER</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>ITEMS</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>TOTAL</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="animate-spin" style={{ display: 'inline-block' }}><ShoppingBag size={24} /></div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No orders found yet.
                </td>
              </tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#6366f1' }}>#{order.orderId || order._id.slice(-6).toUpperCase()}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{order.userId?.name || 'Guest'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{order.userId?.phone || order.shippingAddress?.phone}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                  {order.items?.length || 0} items
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600 }}>
                  ₹{order.totalAmount || 0}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <StatusSelector 
                    status={order.orderStatus} 
                    onUpdate={(newStatus) => updateOrderStatus(order._id, newStatus)}
                    disabled={updatingStatus}
                  />
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    style={{ padding: '8px', borderRadius: '8px', background: 'var(--glass-bg)', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                  >
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="animate-spin" style={{ display: 'inline-block' }}><ShoppingBag size={24} /></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
            No orders found yet.
          </div>
        ) : filteredOrders.map((order) => (
          <div 
            key={order._id} 
            className="glass-card" 
            style={{ padding: '16px', borderRadius: '20px' }}
            onClick={() => setSelectedOrder(order)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, color: '#6366f1' }}>#{order.orderId || order._id.slice(-6).toUpperCase()}</div>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{order.userId?.name || 'Guest'}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>₹{order.totalAmount}</div>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{order.items?.length} items</div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)',
          zIndex: 999 
        }} onClick={() => setSelectedOrder(null)}>
          <div onClick={e => e.stopPropagation()}>
            <OrderDetailPanel 
              order={selectedOrder} 
              onClose={() => setSelectedOrder(null)} 
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
