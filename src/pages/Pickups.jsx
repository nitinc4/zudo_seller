import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Truck, Calendar, Clock, MapPin, Package, CheckCircle, AlertCircle, Plus, ChevronRight, User, FileText } from 'lucide-react';
import Layout from '../components/Layout';

const PickupCard = ({ pickup, onGenerateInvoice }) => (
  <div className="glass-card" style={{ padding: '16px', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: (pickup.status === 'Picked Up' || pickup.status === 'Shipped') ? '#22c55e' : '#6366f1' }}></div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <div>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.5px' }}>PICKUP ID</div>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>#{pickup.pickupId}</div>
      </div>
      <span style={{ 
        padding: '4px 10px', 
        borderRadius: '12px', 
        fontSize: '10px', 
        fontWeight: 800,
        background: (pickup.status === 'Picked Up' || pickup.status === 'Shipped') ? 'rgba(34, 197, 94, 0.1)' : 
                   pickup.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 
                   'rgba(99, 102, 241, 0.1)',
        color: (pickup.status === 'Picked Up' || pickup.status === 'Shipped') ? '#22c55e' : 
               pickup.status === 'Pending' ? '#f59e0b' : 
               '#6366f1',
        border: `1px solid ${(pickup.status === 'Picked Up' || pickup.status === 'Shipped') ? '#22c55e' : pickup.status === 'Pending' ? '#f59e0b' : '#6366f1'}20`
      }}>
        {pickup.status.toUpperCase()}
      </span>
    </div>

    <div style={{ 
      background: 'var(--glass-bg)', 
      borderRadius: '16px', 
      padding: '12px', 
      textAlign: 'center',
      marginBottom: '16px',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>VERIFICATION CODE</div>
      <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '4px', color: 'var(--text-main)', fontFamily: 'monospace' }}>
        {pickup.pickupCode}
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
      {/* Customer Info - Compact */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={16} color="#ec4899" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pickup.customer?.name || 'Guest Customer'}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pickup.address}</div>
        </div>
      </div>

      {/* Driver Info - Compact */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Truck size={16} color="#6366f1" />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{pickup.driver?.name || 'Assigning...'}</div>
        </div>
      </div>
    </div>

    {/* Items Details - New Section */}
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginBottom: '16px' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '8px' }}>ITEMS DETAILS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {pickup.items?.slice(0, 3).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{item.name}</span>
            <span style={{ color: 'var(--text-dim)' }}>x{item.quantity}</span>
          </div>
        ))}
        {pickup.items?.length > 3 && (
          <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 600 }}>+{pickup.items.length - 3} more items</div>
        )}
      </div>
    </div>

    {/* Footer - Compact */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button 
        onClick={() => onGenerateInvoice(pickup)}
        style={{
          background: 'none',
          border: 'none',
          color: '#6366f1',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: 0,
          cursor: 'pointer'
        }}
      >
        <FileText size={14} />
        Invoice
      </button>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e' }}>₹{pickup.totalAmount}</div>
    </div>
  </div>
);

