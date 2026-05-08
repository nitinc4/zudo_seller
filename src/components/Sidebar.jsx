import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Truck, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '12px',
      color: isActive ? 'white' : '#94a3b8',
      background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
      fontWeight: isActive ? '600' : '400',
    })}
    className="sidebar-link"
  >
    <Icon size={20} />
    <span style={{ flex: 1 }}>{label}</span>
    <ChevronRight size={16} className="chevron" />
  </NavLink>
);

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('zudo_seller_token');
    localStorage.removeItem('zudo_seller_user');
    navigate('/login');
  };

  return (
    <div style={{ 
      width: '280px', 
      height: '100vh', 
      position: 'fixed', 
      left: 0, 
      top: 0, 
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'rgba(15, 23, 42, 0.3)',
      backdropFilter: 'blur(20px)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '0 8px' }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            width: '40px', 
            height: '40px', 
            objectFit: 'contain',
            borderRadius: '12px',
            background: 'white',
            padding: '4px'
          }} 
        />
        <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}><span style={{ color: '#6366f1' }}>Seller</span></span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <SidebarItem to="/products" icon={Package} label="Products" />
        <SidebarItem to="/orders" icon={ShoppingBag} label="Orders" />
        <SidebarItem to="/pickups" icon={Truck} label="Pickups" />
        <SidebarItem to="/Profile settings" icon={Settings} label="Settings" />
      </nav>

      <button 
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
