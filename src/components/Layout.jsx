import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(circle at top left, #1e293b, #0f172a)' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '280px', 
        padding: '40px',
        maxWidth: '1400px',
        width: 'calc(100% - 280px)'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
