import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Exportar a Excel
export const exportToExcel = (data, filename, sheetName = 'Datos') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`);
};

// Exportar a PDF
export const exportToPDF = (data, title, columns) => {
  const doc = new jsPDF('landscape');
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(211, 47, 47);
  doc.text(title, 14, 20);
  
  // Fecha y hora
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
  
  // Usuario
  const user = localStorage.getItem('currentUser');
  if (user) {
    const userData = JSON.parse(user);
    doc.text(`Usuario: ${userData.first_name} ${userData.last_name} (${userData.role})`, 14, 38);
  }
  
  // Tabla
  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: data.map(item => columns.map(col => item[col.key] || '-')),
    startY: 45,
    theme: 'striped',
    headStyles: { fillColor: [211, 47, 47], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 }
  });
  
  doc.save(`${title.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Exportar activos específicos
export const exportAssets = (assets, filtered = false) => {
  const data = assets.map(asset => ({
    'Código': asset.code,
    'Nombre': asset.name,
    'Marca': asset.brand || '-',
    'Modelo': asset.model || '-',
    'Serie': asset.serial_number || '-',
    'Estado': asset.status === 'available' ? 'Disponible' : 
               asset.status === 'assigned' ? 'Asignado' : 
               asset.status === 'maintenance' ? 'Mantenimiento' : 
               asset.status === 'repair' ? 'Reparación' : 'Dado de Baja',
    'Valor': `$${asset.purchase_price?.toLocaleString() || 0}`,
    'Fecha Compra': asset.purchase_date || '-'
  }));
  
  exportToExcel(data, `activos_${filtered ? 'filtrados' : 'todos'}`, 'Activos');
};

// Exportar asignaciones específicas
export const exportAssignments = (assignments, filtered = false) => {
  const data = assignments.map(ass => ({
    'Activo': ass.asset_code,
    'Empleado': ass.employee_name,
    'Fecha Asignación': new Date(ass.assignment_date).toLocaleDateString(),
    'Tipo': ass.assignment_type === 'permanent' ? 'Permanente' : 'Temporal',
    'Estado': ass.is_active ? 'Activo' : 'Devuelto',
    'Notas': ass.notes || '-'
  }));
  
  exportToExcel(data, `asignaciones_${filtered ? 'filtradas' : 'todas'}`, 'Asignaciones');
};

// Exportar mantenimientos específicos
export const exportMaintenances = (maintenances, filtered = false) => {
  const data = maintenances.map(m => ({
    'Activo': m.asset_code,
    'Tipo': m.maintenance_type === 'preventive' ? 'Preventivo' :
            m.maintenance_type === 'corrective' ? 'Correctivo' : 'Predictivo',
    'Descripción': m.description,
    'Fecha Programada': new Date(m.scheduled_date).toLocaleDateString(),
    'Estado': m.status === 'scheduled' ? 'Programado' : 
              m.status === 'completed' ? 'Completado' : m.status,
    'Costo': m.cost ? `$${m.cost.toLocaleString()}` : '-'
  }));
  
  exportToExcel(data, `mantenimientos_${filtered ? 'filtrados' : 'todos'}`, 'Mantenimientos');
};