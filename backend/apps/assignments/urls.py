from django.urls import path
from . import views

urlpatterns = [
    # Empleados
    path('employees/', views.employee_list, name='employee-list'),
    path('employees/<int:pk>/', views.employee_detail, name='employee-detail'),
    
    # Asignaciones
    path('', views.assignment_list, name='assignment-list'),
    path('<int:pk>/', views.assignment_detail, name='assignment-detail'),
    path('active/', views.active_assignments, name='active-assignments'),
]