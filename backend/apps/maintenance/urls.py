from django.urls import path
from . import views

urlpatterns = [
    path('', views.maintenance_list, name='maintenance-list'),
    path('<int:pk>/', views.maintenance_detail, name='maintenance-detail'),
    path('<int:pk>/complete/', views.complete_maintenance_view, name='complete-maintenance'),
]