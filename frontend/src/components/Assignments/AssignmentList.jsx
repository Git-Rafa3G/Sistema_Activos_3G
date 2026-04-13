import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const API_URL = 'http://127.0.0.1:8000/api';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    asset_id: '',
    employee_id: '',
    assignment_type: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  
  const { hasPermission } = useAuth();
  
  const [formData, setFormData] = useState({
    asset_id: '',
    employee_id: '',
    assignment_type: 'permanent',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, assetsRes, employeesRes] = await Promise.all([
        axios.get(`${API_URL}/assignments/`),
        axios.get(`${API_URL}/assets/`),
        axios.get(`${API_URL}/assignments/employees/`)
      ]);
      setAssignments(assignmentsRes.data);
      setAssets(assetsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función de filtrado
  const filteredAssignments = assignments.filter(ass => {
    // Búsqueda por texto
    const matchesSearch = 
      (ass.asset_code && ass.asset_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ass.employee_name && ass.employee_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Filtro por activo
    if (filters.asset_id && ass.asset_id !== parseInt(filters.asset_id)) return false;
    
    // Filtro por empleado
    if (filters.employee_id && ass.employee_id !== parseInt(filters.employee_id)) return false;
    
    // Filtro por tipo
    if (filters.assignment_type && ass.assignment_type !== filters.assignment_type) return false;
    
    // Filtro por estado
    if (filters.status && ((filters.status === 'active' && !ass.is_active) || (filters.status === 'inactive' && ass.is_active))) return false;
    
    // Filtro por fecha
    if (filters.startDate && ass.assignment_date && ass.assignment_date < filters.startDate) return false;
    if (filters.endDate && ass.assignment_date && ass.assignment_date > filters.endDate) return false;
    
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await axios.put(`${API_URL}/assignments/${editingAssignment.id}/`, formData);
        alert('Asignación actualizada correctamente');
      } else {
        await axios.post(`${API_URL}/assignments/`, formData);
        alert('Activo asignado correctamente');
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error al guardar la asignación');
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      asset_id: assignment.asset_id,
      employee_id: assignment.employee_id,
      assignment_type: assignment.assignment_type,
      notes: assignment.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta asignación? Se liberará el activo.')) {
      try {
        await axios.delete(`${API_URL}/assignments/${id}/`);
        loadData();
        alert('Asignación eliminada correctamente');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Error al eliminar la asignación');
      }
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm('¿Registrar devolución de este activo?')) {
      try {
        await axios.post(`${API_URL}/assignments/${id}/return/`, { return_notes: 'Devuelto en buen estado' });
        loadData();
        alert('Devolución registrada');
      } catch (error) {
        console.error('Error returning asset:', error);
        alert('Error al registrar devolución');
      }
    }
  };

  const resetForm = () => {
    setFormData({ asset_id: '', employee_id: '', assignment_type: 'permanent', notes: '' });
    setEditingAssignment(null);
    setShowForm(false);
  };

  const resetFilters = () => {
    setFilters({
      asset_id: '',
      employee_id: '',
      assignment_type: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
  };

  const handleExportExcel = () => {
    const exportData = filteredAssignments.map(ass => ({
      'Activo': ass.asset_code,
      'Empleado': ass.employee_name,
      'Fecha Asignación': new Date(ass.assignment_date).toLocaleDateString(),
      'Tipo': ass.assignment_type === 'permanent' ? 'Permanente' : 'Temporal',
      'Estado': ass.is_active ? 'Activo' : 'Devuelto',
      'Notas': ass.notes || '-'
    }));
    exportToExcel(exportData, 'asignaciones_filtradas', 'Asignaciones');
  };

  const handleExportPDF = () => {
    const exportData = filteredAssignments.map(ass => ({
      'Activo': ass.asset_code,
      'Empleado': ass.employee_name,
      'Fecha': new Date(ass.assignment_date).toLocaleDateString(),
      'Tipo': ass.assignment_type === 'permanent' ? 'Permanente' : 'Temporal',
      'Estado': ass.is_active ? 'Activo' : 'Devuelto'
    }));
    const columns = [
      { key: 'Activo', label: 'Activo' },
      { key: 'Empleado', label: 'Empleado' },
      { key: 'Fecha', label: 'Fecha' },
      { key: 'Tipo', label: 'Tipo' },
      { key: 'Estado', label: 'Estado' }
    ];
    exportToPDF(exportData, 'Reporte de Asignaciones', columns);
  };

  const availableAssets = assets.filter(a => a.status === 'available' || (editingAssignment && a.id === editingAssignment.asset_id));

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
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="text-red">🔗 Asignaciones</h2>
          <p className="text-gray">Gestión de asignaciones de activos a empleados</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-outline-red" onClick={() => setShowFilters(!showFilters)}>
            🔍 {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button className="btn-outline-red" onClick={handleExportExcel}>
            📊 Exportar Excel
          </button>
          <button className="btn-outline-red" onClick={handleExportPDF}>
            📄 Exportar PDF
          </button>
          {hasPermission('can_create_assignment') && (
            <button className="btn-red" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✖ Cancelar' : '+ Nueva Asignación'}
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar mb-4">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Buscar por activo o empleado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && <button onClick={() => setSearchTerm('')}>✖</button>}
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="card-custom mb-4">
          <h5 className="text-red mb-3">🔧 Filtros Avanzados</h5>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Activo</label>
              <select
                className="form-control"
                value={filters.asset_id}
                onChange={e => setFilters({...filters, asset_id: e.target.value})}
              >
                <option value="">Todos</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.code} - {asset.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Empleado</label>
              <select
                className="form-control"
                value={filters.employee_id}
                onChange={e => setFilters({...filters, employee_id: e.target.value})}
              >
                <option value="">Todos</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-control"
                value={filters.assignment_type}
                onChange={e => setFilters({...filters, assignment_type: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="permanent">Permanente</option>
                <option value="temporary">Temporal</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Estado</label>
              <select
                className="form-control"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Devuelto</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha desde</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha hasta</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div className="col-md-12 mb-3">
              <button className="btn-secondary-custom" onClick={resetFilters}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de asignación */}
      {showForm && (
        <div className="card-custom mb-4">
          <h5 className="text-red mb-3">
            {editingAssignment ? '✏️ Editar Asignación' : '📋 Nueva Asignación'}
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Activo</label>
                <select
                  className="form-control"
                  value={formData.asset_id}
                  onChange={e => setFormData({...formData, asset_id: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Seleccionar Activo</option>
                  {availableAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.code} - {asset.name} ({asset.brand || 'Sin marca'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Empleado</label>
                <select
                  className="form-control"
                  value={formData.employee_id}
                  onChange={e => setFormData({...formData, employee_id: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Seleccionar Empleado</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.code} - {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Tipo</label>
                <select
                  className="form-control"
                  value={formData.assignment_type}
                  onChange={e => setFormData({...formData, assignment_type: e.target.value})}
                >
                  <option value="permanent">Permanente</option>
                  <option value="temporary">Temporal</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Notas</label>
                <textarea
                  className="form-control"
                  rows="1"
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn-red">
                {editingAssignment ? 'Actualizar' : 'Asignar'}
              </button>
              <button type="button" className="btn-secondary-custom" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resultados y tabla */}
      <div className="card-custom">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-red mb-0">📋 Historial de Asignaciones</h5>
          <span className="badge badge-info">{filteredAssignments.length} asignaciones encontradas</span>
        </div>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Activo</th>
                <th>Empleado</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-gray">
                    No hay asignaciones que coincidan con los filtros
                   </td>
                </tr>
              ) : (
                filteredAssignments.map(ass => (
                  <tr key={ass.id}>
                    <td><strong>{ass.asset_code}</strong><br/><small className="text-gray">{ass.asset_name}</small></td>
                    <td><strong>{ass.employee_name}</strong></td>
                    <td>{new Date(ass.assignment_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${ass.assignment_type === 'permanent' ? 'badge-info' : 'badge-secondary'}`}>
                        {ass.assignment_type === 'permanent' ? 'Permanente' : 'Temporal'}
                      </span>
                    </td>
                    <td>
                      {ass.is_active ? (
                        <span className="badge badge-warning">Activo</span>
                      ) : (
                        <span className="badge badge-secondary">Devuelto</span>
                      )}
                    </td>
                    <td><small>{ass.notes || '-'}</small></td>
                    <td>
                      {ass.is_active && hasPermission('can_return_assignment') && (
                        <button className="btn btn-sm btn-success me-1" onClick={() => handleReturn(ass.id)}>
                          Devolver
                        </button>
                      )}
                      {hasPermission('can_edit_asset') && (
                        <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(ass)}>
                          ✏️
                        </button>
                      )}
                      {hasPermission('can_delete_asset') && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ass.id)}>
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

export default AssignmentList;