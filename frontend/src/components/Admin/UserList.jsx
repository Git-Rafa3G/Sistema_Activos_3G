import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const { user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    is_active: true
  });

  // Módulos disponibles para asignar permisos
  const availableModules = [
    { key: 'assets', name: 'Activos', description: 'Gestión de activos' },
    { key: 'employees', name: 'Empleados', description: 'Gestión de empleados' },
    { key: 'assignments', name: 'Asignaciones', description: 'Asignación de activos' },
    { key: 'maintenance', name: 'Mantenimiento', description: 'Gestión de mantenimientos' },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      loadUserPermissions();
    }
  }, [users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = () => {
    const savedPermissions = localStorage.getItem('userPermissions');
    if (savedPermissions) {
      setUserPermissions(JSON.parse(savedPermissions));
    } else {
      // Permisos por defecto basados en rol
      const defaultPermissions = {};
      users.forEach(user => {
        if (user.role === 'admin') {
          defaultPermissions[user.id] = availableModules.map(m => m.key);
        } else if (user.role === 'manager') {
          defaultPermissions[user.id] = ['assets', 'employees', 'assignments', 'maintenance'];
        } else {
          defaultPermissions[user.id] = ['assets'];
        }
      });
      setUserPermissions(defaultPermissions);
      localStorage.setItem('userPermissions', JSON.stringify(defaultPermissions));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
        alert('Usuario actualizado correctamente');
      } else {
        await userService.create(formData);
        alert('Usuario creado correctamente');
      }
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar el usuario');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      alert('No puedes eliminar tu propio usuario');
      return;
    }
    if (window.confirm('¿Eliminar este usuario permanentemente?')) {
      try {
        await userService.delete(id);
        loadUsers();
        alert('Usuario eliminado correctamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.update(user.id, { ...user, is_active: !user.is_active });
      loadUsers();
      alert(`Usuario ${!user.is_active ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error al cambiar estado del usuario');
    }
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const saveUserPermissions = () => {
    localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
    alert(`Permisos guardados para ${selectedUser?.first_name} ${selectedUser?.last_name}`);
    setShowPermissionsModal(false);
  };

  const toggleModuleForUser = (userId, moduleKey) => {
    setUserPermissions(prev => {
      const current = prev[userId] || [];
      const updated = current.includes(moduleKey)
        ? current.filter(m => m !== moduleKey)
        : [...current, moduleKey];
      return { ...prev, [userId]: updated };
    });
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'employee',
      is_active: true
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleBadge = (role) => {
    const badges = {
      'admin': 'bg-danger',
      'manager': 'bg-warning',
      'employee': 'bg-info'
    };
    return badges[role] || 'bg-secondary';
  };

  const getRoleText = (role) => {
    const texts = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'employee': 'Empleado'
    };
    return texts[role] || role;
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-red">👑 Usuarios del Sistema</h2>
          <p className="text-gray">Gestión de usuarios, roles y permisos</p>
        </div>
        <button 
          className="btn-red" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖ Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Formulario de Usuario */}
      {showForm && (
        <div className="card-custom mb-4">
          <h5 className="text-red mb-3">
            {editingUser ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Usuario *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.first_name} 
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Apellido *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.last_name} 
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email *</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Rol</label>
                <select 
                  className="form-control" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="employee">Empleado</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn-red">
                {editingUser ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" className="btn-secondary-custom" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="card-custom">
        <h5 className="text-red mb-3">📋 Lista de Usuarios</h5>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Módulos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-gray">No hay usuarios registrados</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td><code>{user.username}</code></td>
                    <td><strong>{user.first_name} {user.last_name}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn btn-sm ${user.is_active ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => openPermissionsModal(user)}
                      >
                        📋 Permisos
                      </button>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-1" 
                        onClick={() => handleEdit(user)}
                      >
                        ✏️
                      </button>
                      {user.id !== currentUser?.id && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(user.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Permisos por Usuario */}
      {showPermissionsModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ backgroundColor: '#2d2d2d', color: 'white' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #d32f2f' }}>
                <h5 className="modal-title text-red">
                  🔐 Permisos de {selectedUser.first_name} {selectedUser.last_name}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPermissionsModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-gray mb-3">
                  Selecciona los módulos a los que este usuario tendrá acceso:
                </p>
                <div className="row">
                  {availableModules.map(module => (
                    <div className="col-md-6 mb-3" key={module.key}>
                      <div className="card p-3" style={{ backgroundColor: '#1e1e1e', border: '1px solid #444' }}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`module-${module.key}`}
                            style={{
                              width: '50px',
                              height: '25px',
                              backgroundColor: (userPermissions[selectedUser.id] || []).includes(module.key) ? '#d32f2f' : '#555',
                              borderColor: (userPermissions[selectedUser.id] || []).includes(module.key) ? '#d32f2f' : '#555',
                              cursor: 'pointer'
                            }}
                            checked={(userPermissions[selectedUser.id] || []).includes(module.key)}
                            onChange={() => toggleModuleForUser(selectedUser.id, module.key)}
                            disabled={selectedUser.role === 'admin'}
                          />
                          <label className="form-check-label ms-3" htmlFor={`module-${module.key}`}>
                            <strong className="text-white">{module.name}</strong>
                            <br />
                            <small className="text-gray">{module.description}</small>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedUser.role === 'admin' && (
                  <div className="alert alert-info mt-3">
                    <i className="bi bi-info-circle"></i> Los administradores tienen acceso a TODOS los módulos por defecto.
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #444' }}>
                <button type="button" className="btn-secondary-custom" onClick={() => setShowPermissionsModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn-red" onClick={saveUserPermissions}>
                  Guardar Permisos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-check-input:checked {
          background-color: #d32f2f;
          border-color: #d32f2f;
        }
        .form-check-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(211, 47, 47, 0.25);
        }
        .modal-content {
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default UserList;