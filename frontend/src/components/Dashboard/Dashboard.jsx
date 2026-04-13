import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const API_URL = 'http://127.0.0.1:8000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_assets: 0,
    available_assets: 0,
    assigned_assets: 0,
    maintenance_assets: 0,
    total_employees: 0,
    active_assignments: 0,
    pending_maintenances: 0,
    total_assets_value: 0
  });
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Cargando datos del dashboard...');
      
      const [statsRes, assetsRes, categoriesRes, assignmentsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/`),
        axios.get(`${API_URL}/assets/`),
        axios.get(`${API_URL}/categories/`),
        axios.get(`${API_URL}/assignments/`)
      ]);
      
      console.log('Estadísticas recibidas:', statsRes.data);
      console.log('Activos recibidos:', assetsRes.data.length);
      console.log('Categorías recibidas:', categoriesRes.data.length);
      
      setStats(statsRes.data);
      setAssets(assetsRes.data);
      setCategories(categoriesRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Datos para gráfica de estado de activos
  const statusCounts = {
    available: assets.filter(a => a.status === 'available').length,
    assigned: assets.filter(a => a.status === 'assigned').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    repair: assets.filter(a => a.status === 'repair').length,
    disposed: assets.filter(a => a.status === 'disposed').length
  };

  const statusChartData = {
    labels: ['Disponibles', 'Asignados', 'Mantenimiento', 'Reparación', 'Dados de Baja'],
    datasets: [{
      data: [
        statusCounts.available,
        statusCounts.assigned,
        statusCounts.maintenance,
        statusCounts.repair,
        statusCounts.disposed
      ],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9e9e9e'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  // Datos para gráfica de activos por categoría
  const assetsByCategory = categories.map(cat => ({
    name: cat.name,
    count: assets.filter(a => a.category_id === cat.id).length,
    color: cat.color || `hsl(${Math.random() * 360}, 70%, 60%)`
  }));

  const categoryChartData = {
    labels: assetsByCategory.map(cat => cat.name),
    datasets: [{
      label: 'Cantidad de Activos',
      data: assetsByCategory.map(cat => cat.count),
      backgroundColor: assetsByCategory.map(cat => cat.color),
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  // Datos para gráfica de asignaciones por mes (últimos 6 meses)
  const getLast6Months = () => {
    const months = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(monthNames[date.getMonth()]);
    }
    return months;
  };

  const getMonthlyAssignments = () => {
    const monthlyData = [0, 0, 0, 0, 0, 0];
    const currentDate = new Date();
    
    assignments.forEach(assignment => {
      const assignDate = new Date(assignment.assignment_date);
      const monthDiff = (currentDate.getMonth() - assignDate.getMonth()) + 
                       ((currentDate.getFullYear() - assignDate.getFullYear()) * 12);
      
      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyData[5 - monthDiff]++;
      }
    });
    
    return monthlyData;
  };

  const trendsChartData = {
    labels: getLast6Months(),
    datasets: [{
      label: 'Asignaciones realizadas',
      data: getMonthlyAssignments(),
      borderColor: '#d32f2f',
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#d32f2f',
      pointBorderColor: '#ffffff',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#b0b0b0',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#2d2d2d',
        titleColor: '#ffffff',
        bodyColor: '#b0b0b0',
        borderColor: '#d32f2f',
        borderWidth: 1
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#3d3d3d' },
        ticks: { color: '#b0b0b0' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#b0b0b0' }
      }
    }
  };

  const statCards = [
    { title: 'Total Activos', value: stats.total_assets, icon: '📦', color: '#d32f2f' },
    { title: 'Disponibles', value: stats.available_assets, icon: '✅', color: '#4caf50' },
    { title: 'Asignados', value: stats.assigned_assets, icon: '👥', color: '#ff9800' },
    { title: 'Mantenimiento', value: stats.maintenance_assets, icon: '🔧', color: '#f44336' },
    { title: 'Empleados', value: stats.total_employees, icon: '👤', color: '#2196f3' },
    { title: 'Asignaciones Activas', value: stats.active_assignments, icon: '🔄', color: '#9c27b0' },
    { title: 'Mantenimientos Pendientes', value: stats.pending_maintenances, icon: '⚠️', color: '#ff5722' },
    { title: 'Valor Total', value: `$${stats.total_assets_value.toLocaleString()}`, icon: '💰', color: '#ffc107' },
  ];

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-gray mt-3">Cargando datos del dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h2 className="text-red">📊 Dashboard</h2>
          <p className="text-gray">Bienvenido, {user?.first_name} {user?.last_name}</p>
        </div>
        <div className="text-end">
          <small className="text-muted">Última actualización: {new Date().toLocaleString()}</small>
          <br />
          <small className="text-muted">Total de activos: {stats.total_assets}</small>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row">
        {statCards.map((card, index) => (
          <div className="col-md-3 col-sm-6 mb-3" key={index}>
            <div className="card-custom text-center" style={{ borderTop: `3px solid ${card.color}` }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{card.icon}</div>
              <h3 className="text-white mb-1">{card.value}</h3>
              <p className="text-gray mb-0">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card-custom">
            <h5 className="text-red mb-3">📈 Distribución por Estado</h5>
            <div style={{ height: '300px' }}>
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card-custom">
            <h5 className="text-red mb-3">📊 Activos por Categoría</h5>
            {assetsByCategory.length === 0 ? (
              <p className="text-gray text-center py-5">No hay categorías registradas</p>
            ) : (
              <div style={{ height: '300px' }}>
                <Bar data={categoryChartData} options={barChartOptions} />
              </div>
            )}
          </div>
        </div>

        <div className="col-md-12 mb-3">
          <div className="card-custom">
            <h5 className="text-red mb-3">📈 Tendencia de Asignaciones (últimos 6 meses)</h5>
            <div style={{ height: '350px' }}>
              <Line data={trendsChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen adicional */}
      <div className="row">
        <div className="col-md-12">
          <div className="card-custom">
            <h5 className="text-red mb-3">📋 Resumen de Activos</h5>
            <div className="row">
              <div className="col-md-3 mb-2">
                <div className="p-3 text-center" style={{ backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
                  <div className="text-success" style={{ fontSize: '24px' }}>✅</div>
                  <div className="fw-bold text-white">{statusCounts.available}</div>
                  <div className="text-muted small">Disponibles</div>
                </div>
              </div>
              <div className="col-md-3 mb-2">
                <div className="p-3 text-center" style={{ backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
                  <div className="text-warning" style={{ fontSize: '24px' }}>👥</div>
                  <div className="fw-bold text-white">{statusCounts.assigned}</div>
                  <div className="text-muted small">Asignados</div>
                </div>
              </div>
              <div className="col-md-3 mb-2">
                <div className="p-3 text-center" style={{ backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
                  <div className="text-danger" style={{ fontSize: '24px' }}>🔧</div>
                  <div className="fw-bold text-white">{statusCounts.maintenance}</div>
                  <div className="text-muted small">En Mantenimiento</div>
                </div>
              </div>
              <div className="col-md-3 mb-2">
                <div className="p-3 text-center" style={{ backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
                  <div className="text-info" style={{ fontSize: '24px' }}>💰</div>
                  <div className="fw-bold text-white">${stats.total_assets_value.toLocaleString()}</div>
                  <div className="text-muted small">Valor Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;