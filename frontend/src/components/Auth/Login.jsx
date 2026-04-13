import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/login.css';
import logo from '../../assets/images/logo.svg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(username, password);
    
    if (result.success) {
      // Forzar navegación después del login
      window.location.href = '/dashboard';
    } else {
      setError('Usuario o contraseña incorrectos');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Sistema Activos 3G" />
        </div>
        
        <h1 className="login-title">Sistema Activos 3G</h1>
        <p className="login-subtitle">Control de Activos e Inventario</p>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(211,47,47,0.2)', color: '#d32f2f', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="Ingresa tu usuario"
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        <div className="login-footer">
          <Link to="/register">¿No tienes cuenta? Regístrate</Link>
        </div>
        
        <div className="test-credentials">
          <strong>Credenciales de prueba:</strong><br />
          Usuario: admin / Contraseña: admin123
        </div>
      </div>
    </div>
  );
};

export default Login;