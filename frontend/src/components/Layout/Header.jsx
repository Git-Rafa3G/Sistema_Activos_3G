import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      backgroundColor: '#2d2d2d',
      borderBottom: '1px solid #d32f2f',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div>
        <h5 style={{ color: '#d32f2f', margin: 0 }}>Control de Activos</h5>
        <small style={{ color: '#b0b0b0' }}>Gestión de inventario empresarial</small>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#ffffff', fontSize: '14px' }}>
            {user?.first_name} {user?.last_name}
          </div>
          <div style={{ color: '#d32f2f', fontSize: '12px' }}>
            {user?.role === 'admin' ? 'ADMINISTRADOR' : user?.role === 'manager' ? 'GERENTE' : 'EMPLEADO'}
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #d32f2f',
            color: '#d32f2f',
            borderRadius: '20px',
            padding: '6px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#d32f2f';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#d32f2f';
          }}
        >
          Salir
        </button>
      </div>
    </div>
  );
};

export default Header;