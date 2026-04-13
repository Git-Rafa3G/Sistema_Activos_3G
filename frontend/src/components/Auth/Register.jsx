import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', first_name: '', last_name: '', role: 'employee'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.register(formData);
      setSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="text-red text-center mb-4">Registro</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" className="form-control mb-2" placeholder="Usuario" onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input type="password" className="form-control mb-2" placeholder="Contraseña" onChange={e => setFormData({...formData, password: e.target.value})} required />
          <input type="email" className="form-control mb-2" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="text" className="form-control mb-2" placeholder="Nombre" onChange={e => setFormData({...formData, first_name: e.target.value})} required />
          <input type="text" className="form-control mb-2" placeholder="Apellido" onChange={e => setFormData({...formData, last_name: e.target.value})} required />
          <select className="form-control mb-3" onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="employee">Empleado</option>
            <option value="manager">Gerente</option>
          </select>
          <button type="submit" className="btn-red w-100 py-2">Registrarse</button>
        </form>
        <div className="text-center mt-3">
          <Link to="/login" className="text-red">← Volver al Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;