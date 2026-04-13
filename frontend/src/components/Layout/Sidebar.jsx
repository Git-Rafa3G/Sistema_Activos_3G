import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/sidebar.css';
import logo from '../../assets/images/logo.svg';

const Sidebar = () => {
  const { canAccessModule, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊', module: 'dashboard' },
    { path: '/assets', name: 'Activos', icon: '📦', module: 'assets' },
    { path: '/categories', name: 'Categorías', icon: '🏷️', module: 'categories' },
    { path: '/employees', name: 'Empleados', icon: '👥', module: 'employees' },
    { path: '/assignments', name: 'Asignaciones', icon: '🔗', module: 'assignments' },
    { path: '/maintenance', name: 'Mantenimiento', icon: '🔧', module: 'maintenance' },
  ];

  if (user?.role === 'admin') {
    menuItems.push(
      { path: '/users', name: 'Usuarios', icon: '👑', module: 'users' },
      { path: '/modules', name: 'Módulos Globales', icon: '⚙️', module: 'moduleManager' },
      { path: '/permissions', name: 'Permisos por Usuario', icon: '🔐', module: 'userPermissions' }
    );
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰ Menú
      </button>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo 3G" className="sidebar-logo" />
          <h3 className="sidebar-title">Sistema de Activos</h3>
          <p className="sidebar-subtitle">3 Generaciones</p>
        </div>

        <nav>
          {menuItems.map((item) => (
            (item.module === 'dashboard' || canAccessModule(item.module)) && (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-link-custom ${isActive ? 'active' : ''}`
                }
                onClick={() => setIsOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.first_name} {user?.last_name}</div>
            <div className="user-role">
              {user?.role === 'admin' ? 'Administrador' : user?.role === 'manager' ? 'Gerente' : 'Empleado'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;