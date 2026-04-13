import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ModuleManager = () => {
  const { user, updateModuleAccess } = useAuth();
  const [config, setConfig] = useState({
    assets: true,
    employees: true,
    assignments: true,
    maintenance: true
  });
  const [saving, setSaving] = useState(false);

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const savedConfig = localStorage.getItem('moduleConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const modules = [
    { key: 'assets', name: '📦 Activos', description: 'Gestión de activos (CRUD completo)' },
    { key: 'employees', name: '👥 Empleados', description: 'Gestión de empleados (CRUD completo)' },
    { key: 'assignments', name: '🔗 Asignaciones', description: 'Asignación y devolución de activos' },
    { key: 'maintenance', name: '🔧 Mantenimiento', description: 'Programación y seguimiento de mantenimientos' },
  ];

  const handleToggle = (moduleKey) => {
    setConfig(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handleSave = () => {
    setSaving(true);
    // Guardar configuración en localStorage
    setTimeout(() => {
      localStorage.setItem('moduleConfig', JSON.stringify(config));
      if (updateModuleAccess) {
        updateModuleAccess(config);
      }
      setSaving(false);
      alert('✅ Configuración de módulos guardada exitosamente');
    }, 500);
  };

  const handleReset = () => {
    const defaultConfig = {
      assets: true,
      employees: true,
      assignments: true,
      maintenance: true
    };
    setConfig(defaultConfig);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="card-custom text-center p-5">
        <h3 className="text-red">⛔ Acceso Denegado</h3>
        <p className="text-white-50">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-red">⚙️ Gestión de Módulos</h2>
          <p className="text-white-50">Activa o desactiva módulos para los usuarios no administradores</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary px-4 py-2" onClick={handleReset}>
            🔄 Restablecer
          </button>
          <button className="btn-red px-4 py-2" onClick={handleSave} disabled={saving}>
            {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card-custom">
            <h5 className="text-red mb-3">📋 Configuración de Módulos</h5>
            <p className="text-white-50 mb-4">
              <small>
                Los módulos desactivados NO serán visibles para usuarios con rol "empleado" o "gerente". 
                El administrador siempre tiene acceso completo.
              </small>
            </p>
            
            <div className="table-responsive">
              <table className="table table-dark">
                <thead>
                  <tr>
                    <th>Módulo</th>
                    <th>Descripción</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map(module => (
                    <tr key={module.key}>
                      <td style={{ fontSize: '18px' }}>{module.name}</td>
                      <td className="text-white-50 small">{module.description}</td>
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            style={{
                              width: '50px',
                              height: '25px',
                              backgroundColor: config[module.key] ? '#d32f2f' : '#555',
                              borderColor: config[module.key] ? '#d32f2f' : '#555',
                              cursor: 'pointer'
                            }}
                            checked={config[module.key] || false}
                            onChange={() => handleToggle(module.key)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card-custom">
            <h5 className="text-red mb-3">ℹ️ Información</h5>
            <hr className="bg-red" />
            <div className="text-white-50 small">
              <p><strong className="text-white">🟢 Activado:</strong> El módulo es visible para todos los usuarios.</p>
              <p><strong className="text-white">🔴 Desactivado:</strong> El módulo solo es visible para administradores.</p>
              <hr />
              <p><strong className="text-white">👑 Administrador:</strong> Acceso completo siempre.</p>
              <p><strong className="text-white">👔 Gerente:</strong> Puede ver según configuración.</p>
              <p><strong className="text-white">👤 Empleado:</strong> Puede ver según configuración.</p>
            </div>
          </div>

          <div className="card-custom mt-3">
            <h5 className="text-red mb-3">📊 Resumen</h5>
            <hr className="bg-red" />
            <p className="mb-1">
              <strong className="text-white">Módulos activos:</strong>{' '}
              <span className="text-success">
                {Object.values(config).filter(v => v === true).length} / {modules.length}
              </span>
            </p>
            <p className="mb-0">
              <strong className="text-white">Módulos inactivos:</strong>{' '}
              <span className="text-danger">
                {Object.values(config).filter(v => v === false).length}
              </span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .form-check-input:checked {
          background-color: #d32f2f;
          border-color: #d32f2f;
        }
        .form-check-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(211, 47, 47, 0.25);
        }
      `}</style>
    </div>
  );
};

export default ModuleManager;