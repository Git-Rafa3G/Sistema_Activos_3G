from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from apps.core.utils import (
    get_dashboard_stats, 
    get_all_users, get_user_by_id, get_user_by_username,
    create_user, update_user, delete_user, verify_user,
    get_user_permissions
)

@api_view(['GET'])
def dashboard_stats(request):
    """Obtiene estadísticas para el dashboard"""
    stats = get_dashboard_stats()
    return Response(stats)

# ========== AUTENTICACIÓN ==========
@api_view(['POST'])
def register(request):
    """Registro de nuevo usuario"""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    role = request.data.get('role', 'employee')
    
    existing_user = get_user_by_username(username)
    if existing_user:
        return Response({'error': 'El usuario ya existe'}, status=status.HTTP_400_BAD_REQUEST)
    
    new_user = {
        'username': username,
        'password': password,
        'email': email,
        'first_name': first_name,
        'last_name': last_name,
        'role': role,
        'is_active': True
    }
    
    created_user = create_user(new_user)
    if created_user:
        created_user.pop('password', None)
        return Response({
            'message': 'Usuario registrado exitosamente',
            'user': created_user
        }, status=status.HTTP_201_CREATED)
    
    return Response({'error': 'Error al registrar usuario'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    """Inicio de sesión"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = verify_user(username, password)
    
    if user:
        user_copy = user.copy()
        user_copy.pop('password', None)
        permissions = get_user_permissions(user.get('role'))
        
        return Response({
            'message': 'Login exitoso',
            'user': user_copy,
            'permissions': permissions,
            'token': f"fake-jwt-token-{user.get('id')}"
        })
    
    return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_current_user(request):
    """Obtener usuario actual"""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer fake-jwt-token-'):
        user_id = int(auth_header.replace('Bearer fake-jwt-token-', ''))
        user = get_user_by_id(user_id)
        if user:
            user.pop('password', None)
            permissions = get_user_permissions(user.get('role'))
            return Response({'user': user, 'permissions': permissions})
    
    return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

# ========== ADMINISTRACIÓN DE USUARIOS ==========
@api_view(['GET', 'POST'])
def user_list(request):
    if request.method == 'GET':
        users = get_all_users()
        for user in users:
            user.pop('password', None)
        return Response(users)
    
    elif request.method == 'POST':
        new_user = create_user(request.data)
        if new_user:
            new_user.pop('password', None)
            return Response(new_user, status=status.HTTP_201_CREATED)
        return Response({'error': 'Error al crear usuario'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, pk):
    if request.method == 'GET':
        user = get_user_by_id(pk)
        if user:
            user.pop('password', None)
            return Response(user)
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'PUT':
        updated = update_user(pk, request.data)
        if updated:
            updated.pop('password', None)
            return Response(updated)
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE':
        delete_user(pk)
        return Response({'message': 'Usuario eliminado'}, status=status.HTTP_204_NO_CONTENT)