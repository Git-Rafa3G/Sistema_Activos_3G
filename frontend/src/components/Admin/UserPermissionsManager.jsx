import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/permissions.css';

const UserPermissionsManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModules, setUserModules] = useState({});
  const [userPermissions, setUserPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useAuth();

  const modules = [
    { key: 'assets', name: '📦 Activos', description: 'Ver y gestionar activos' },
    { key: 'employees', name: '👥 Empleados', description: 'Ver y gestionar empleados' },
    { key: 'assignments', name: '🔗 Asignaciones', description: 'Asignar y devolver activos' },
    { key: 'maintenance', name: '🔧 Mantenimiento', description: 'Gestionar mantenimientos' },
  ];

  const permissionsByModule = {
    assets: [
      { key: 'can_view_assets', name: 'Ver activos', description: 'Puede ver la lista de activos' },
      { key: 'can_create_asset', name: 'Crear activos', description: 'Puede crear nuevos activos' },
      { key: 'can_edit_asset', name: 'Editar activos', description: 'Puede editar activos existentes' },
      { key: 'can_delete_asset', name: 'Eliminar activos', description: 'Puede eliminar activos' },
    ],
    employees: [
      { key: 'can_view_employees', name: 'Ver empleados', description: 'Puede ver la lista de empleados' },
      { key: 'can_create_employee', name: 'Crear empleados', description: 'Puede crear nuevos empleados' },
      { key: 'can_edit_employee', name: 'Editar empleados', description: 'Puede editar empleados' },
      { key: 'can_delete_employee', name: 'Eliminar empleados', description: 'Puede eliminar empleados' },
    ],
    assignments: [
      { key: 'can_view_assignments', name: 'Ver asignaciones', description: 'Puede ver historial de asignaciones' },
      { key: 'can_create_assignment', name: 'Crear asignaciones', description: 'Puede asignar activos' },
      { key: 'can_return_assignment', name: 'Devolver activos', description: 'Puede registrar devoluciones' },
    ],
    maintenance: [
      { key: 'can_view_maintenances', name: 'Ver mantenimientos', description: 'Puede ver historial de mantenimientos' },
      { key: 'can_create_maintenance', name: 'Crear mantenimientos', description: 'Puede programar mantenimientos' },
      { key: 'can_complete_maintenance', name: 'Completar mantenimientos', description: 'Puede finalizar mantenimientos' },
    ],
  };

  useEffect(() => {
    loadUsers();
    loadStoredPermissions();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      if (currentUser?.role !== 'admin') {
        setUsers(res.data.filter(u => u.id === currentUser?.id));
      } else {
        setUsers(res.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStoredPermissions = () => {
    const storedModules = localStorage.getItem('userModulesConfig');
    if (storedModules) {
      setUserModules(JSON.parse(storedModules));
    }

    const storedPermissions = localStorage.getItem('userPermissionsConfig');
    if (storedPermissions) {
      setUserPermissions(JSON.parse(storedPermissions));
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const toggleModuleForUser = (userId, moduleKey) => {
    setUserModules(prev => {
      const currentModules = prev[userId] || [];
      const updated = currentModules.includes(moduleKey)
        ? currentModules.filter(m => m !== moduleKey)
        : [...currentModules, moduleKey];
      
      if (!updated.includes(moduleKey)) {
        const permissionsToRemove = permissionsByModule[moduleKey] || [];
        setUserPermissions(prevPerms => {
          const currentPerms = prevPerms[userId] || [];
          const filteredPerms = currentPerms.filter(
            p => !permissionsToRemove.some(perm => perm.key === p)
          );
          return { ...prevPerms, [userId]: filteredPerms };
        });
      }
      
      return { ...prev, [userId]: updated };
    });
  };

  const togglePermissionForUser = (userId, permissionKey) => {
    setUserPermissions(prev => {
      const currentPerms = prev[userId] || [];
      const updated = currentPerms.includes(permissionKey)
        ? currentPerms.filter(p => p !== permissionKey)
        : [...currentPerms, permissionKey];
      return { ...prev, [userId]: updated };
    });
  };

  const isModuleActive = (userId, moduleKey) => {
    if (selectedUser?.role === 'admin') return true;
    return (userModules[userId] || []).includes(moduleKey);
  };

  const isPermissionActive = (userId, permissionKey) => {
    if (selectedUser?.role === 'admin') return true;
    return (userPermissions[userId] || []).includes(permissionKey);
  };

  const saveAllPermissions = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('userModulesConfig', JSON.stringify(userModules));
      localStorage.setItem('userPermissionsConfig', JSON.stringify(userPermissions));
      
      if (selectedUser && selectedUser.id === currentUser?.id) {
        const updatedModules = userModules[selectedUser.id] || [];
        localStorage.setItem('userModules', JSON.stringify(updatedModules));
      }
      
      setSaving(false);
      alert('✅ Permisos guardados exitosamente');
    }, 500);
  };

  const resetUserPermissions = (userId) => {
    if (window.confirm('¿Restablecer todos los permisos de este usuario a los valores por defecto?')) {
      const user = users.find(u => u.id === userId);
      if (user?.role === 'admin') {
        setUserModules(prev => ({ ...prev, [userId]: modules.map(m => m.key) }));
        setUserPermissions(prev => ({ ...prev, [userId]: [] }));
      } else if (user?.role === 'manager') {
        setUserModules(prev => ({ ...prev, [userId]: modules.map(m => m.key) }));
        setUserPermissions(prev => ({ 
          ...prev, 
          [userId]: ['can_view_assets', 'can_create_asset', 'can_edit_asset', 'can_view_employees', 'can_create_employee', 'can_edit_employee', 'can_view_assignments', 'can_create_assignment', 'can_return_assignment', 'can_view_maintenances', 'can_create_maintenance', 'can_complete_maintenance']
        }));
      } else {
        setUserModules(prev => ({ ...prev, [userId]: ['assets', 'assignments'] }));
        setUserPermissions(prev => ({ 
          ...prev, 
          [userId]: ['can_view_assets', 'can_view_assignments']
        }));
      }
      alert('Permisos restablecidos a valores por defecto');
    }
  };

  const getRoleClass = (role) => {
    switch(role) {
      case 'admin': return 'role-admin';
      case 'manager': return 'role-manager';
      default: return 'role-employee';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="permissions-container">
      <div className="permissions-header">
        <div>
          <h2 className="permissions-title">🔐 Gestión de Permisos por Usuario</h2>
          <p className="permissions-subtitle">Configura qué módulos y acciones puede realizar cada usuario</p>
        </div>
        <button className="btn-red" onClick={saveAllPermissions} disabled={saving}>
          {saving ? '💾 Guardando...' : '💾 Guardar Todos los Cambios'}
        </button>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="users-list">
            <h5 style={{ padding: '15px', margin: 0, color: '#d32f2f', borderBottom: '1px solid #3d3d3d' }}>
              👥 Usuarios
            </h5>
            {users.map(user => (
              <div
                key={user.id}
                className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                onClick={() => handleSelectUser(user)}
              >
                <div>
                  <div className="user-name">{user.first_name} {user.last_name}</div>
                  <div className="user-email">@{user.username}</div>
                </div>
                <span className={`user-role-badge ${getRoleClass(user.role)}`}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Gerente' : 'Empleado'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-8 mb-3">
          {selectedUser ? (
            <div className="permissions-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ color: '#d32f2f', margin: 0 }}>
                  🔧 Permisos de: {selectedUser.first_name} {selectedUser.last_name}
                </h4>
                <button className="btn-outline-red" onClick={() => resetUserPermissions(selectedUser.id)}>
                  🔄 Restablecer
                </button>
              </div>
              
              {selectedUser.role === 'admin' ? (
                <div style={{ backgroundColor: 'rgba(33,150,243,0.1)', border: '1px solid #2196f3', borderRadius: '8px', padding: '15px' }}>
                  <span style={{ fontSize: '20px', marginRight: '10px' }}>👑</span>
                  Los administradores tienen acceso TOTAL a todos los módulos y permisos.
                </div>
              ) : (
                <>
                  {modules.map(module => (
                    <div key={module.key} className="module-section">
                      <div className="module-header">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={isModuleActive(selectedUser.id, module.key)}
                            onChange={() => toggleModuleForUser(selectedUser.id, module.key)}
                          />
                          <span className="slider"></span>
                        </label>
                        <div>
                          <h4 className="module-name">{module.name}</h4>
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>{module.description}</p>
                        </div>
                      </div>
                      
                      {isModuleActive(selectedUser.id, module.key) && (
                        <div className="permissions-grid">
                          {permissionsByModule[module.key]?.map(permission => (
                            <div key={permission.key} className="permission-item">
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={isPermissionActive(selectedUser.id, permission.key)}
                                  onChange={() => togglePermissionForUser(selectedUser.id, permission.key)}
                                />
                                <span className="slider"></span>
                              </label>
                              <div>
                                <div className="permission-label">{permission.name}</div>
                                <div className="permission-description">{permission.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="permissions-panel text-center p-5">
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Selecciona un usuario para gestionar sus permisos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsManager;