from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from apps.core.utils import (
    get_all_maintenances, get_maintenance_by_id, 
    create_maintenance, complete_maintenance
)

@api_view(['GET', 'POST'])
def maintenance_list(request):
    try:
        if request.method == 'GET':
            maintenances = get_all_maintenances()
            # Enriquecer con datos del activo
            from apps.core.utils import get_asset_by_id
            for m in maintenances:
                asset = get_asset_by_id(m.get('asset_id'))
                m['asset_name'] = asset.get('name') if asset else 'N/A'
                m['asset_code'] = asset.get('code') if asset else 'N/A'
            return Response(maintenances)
        
        elif request.method == 'POST':
            new_maintenance = create_maintenance(request.data)
            return Response(new_maintenance, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error en maintenance_list: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'DELETE', 'POST'])
def maintenance_detail(request, pk):
    try:
        if request.method == 'GET':
            maintenance = get_maintenance_by_id(pk)
            if maintenance:
                return Response(maintenance)
            return Response({'error': 'Mantenimiento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'PUT':
            # Actualizar mantenimiento
            maintenance = get_maintenance_by_id(pk)
            if maintenance:
                # Actualizar datos
                for key, value in request.data.items():
                    if key in maintenance:
                        maintenance[key] = value
                # Guardar cambios
                from apps.core.utils import load_data, save_data
                data = load_data()
                maintenances = data.get('maintenances', [])
                for i, m in enumerate(maintenances):
                    if m.get('id') == pk:
                        maintenances[i] = maintenance
                        break
                data['maintenances'] = maintenances
                save_data(data)
                return Response(maintenance)
            return Response({'error': 'Mantenimiento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'DELETE':
            # Eliminar mantenimiento
            maintenance = get_maintenance_by_id(pk)
            if maintenance:
                from apps.core.utils import load_data, save_data, update_asset, get_asset_by_id
                # Liberar el activo si estaba en mantenimiento
                asset_id = maintenance.get('asset_id')
                if asset_id:
                    asset = get_asset_by_id(asset_id)
                    if asset and asset.get('status') == 'maintenance':
                        asset['status'] = 'available'
                        update_asset(asset_id, asset)
                # Eliminar mantenimiento
                data = load_data()
                maintenances = data.get('maintenances', [])
                new_maintenances = [m for m in maintenances if m.get('id') != pk]
                data['maintenances'] = new_maintenances
                save_data(data)
                return Response({'message': 'Mantenimiento eliminado'})
            return Response({'error': 'Mantenimiento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'POST':
            # Completar mantenimiento (si viene con la acción de completar)
            if request.data.get('cost') is not None:
                completed = complete_maintenance(pk, request.data)
                if completed:
                    return Response(completed)
            return Response({'error': 'Mantenimiento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        print(f"Error en maintenance_detail: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== NUEVA VISTA PARA COMPLETAR MANTENIMIENTO ==========
@api_view(['POST'])
def complete_maintenance_view(request, pk):
    """Vista específica para completar mantenimiento"""
    try:
        completed = complete_maintenance(pk, request.data)
        if completed:
            return Response(completed)
        return Response({'error': 'Mantenimiento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en complete_maintenance_view: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)