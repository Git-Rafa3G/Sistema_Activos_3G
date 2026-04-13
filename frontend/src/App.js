import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/global.css';

import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import AssetList from './components/Assets/AssetList';
import EmployeeList from './components/Employees/EmployeeList';
import AssignmentList from './components/Assignments/AssignmentList';
import MaintenanceList from './components/Maintenance/MaintenanceList';
import CategoryList from './components/Categories/CategoryList';
import UserList from './components/Admin/UserList';
import ModuleManager from './components/Admin/ModuleManager';
import UserPermissionsManager from './components/Admin/UserPermissionsManager';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-5">Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute><AssetList /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><AssignmentList /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenanceList /></ProtectedRoute>} />
        
        {user?.role === 'admin' && (
          <>
            <Route path="/users" element={<UserList />} />
            <Route path="/modules" element={<ModuleManager />} />
            <Route path="/permissions" element={<UserPermissionsManager />} />
          </>
        )}
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;