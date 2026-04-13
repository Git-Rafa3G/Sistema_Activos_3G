from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from apps.core.utils import (
    get_all_employees, get_employee_by_id, create_employee, 
    update_employee, delete_employee,
    get_all_assignments, get_assignment_by_id, create_assignment, 
    return_assignment, get_active_assignments,
    load_data, save_data, get_asset_by_id, update_asset
)

# ========== VISTAS PARA EMPLEADOS ==========
@api_view(['GET', 'POST'])
def employee_list(request):
    try:
        if request.method == 'GET':
            employees = get_all_employees()
            return Response(employees)
        
        elif request.method == 'POST':
            new_employee = create_employee(request.data)
            return Response(new_employee, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error en employee_list: {e}")
        return Response([], status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE'])
def employee_detail(request, pk):
    try:
        if request.method == 'GET':
            employee = get_employee_by_id(pk)
            if employee:
                return Response(employee)
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'PUT':
            updated = update_employee(pk, request.data)
            if updated:
                return Response(updated)
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'DELETE':
            delete_employee(pk)
            return Response({'message': 'Empleado eliminado'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        print(f"Error en employee_detail: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== VISTAS PARA ASIGNACIONES ==========
@api_view(['GET', 'POST'])
def assignment_list(request):
    try:
        if request.method == 'GET':
            assignments = get_all_assignments()
            for ass in assignments:
                asset = get_asset_by_id(ass.get('asset_id'))
                employee = get_employee_by_id(ass.get('employee_id'))
                ass['asset_code'] = asset.get('code') if asset else 'N/A'
                ass['asset_name'] = asset.get('name') if asset else 'N/A'
                ass['employee_name'] = f"{employee.get('first_name', '')} {employee.get('last_name', '')}" if employee else 'N/A'
            return Response(assignments)
        
        elif request.method == 'POST':
            new_assignment = create_assignment(request.data)
            return Response(new_assignment, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error en assignment_list: {e}")
        return Response([], status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE', 'POST'])
def assignment_detail(request, pk):
    try:
        if request.method == 'GET':
            assignment = get_assignment_by_id(pk)
            if assignment:
                return Response(assignment)
            return Response({'error': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'PUT':
            assignment = get_assignment_by_id(pk)
            if assignment:
                for key, value in request.data.items():
                    if key in assignment:
                        assignment[key] = value
                data = load_data()
                assignments = data.get('assignments', [])
                for i, ass in enumerate(assignments):
                    if ass.get('id') == pk:
                        assignments[i] = assignment
                        break
                data['assignments'] = assignments
                save_data(data)
                return Response(assignment)
            return Response({'error': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'DELETE':
            assignment = get_assignment_by_id(pk)
            if assignment:
                asset = get_asset_by_id(assignment.get('asset_id'))
                if asset and asset.get('status') == 'assigned':
                    asset['status'] = 'available'
                    update_asset(asset['id'], asset)
                data = load_data()
                assignments = data.get('assignments', [])
                new_assignments = [a for a in assignments if a.get('id') != pk]
                data['assignments'] = new_assignments
                save_data(data)
                return Response({'message': 'Asignación eliminada'})
            return Response({'error': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'POST':
            return_notes = request.data.get('return_notes', '')
            returned = return_assignment(pk, return_notes)
            if returned:
                return Response(returned)
            return Response({'error': 'Asignación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en assignment_detail: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def active_assignments(request):
    try:
        assignments = get_active_assignments()
        return Response(assignments)
    except Exception as e:
        print(f"Error en active_assignments: {e}")
        return Response([], status=status.HTTP_200_OK)