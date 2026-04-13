import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const API_URL = 'http://127.0.0.1:8000/api';

const MaintenanceList = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { hasPermission } = useAuth();
  
  const [filters, setFilters] = useState({
    maintenance_type: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  
  const [formData, setFormData] = useState({
    asset_id: '',
    maintenance_type: 'preventive',
    description: '',
    scheduled_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [maintenancesRes, assetsRes] = await Promise.all([
        axios.get(`${API_URL}/maintenance/`),
        axios.get(`${API_URL}/assets/`)
      ]);
      setMaintenances(maintenancesRes.data);
      setAssets(assetsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaintenances = maintenances.filter(m => {
    const matchesSearch = 
      (m.asset_code && m.asset_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filters.maintenance_type && m.maintenance_type !== filters.maintenance_type) return false;
    if (filters.status && m.status !== filters.status) return false;
    if (filters.startDate && m.scheduled_date && m.scheduled_date < filters.startDate) return false;
    if (filters.endDate && m.scheduled_date && m.scheduled_date > filters.endDate) return false;
    
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMaintenance) {
        await axios.put(`${API_URL}/maintenance/${editingMaintenance.id}/`, formData);
        alert('Mantenimiento actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/maintenance/`, formData);
        alert('Mantenimiento programado correctamente');
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving maintenance:', error);
      alert('Error al guardar el mantenimiento');
    }
  };

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    setFormData({
      asset_id: maintenance.asset_id,
      maintenance_type: maintenance.maintenance_type,
      description: maintenance.description,
      scheduled_date: maintenance.scheduled_date
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este mantenimiento?')) {
      try {
        await axios.delete(`${API_URL}/maintenance/${id}/`);
        loadData();
        alert('Mantenimiento eliminado correctamente');
      } catch (error) {
        console.error('Error deleting maintenance:', error);
        alert('Error al eliminar el mantenimiento');
      }
    }
  };

  const handleComplete = async (id) => {
    const cost = prompt('Ingrese el costo del mantenimiento:');
    if (cost !== null && cost !== '') {
      try {
        await axios.post(`${API_URL}/maintenance/${id}/complete/`, { 
          cost: parseFloat(cost), 
          observations: 'Mantenimiento completado satisfactoriamente' 
        });
        loadData();
        alert('Mantenimiento completado');
      } catch (error) {
        console.error('Error completing maintenance:', error);
        alert('Error al completar mantenimiento');
      }
    }
  };

  const resetForm = () => {
    setFormData({ asset_id: '', maintenance_type: 'preventive', description: '', scheduled_date: '' });
    setEditingMaintenance(null);
    setShowForm(false);
  };

  const resetFilters = () => {
    setFilters({
      maintenance_type: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
  };

  const handleExportExcel = () => {
    const exportData = filteredMaintenances.map(m => ({
      'Activo': m.asset_code,
      'Tipo': m.maintenance_type === 'preventive' ? 'Preventivo' :
              m.maintenance_type === 'corrective' ? 'Correctivo' : 'Predictivo',
      'Descripción': m.description,
      'Fecha Programada': new Date(m.scheduled_date).toLocaleDateString(),
      'Estado': m.status === 'scheduled' ? 'Programado' : 'Completado',
      'Costo': m.cost ? `$${m.cost.toLocaleString()}` : '-'
    }));
    exportToExcel(exportData, 'mantenimientos', 'Mantenimientos');
  };

  const getMaintenanceTypeLabel = (type) => {
    const types = {
      'preventive': 'Preventivo',
      'corrective': 'Correctivo',
      'predictive': 'Predictivo'
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      'scheduled': 'Programado',
      'in_progress': 'En Progreso',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return statuses[status] || status;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'scheduled': 'badge-warning',
      'in_progress': 'badge-info',
      'completed': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  const availableAssets = assets.filter(a => a.status !== 'maintenance' || (editingMaintenance && a.id === editingMaintenance.asset_id));

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
          <h2 className="text-red">🔧 Mantenimiento</h2>
          <p className="text-gray">Programación y seguimiento de mantenimientos</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-outline-red" onClick={() => setShowFilters(!showFilters)}>
            🔍 {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button className="btn-outline-red" onClick={handleExportExcel}>
            📊 Exportar Excel
          </button>
          {hasPermission('can_create_maintenance') && (
            <button className="btn-red" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✖ Cancelar' : '+ Programar Mantenimiento'}
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar mb-4">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Buscar por activo o descripción..."
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
            <div className="col-md-3 mb-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-control"
                value={filters.maintenance_type}
                onChange={e => setFilters({...filters, maintenance_type: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="preventive">Preventivo</option>
                <option value="corrective">Correctivo</option>
                <option value="predictive">Predictivo</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Estado</label>
              <select
                className="form-control"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="scheduled">Programado</option>
                <option value="completed">Completado</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha desde</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha hasta</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div className="col-md-12">
              <button className="btn-secondary-custom" onClick={resetFilters}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card-custom mb-4">
          <h5 className="text-red mb-3">
            {editingMaintenance ? '✏️ Editar Mantenimiento' : '🔧 Programar Mantenimiento'}
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
                <label className="form-label">Tipo</label>
                <select
                  className="form-control"
                  value={formData.maintenance_type}
                  onChange={e => setFormData({...formData, maintenance_type: e.target.value})}
                >
                  <option value="preventive">Preventivo</option>
                  <option value="corrective">Correctivo</option>
                  <option value="predictive">Predictivo</option>
                </select>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Describa el mantenimiento a realizar..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Fecha Programada</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.scheduled_date}
                  onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn-red">
                {editingMaintenance ? 'Actualizar' : 'Programar'}
              </button>
              <button type="button" className="btn-secondary-custom" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de mantenimientos */}
      <div className="card-custom">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-red mb-0">📋 Historial de Mantenimientos</h5>
          <span className="badge badge-info">{filteredMaintenances.length} mantenimientos encontrados</span>
        </div>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Activo</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha Programada</th>
                <th>Estado</th>
                <th>Costo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-gray">
                    No hay mantenimientos que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                filteredMaintenances.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.asset_code}</strong><br/><small className="text-gray">{m.asset_name}</small></td>
                    <td><span className="badge badge-secondary">{getMaintenanceTypeLabel(m.maintenance_type)}</span></td>
                    <td><small>{m.description?.substring(0, 50)}...</small></td>
                    <td>{new Date(m.scheduled_date).toLocaleDateString()}</td>
                    <td><span className={`badge ${getStatusBadge(m.status)}`}>{getStatusLabel(m.status)}</span></td>
                    <td>{m.cost ? `$${m.cost.toLocaleString()}` : '-'}</td>
                    <td>
                      {m.status === 'scheduled' && hasPermission('can_complete_maintenance') && (
                        <button className="btn btn-sm btn-success me-1" onClick={() => handleComplete(m.id)}>
                          Completar
                        </button>
                      )}
                      {hasPermission('can_edit_asset') && (
                        <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(m)}>
                          ✏️
                        </button>
                      )}
                      {hasPermission('can_delete_asset') && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>
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

export default MaintenanceList;