const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const initData = async () => {
      try {
        const [pickupsRes, sellerRes] = await Promise.all([
          api.get('/sellers/pickups'),
          api.get('/sellers/me')
        ]);
        setPickups(pickupsRes.data);
        setSeller(sellerRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const generateInvoice = (pickup) => {
    const invoiceWindow = window.open('', '_blank');
    const sellerName = seller?.storeName || seller?.businessName || 'Zudo Seller';
    const sellerAddress = seller?.billingAddress || seller?.businessAddress || 'N/A';
    const sellerPhone = seller?.phone || 'N/A';

    const invoiceContent = `
      <html>
        <head>
          <title>Invoice_${pickup.pickupId}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .no-print { 
              display: flex; 
              gap: 12px; 
              margin-bottom: 30px; 
              padding: 16px; 
              background: #f8fafc; 
              border-radius: 12px; 
              border: 1px solid #e2e8f0;
            }
            .print-btn { 
              padding: 10px 24px; 
              background: #6366f1; 
              color: white; 
              border: none; 
              border-radius: 8px; 
              cursor: pointer; 
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #6366f1; }
            .invoice-title { font-size: 32px; font-weight: 800; text-align: right; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .details-section h3 { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 10px; }
            .details-section p { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; background: #f8fafc; padding: 12px; font-size: 12px; color: #64748b; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total-section { text-align: right; }
            .total-row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 10px; }
            .total-label { color: #64748b; font-weight: 600; }
            .total-value { font-weight: 800; min-width: 100px; }
            .grand-total { font-size: 20px; color: #6366f1; }
            .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="print-btn" onclick="window.print()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Print / Download PDF
            </button>
            <div style="font-size: 13px; color: #64748b; align-self: center;">
              Click the button and select <b>"Save as PDF"</b> in the destination to download.
            </div>
          </div>
          <div class="header">
            <div class="logo">ZUDO</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          <div class="details">
            <div class="details-section">
              <h3>From</h3>
              <p>${sellerName}</p>
              <p>${sellerAddress}</p>
              <p>Phone: ${sellerPhone}</p>
            </div>
            <div class="details-section" style="text-align: right;">
              <h3>To</h3>
              <p>${pickup.customer?.name || 'Customer'}</p>
              <p>${pickup.address}</p>
              <p>Order ID: ${pickup.pickupId}</p>
              <p>Date: ${new Date(pickup.scheduledDate).toLocaleDateString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Price</th>
                <th>Qty</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${pickup.items.map(item => `
                <tr>
                  <td>${item.name || 'Product'}</td>
                  <td>₹${item.price}</td>
                  <td>${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value">₹${pickup.totalAmount}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax (0%)</span>
              <span class="total-value">₹0</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label" style="color: #6366f1;">Grand Total</span>
              <span class="total-value">₹${pickup.totalAmount}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for doing business with ${sellerName}!</p>
            <p>This is a computer generated invoice and does not require a signature.</p>
          </div>
        </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceContent);
    invoiceWindow.document.close();
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>Pickups</h1>
          <p style={{ color: 'var(--text-dim)' }}>Schedule and track order pickups from your store.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <input 
            type="text" 
            placeholder="Search by customer, items or price..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
            <Package size={20} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--glass-bg)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-color)', overflowX: 'auto' }} className="hide-scrollbar">
          {['All', 'Pending / Packed', 'Completed'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: filterType === type ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: filterType === type ? 'var(--primary)' : 'var(--text-dim)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <div className="glass-card" style={{ padding: '16px', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <Truck size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Scheduled Today</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{pickups.filter(p => new Date(p.scheduledDate).toDateString() === new Date().toDateString()).length}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <AlertCircle size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Pending / Packed</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{pickups.filter(p => ['Pending', 'Packed'].includes(p.status)).length}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <CheckCircle size={24} color="#22c55e" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Completed Pickups</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{pickups.filter(p => !['Pending', 'Packed'].includes(p.status)).length}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Upcoming Pickups</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="animate-spin" style={{ display: 'inline-block' }}><Truck size={24} /></div>
        </div>
      ) : pickups.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Truck size={32} color="#64748b" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>No pickups scheduled</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>Schedule your first pickup to get your orders moving.</p>
          <button className="btn-primary" style={{ margin: '0 auto' }}>
            Schedule Now
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {pickups
            .filter(p => {
              // 1. Filter by Type
              if (filterType === 'Pending / Packed') {
                if (!['Pending', 'Packed'].includes(p.status)) return false;
              } else if (filterType === 'Completed') {
                if (['Pending', 'Packed'].includes(p.status)) return false;
              }

              // 2. Filter by Search Term
              const customerName = (p.customer?.name || '').toLowerCase();
              const itemNames = (p.items || []).map(i => (i.name || '').toLowerCase()).join(' ');
              const price = (p.totalAmount || '').toString();
              const search = searchTerm.toLowerCase();
              
              return customerName.includes(search) || 
                     itemNames.includes(search) || 
                     price.includes(search) ||
                     (p.pickupId || '').toLowerCase().includes(search);
            })
            .map(pickup => <PickupCard key={pickup._id} pickup={pickup} onGenerateInvoice={generateInvoice} />)
          }
        </div>
      )}
    </Layout>
  );
};

export default Pickups;
