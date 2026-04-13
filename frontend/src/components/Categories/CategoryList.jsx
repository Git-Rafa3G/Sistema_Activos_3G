import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission, user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#d32f2f'
  });

  // Verificar si el usuario puede gestionar categorías (solo admin y managers)
  const canManageCategories = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/categories/`);
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageCategories) {
      alert('No tienes permiso para gestionar categorías');
      return;
    }
    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory.id}/`, formData);
        alert('Categoría actualizada correctamente');
      } else {
        await axios.post(`${API_URL}/categories/`, formData);
        alert('Categoría creada correctamente');
      }
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleEdit = (category) => {
    if (!canManageCategories) {
      alert('No tienes permiso para editar categorías');
      return;
    }
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#d32f2f'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!canManageCategories) {
      alert('No tienes permiso para eliminar categorías');
      return;
    }
    if (window.confirm('¿Eliminar esta categoría? Los activos quedarán sin categoría.')) {
      try {
        await axios.delete(`${API_URL}/categories/${id}/`);
        loadCategories();
        alert('Categoría eliminada correctamente');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error al eliminar la categoría');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#d32f2f' });
    setEditingCategory(null);
    setShowForm(false);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h2 className="text-red">🏷️ Categorías</h2>
          <p className="text-gray">Clasifica tus activos por categorías</p>
        </div>
        {canManageCategories && (
          <button className="btn-red" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancelar' : '+ Nueva Categoría'}
          </button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar mb-4">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}>✖</button>
        )}
      </div>

      {/* Formulario */}
      {showForm && canManageCategories && (
        <div className="card-custom mb-4">
          <h5 className="text-red mb-3">
            {editingCategory ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Color</label>
                <input
                  type="color"
                  className="form-control"
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  style={{ height: '42px' }}
                />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn-red">
                {editingCategory ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" className="btn-secondary-custom" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de categorías */}
      <div className="card-custom">
        <h5 className="text-red mb-3">📋 Lista de Categorías</h5>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Color</th>
                <th>Descripción</th>
                <th>Activos</th>
                {canManageCategories && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={canManageCategories ? 5 : 4} className="text-center text-gray">No hay categorías registradas</td>
                </tr>
              ) : (
                filteredCategories.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: cat.color,
                        borderRadius: '50%',
                        marginRight: '8px'
                      }}></span>
                      {cat.name}
                    </td>
                    <td>
                      <code>{cat.color}</code>
                    </td>
                    <td>{cat.description || '-'}</td>
                    <td><span className="badge badge-info">0</span></td>
                    {canManageCategories && (
                      <td>
                        <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(cat)}>
                          ✏️
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id)}>
                          🗑️
                        </button>
                      </td>
                    )}
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

export default CategoryList;