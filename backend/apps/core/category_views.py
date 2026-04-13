from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from apps.core.utils import (
    get_all_categories, get_category_by_id, 
    create_category, update_category, delete_category
)

@api_view(['GET', 'POST'])
def category_list(request):
    try:
        if request.method == 'GET':
            categories = get_all_categories()
            return Response(categories)
        
        elif request.method == 'POST':
            new_category = create_category(request.data)
            return Response(new_category, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error en category_list: {e}")
        return Response([], status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE'])
def category_detail(request, pk):
    try:
        if request.method == 'GET':
            category = get_category_by_id(pk)
            if category:
                return Response(category)
            return Response({'error': 'Categoría no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'PUT':
            updated = update_category(pk, request.data)
            if updated:
                return Response(updated)
            return Response({'error': 'Categoría no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'DELETE':
            delete_category(pk)
            return Response({'message': 'Categoría eliminada'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        print(f"Error en category_detail: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)