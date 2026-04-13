from django.urls import path
from . import views

urlpatterns = [
    path('', views.asset_list, name='asset-list'),
    path('<int:pk>/', views.asset_detail, name='asset-detail'),
]