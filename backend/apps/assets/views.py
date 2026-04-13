from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from apps.core.utils import get_all_assets, get_asset_by_id, create_asset, update_asset, delete_asset

@api_view(['GET', 'POST'])
def asset_list(request):
    try:
        if request.method == 'GET':
            assets = get_all_assets()
            print(f"Devolviendo {len(assets)} activos")  # Debug
            return Response(assets)
        
        elif request.method == 'POST':
            print("Creando activo:", request.data)
            new_asset = create_asset(request.data)
            if new_asset:
                return Response(new_asset, status=status.HTTP_201_CREATED)
            return Response({'error': 'Error al crear activo'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error en asset_list: {e}")
        return Response([], status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE'])
def asset_detail(request, pk):
    try:
        if request.method == 'GET':
            asset = get_asset_by_id(pk)
            if asset:
                return Response(asset)
            return Response({'error': 'Activo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'PUT':
            updated = update_asset(pk, request.data)
            if updated:
                return Response(updated)
            return Response({'error': 'Activo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'DELETE':
            delete_asset(pk)
            return Response({'message': 'Activo eliminado'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        print(f"Error en asset_detail: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)