from django.urls import path
from . import category_views

urlpatterns = [
    path('', category_views.category_list, name='category-list'),
    path('<int:pk>/', category_views.category_detail, name='category-detail'),
]