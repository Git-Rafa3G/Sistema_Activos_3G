import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const API_URL = 'http://127.0.0.1:8000/api';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const { hasPermission } = useAuth();
  
  const [filters, setFilters] = useState({
    category_id: '',
    status: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: ''
  });
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category_id: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: '',
    status: 'available',
    parent_asset_id: ''
  });

  // Función para cargar activos
  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Cargando activos desde el backend...');
      const res = await axios.get(`${API_URL}/assets/`);
      console.log('Activos recibidos:', res.data);
      setAssets(res.data);
    } catch (error) {
      console.error('Error loading assets:', error);
      setError('Error al cargar los activos. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/categories/`);
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAssets();
    loadCategories();
  }, [loadAssets, loadCategories]);

  // Filtrar activos
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.brand && asset.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filters.category_id && asset.category_id !== parseInt(filters.category_id)) return false;
    if (filters.status && asset.status !== filters.status) return false;
    if (filters.brand && asset.brand !== filters.brand) return false;
    if (filters.minPrice && (asset.purchase_price || 0) < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && (asset.purchase_price || 0) > parseFloat(filters.maxPrice)) return false;
    
    return true;
  });

  // Guardar activo
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = {
        code: formData.code,
        name: formData.name,
        description: formData.description || '',
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        brand: formData.brand || '',
        model: formData.model || '',
        serial_number: formData.serial_number || '',
        purchase_date: formData.purchase_date || null,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        status: formData.status
      };

      if (editingAsset) {
        await axios.put(`${API_URL}/assets/${editingAsset.id}/`, formDataToSend);
        alert('Activo actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/assets/`, formDataToSend);
        alert('Activo creado correctamente');
      }
      
      resetForm();
      await loadAssets(); // Recargar datos después de guardar
      
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Error al guardar el activo: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      code: asset.code,
      name: asset.name,
      description: asset.description || '',
      category_id: asset.category_id || '',
      brand: asset.brand || '',
      model: asset.model || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || '',
      purchase_price: asset.purchase_price || '',
      status: asset.status,
      parent_asset_id: asset.parent_asset_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este activo permanentemente?')) {
      try {
        await axios.delete(`${API_URL}/assets/${id}/`);
        await loadAssets();
        alert('Activo eliminado correctamente');
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error al eliminar el activo');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      category_id: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      purchase_price: '',
      status: 'available',
      parent_asset_id: ''
    });
    setEditingAsset(null);
    setShowForm(false);
  };

  const resetFilters = () => {
    setFilters({
      category_id: '',
      status: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
  };

  const handleExportExcel = () => {
    const exportData = filteredAssets.map(asset => ({
      'Código': asset.code,
      'Nombre': asset.name,
      'Marca': asset.brand || '-',
      'Modelo': asset.model || '-',
      'Estado': asset.status === 'available' ? 'Disponible' : 
                asset.status === 'assigned' ? 'Asignado' : 'Mantenimiento',
      'Valor': `$${asset.purchase_price?.toLocaleString() || 0}`
    }));
    exportToExcel(exportData, 'activos', 'Activos');
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Sin categoría';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'available': 'badge-success',
      'assigned': 'badge-warning',
      'maintenance': 'badge-danger',
      'repair': 'badge-info',
      'disposed': 'badge-secondary'
    };
    return badges[status] || 'badge-secondary';
  };

  const getStatusText = (status) => {
    const texts = {
      'available': 'Disponible',
      'assigned': 'Asignado',
      'maintenance': 'Mantenimiento',
      'repair': 'Reparación',
      'disposed': 'Dado de Baja'
    };
    return texts[status] || status;
  };

  const uniqueBrands = [...new Set(assets.map(a => a.brand).filter(b => b))];

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-gray mt-2">Cargando activos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-custom text-center p-5">
        <div className="text-danger" style={{ fontSize: '48px' }}>⚠️</div>
        <h4 className="text-red mt-3">{error}</h4>
        <button className="btn-red mt-3" onClick={loadAssets}>Reintentar</button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="text-red">📦 Activos</h2>
          <p className="text-gray">Gestión de activos e inventario</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-outline-red" onClick={loadAssets}>
            🔄 Recargar
          </button>
          <button className="btn-outline-red" onClick={() => setShowFilters(!showFilters)}>
            🔍 {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button className="btn-outline-red" onClick={handleExportExcel}>
            📊 Exportar Excel
          </button>
          {hasPermission('can_create_asset') && (
            <button className="btn-red" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✖ Cancelar' : '+ Nuevo Activo'}
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar mb-4">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Buscar por código, nombre, marca o serie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}>✖</button>
        )}
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="card-custom mb-4">
          <h5 className="text-red mb-3">🔧 Filtros Avanzados</h5>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Categoría</label>
              <select className="form-control" value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})}>
                <option value="">Todas</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Estado</label>
              <select className="form-control" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                <option value="">Todos</option>
                <option value="available">Disponible</option>
                <option value="assigned">Asignado</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Marca</label>
              <select className="form-control" value={filters.brand} onChange={e => setFilters({...filters, brand: e.target.value})}>
                <option value="">Todas</option>
                {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Precio Min/Max</label>
              <div className="d-flex gap-2">
                <input type="number" className="form-control" placeholder="Mín" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} />
                <input type="number" className="form-control" placeholder="Máx" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} />
              </div>
            </div>
            <div className="col-md-12">
              <button className="btn-secondary-custom" onClick={resetFilters}>Limpiar Filtros</button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card-custom mb-4">
          <h5 className="text-red mb-3">{editingAsset ? '✏️ Editar Activo' : '➕ Nuevo Activo'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Código *</label>
                <input type="text" className="form-control" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Nombre *</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Estado</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="available">Disponible</option>
                  <option value="assigned">Asignado</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Categoría</label>
                <select className="form-control" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                  <option value="">Seleccionar</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Marca</label>
                <input type="text" className="form-control" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Modelo</label>
                <input type="text" className="form-control" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">N° Serie</label>
                <input type="text" className="form-control" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Valor</label>
                <input type="number" className="form-control" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Fecha Compra</label>
                <input type="date" className="form-control" value={formData.purchase_date} onChange={e => setFormData({...formData, purchase_date: e.target.value})} />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn-red">{editingAsset ? 'Actualizar' : 'Guardar'}</button>
              <button type="button" className="btn-secondary-custom" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de activos */}
      <div className="card-custom">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-red mb-0">📋 Lista de Activos</h5>
          <span className="badge badge-info">{filteredAssets.length} activos encontrados</span>
        </div>
        {filteredAssets.length === 0 && assets.length > 0 && (
          <div className="alert alert-info">
            No hay activos que coincidan con los filtros. <button className="btn-link" onClick={resetFilters}>Limpiar filtros</button>
          </div>
        )}
        {assets.length === 0 && !loading && (
          <div className="alert alert-info">
            No hay activos registrados. Haz clic en "+ Nuevo Activo" para crear tu primer activo.
          </div>
        )}
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Estado</th>
                <th>Valor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id}>
                  <td><code>{asset.code}</code></td>
                  <td><strong>{asset.name}</strong></td>
                  <td>{getCategoryName(asset.category_id)}</td>
                  <td>{asset.brand || '-'}</td>
                  <td><span className={`badge ${getStatusBadge(asset.status)}`}>{getStatusText(asset.status)}</span></td>
                  <td>${asset.purchase_price?.toLocaleString() || 0}</td>
                  <td>
                    {hasPermission('can_edit_asset') && (
                      <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(asset)}>✏️</button>
                    )}
                    {hasPermission('can_delete_asset') && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(asset.id)}>🗑️</button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && assets.length > 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-gray">
                    No hay activos que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetList;