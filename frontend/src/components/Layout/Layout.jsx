import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#1e1e1e' }}>
      <Sidebar />
      <div style={{ 
        marginLeft: '280px', 
        flex: 1, 
        minHeight: '100vh',
        backgroundColor: '#1e1e1e'
      }}>
        <Header />
        <div style={{ padding: '20px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;