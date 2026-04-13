import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { hasPermission } = useAuth();
  
  const [formData, setFormData] = useState({
    code: '',
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    phone: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, formData);
        alert('Empleado actualizado correctamente');
      } else {
        await employeeService.create(formData);
        alert('Empleado creado correctamente');
      }
      resetForm();
      loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error al guardar el empleado');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      code: employee.code,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department || '',
      phone: employee.phone || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este empleado permanentemente?')) {
      try {
        await employeeService.delete(id);
        loadEmployees();
        alert('Empleado eliminado correctamente');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error al eliminar el empleado');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      first_name: '',
      last_name: '',
      email: '',
      department: '',
      phone: ''
    });
    setEditingEmployee(null);
    setShowForm(false);
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
          <h2 className="text-red">👥 Empleados</h2>
          <p className="text-white-50">Gestión de empleados de la empresa</p>
        </div>
        {hasPermission('can_create_employee') && (
          <button 
            className="btn-red px-4 py-2" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✖ Cancelar' : '+ Nuevo Empleado'}
          </button>
        )}
      </div>

      {/* Formulario de Empleado */}
      {showForm && (
        <div className="card-custom mb-4">
          <h5 className="text-red mb-3">
            {editingEmployee ? '✏️ Editar Empleado' : '👤 Nuevo Empleado'}
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label text-white">Código *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label text-white">Nombre *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.first_name} 
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label text-white">Apellido *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.last_name} 
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-white">Email *</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label text-white">Departamento</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label text-white">Teléfono</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn-red px-4 py-2">
                {editingEmployee ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" className="btn btn-secondary px-4 py-2" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Empleados */}
      <div className="card-custom">
        <h5 className="text-red mb-3">📋 Lista de Empleados</h5>
        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Departamento</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-white-50">No hay empleados registrados</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td><code>{emp.code}</code></td>
                    <td><strong>{emp.first_name} {emp.last_name}</strong></td>
                    <td>{emp.email}</td>
                    <td>{emp.department || '-'}</td>
                    <td>{emp.phone || '-'}</td>
                    <td>
                      {hasPermission('can_edit_employee') && (
                        <button 
                          className="btn btn-sm btn-warning me-1" 
                          onClick={() => handleEdit(emp)}
                        >
                          ✏️
                        </button>
                      )}
                      {hasPermission('can_delete_employee') && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(emp.id)}
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
    </div>
  );
};

export default EmployeeList;