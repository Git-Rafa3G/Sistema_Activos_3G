import json
import os
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_FILE = BASE_DIR / 'db.json'

def load_data():
    """Carga los datos desde el archivo JSON"""
    if not os.path.exists(DATA_FILE):
        initial_data = {
            "assets": [],
            "employees": [],
            "assignments": [],
            "maintenances": [],
            "users": [],
            "categories": [],
            "next_ids": {
                "asset": 1,
                "employee": 1,
                "assignment": 1,
                "maintenance": 1,
                "user": 1,
                "category": 1
            }
        }
        save_data(initial_data)
        return initial_data
    
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
        if 'assets' not in data:
            data['assets'] = []
        if 'employees' not in data:
            data['employees'] = []
        if 'assignments' not in data:
            data['assignments'] = []
        if 'maintenances' not in data:
            data['maintenances'] = []
        if 'users' not in data:
            data['users'] = []
        if 'categories' not in data:
            data['categories'] = []
        if 'next_ids' not in data:
            data['next_ids'] = {}
        
        if 'asset' not in data['next_ids']:
            data['next_ids']['asset'] = len(data['assets']) + 1
        if 'employee' not in data['next_ids']:
            data['next_ids']['employee'] = len(data['employees']) + 1
        if 'assignment' not in data['next_ids']:
            data['next_ids']['assignment'] = len(data['assignments']) + 1
        if 'maintenance' not in data['next_ids']:
            data['next_ids']['maintenance'] = len(data['maintenances']) + 1
        if 'user' not in data['next_ids']:
            data['next_ids']['user'] = len(data['users']) + 1
        if 'category' not in data['next_ids']:
            data['next_ids']['category'] = len(data['categories']) + 1
        
        if len(data['users']) == 0:
            admin_user = {
                'id': 1,
                'username': 'admin',
                'password': 'admin123',
                'email': 'admin@sistema3g.com',
                'first_name': 'Administrador',
                'last_name': 'Sistema',
                'role': 'admin',
                'is_active': True,
                'created_at': datetime.now().isoformat()
            }
            data['users'].append(admin_user)
            data['next_ids']['user'] = 2
        
        save_data(data)
        return data

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# ========== ACTIVOS ==========
def get_all_assets():
    data = load_data()
    return data.get('assets', [])

def get_asset_by_id(asset_id):
    assets = get_all_assets()
    for asset in assets:
        if asset.get('id') == asset_id:
            return asset
    return None

def create_asset(asset_data):
    data = load_data()
    asset_id = data['next_ids']['asset']
    asset_data['id'] = asset_id
    asset_data['created_at'] = datetime.now().isoformat()
    asset_data['updated_at'] = datetime.now().isoformat()
    data['assets'].append(asset_data)
    data['next_ids']['asset'] = asset_id + 1
    save_data(data)
    return asset_data

def update_asset(asset_id, asset_data):
    assets = get_all_assets()
    for i, asset in enumerate(assets):
        if asset.get('id') == asset_id:
            asset_data['id'] = asset_id
            asset_data['updated_at'] = datetime.now().isoformat()
            if 'created_at' in asset:
                asset_data['created_at'] = asset['created_at']
            assets[i] = asset_data
            data = load_data()
            data['assets'] = assets
            save_data(data)
            return asset_data
    return None

def delete_asset(asset_id):
    assets = get_all_assets()
    new_assets = [a for a in assets if a.get('id') != asset_id]
    data = load_data()
    data['assets'] = new_assets
    save_data(data)
    return True

# ========== EMPLEADOS ==========
def get_all_employees():
    data = load_data()
    return data.get('employees', [])

def get_employee_by_id(employee_id):
    employees = get_all_employees()
    for emp in employees:
        if emp.get('id') == employee_id:
            return emp
    return None

def create_employee(employee_data):
    data = load_data()
    employee_id = data['next_ids']['employee']
    employee_data['id'] = employee_id
    employee_data['created_at'] = datetime.now().isoformat()
    data['employees'].append(employee_data)
    data['next_ids']['employee'] = employee_id + 1
    save_data(data)
    return employee_data

def update_employee(employee_id, employee_data):
    employees = get_all_employees()
    for i, emp in enumerate(employees):
        if emp.get('id') == employee_id:
            employee_data['id'] = employee_id
            employees[i] = employee_data
            data = load_data()
            data['employees'] = employees
            save_data(data)
            return employee_data
    return None

def delete_employee(employee_id):
    employees = get_all_employees()
    new_employees = [e for e in employees if e.get('id') != employee_id]
    data = load_data()
    data['employees'] = new_employees
    save_data(data)
    return True

# ========== ASIGNACIONES ==========
def get_all_assignments():
    data = load_data()
    return data.get('assignments', [])

def get_assignment_by_id(assignment_id):
    assignments = get_all_assignments()
    for ass in assignments:
        if ass.get('id') == assignment_id:
            return ass
    return None

def create_assignment(assignment_data):
    data = load_data()
    assignment_id = data['next_ids']['assignment']
    assignment_data['id'] = assignment_id
    assignment_data['assignment_date'] = datetime.now().isoformat()
    assignment_data['is_active'] = True
    data['assignments'].append(assignment_data)
    data['next_ids']['assignment'] = assignment_id + 1
    
    asset = get_asset_by_id(assignment_data.get('asset_id'))
    if asset:
        asset['status'] = 'assigned'
        update_asset(asset['id'], asset)
    
    save_data(data)
    return assignment_data

def return_assignment(assignment_id, return_notes=""):
    assignments = get_all_assignments()
    for i, ass in enumerate(assignments):
        if ass.get('id') == assignment_id and ass.get('is_active', True):
            ass['is_active'] = False
            ass['actual_return_date'] = datetime.now().isoformat()
            ass['return_notes'] = return_notes
            
            asset = get_asset_by_id(ass.get('asset_id'))
            if asset:
                asset['status'] = 'available'
                update_asset(asset['id'], asset)
            
            data = load_data()
            data['assignments'] = assignments
            save_data(data)
            return ass
    return None

# ========== MANTENIMIENTO ==========
def get_all_maintenances():
    data = load_data()
    return data.get('maintenances', [])

def get_maintenance_by_id(maintenance_id):
    maintenances = get_all_maintenances()
    for m in maintenances:
        if m.get('id') == maintenance_id:
            return m
    return None

def create_maintenance(maintenance_data):
    data = load_data()
    maintenance_id = data['next_ids']['maintenance']
    maintenance_data['id'] = maintenance_id
    maintenance_data['created_at'] = datetime.now().isoformat()
    maintenance_data['status'] = 'scheduled'
    data['maintenances'].append(maintenance_data)
    data['next_ids']['maintenance'] = maintenance_id + 1
    
    asset = get_asset_by_id(maintenance_data.get('asset_id'))
    if asset:
        asset['status'] = 'maintenance'
        update_asset(asset['id'], asset)
    
    save_data(data)
    return maintenance_data

def complete_maintenance(maintenance_id, completion_data):
    maintenances = get_all_maintenances()
    for i, m in enumerate(maintenances):
        if m.get('id') == maintenance_id and m.get('status') == 'scheduled':
            m['status'] = 'completed'
            m['completion_date'] = datetime.now().isoformat()
            m['cost'] = completion_data.get('cost', 0)
            m['observations'] = completion_data.get('observations', '')
            
            asset = get_asset_by_id(m.get('asset_id'))
            if asset:
                asset['status'] = 'available'
                update_asset(asset['id'], asset)
            
            data = load_data()
            data['maintenances'] = maintenances
            save_data(data)
            return m
    return None

# ========== CATEGORÍAS ==========
def get_all_categories():
    data = load_data()
    return data.get('categories', [])

def get_category_by_id(category_id):
    categories = get_all_categories()
    for cat in categories:
        if cat.get('id') == category_id:
            return cat
    return None

def create_category(category_data):
    data = load_data()
    category_id = data['next_ids']['category']
    category_data['id'] = category_id
    category_data['created_at'] = datetime.now().isoformat()
    data['categories'].append(category_data)
    data['next_ids']['category'] = category_id + 1
    save_data(data)
    return category_data

def update_category(category_id, category_data):
    categories = get_all_categories()
    for i, cat in enumerate(categories):
        if cat.get('id') == category_id:
            category_data['id'] = category_id
            categories[i] = category_data
            data = load_data()
            data['categories'] = categories
            save_data(data)
            return category_data
    return None

def delete_category(category_id):
    categories = get_all_categories()
    new_categories = [c for c in categories if c.get('id') != category_id]
    data = load_data()
    data['categories'] = new_categories
    save_data(data)
    return True

# ========== USUARIOS ==========
def get_all_users():
    data = load_data()
    return data.get('users', [])

def get_user_by_id(user_id):
    users = get_all_users()
    for user in users:
        if user.get('id') == user_id:
            return user
    return None

def get_user_by_username(username):
    users = get_all_users()
    for user in users:
        if user.get('username') == username:
            return user
    return None

def create_user(user_data):
    data = load_data()
    user_id = data['next_ids']['user']
    user_data['id'] = user_id
    user_data['is_active'] = True
    user_data['created_at'] = datetime.now().isoformat()
    data['users'].append(user_data)
    data['next_ids']['user'] = user_id + 1
    save_data(data)
    return user_data

def update_user(user_id, user_data):
    users = get_all_users()
    for i, user in enumerate(users):
        if user.get('id') == user_id:
            user_data['id'] = user_id
            users[i] = user_data
            data = load_data()
            data['users'] = users
            save_data(data)
            return user_data
    return None

def delete_user(user_id):
    users = get_all_users()
    new_users = [u for u in users if u.get('id') != user_id]
    data = load_data()
    data['users'] = new_users
    save_data(data)
    return True

def verify_user(username, password):
    users = get_all_users()
    for user in users:
        if user.get('username') == username and user.get('password') == password:
            return user
    return None

def get_user_permissions(role):
    permissions = {
        'admin': {
            'can_view_dashboard': True,
            'can_view_assets': True,
            'can_create_asset': True,
            'can_edit_asset': True,
            'can_delete_asset': True,
            'can_view_employees': True,
            'can_create_employee': True,
            'can_edit_employee': True,
            'can_delete_employee': True,
            'can_view_assignments': True,
            'can_create_assignment': True,
            'can_return_assignment': True,
            'can_view_maintenances': True,
            'can_create_maintenance': True,
            'can_complete_maintenance': True,
            'can_manage_users': True,
            'can_manage_categories': True
        },
        'manager': {
            'can_view_dashboard': True,
            'can_view_assets': True,
            'can_create_asset': True,
            'can_edit_asset': True,
            'can_delete_asset': False,
            'can_view_employees': True,
            'can_create_employee': True,
            'can_edit_employee': True,
            'can_delete_employee': False,
            'can_view_assignments': True,
            'can_create_assignment': True,
            'can_return_assignment': True,
            'can_view_maintenances': True,
            'can_create_maintenance': True,
            'can_complete_maintenance': True,
            'can_manage_users': False,
            'can_manage_categories': True
        },
        'employee': {
            'can_view_dashboard': True,
            'can_view_assets': True,
            'can_create_asset': False,
            'can_edit_asset': False,
            'can_delete_asset': False,
            'can_view_employees': False,
            'can_create_employee': False,
            'can_edit_employee': False,
            'can_delete_employee': False,
            'can_view_assignments': True,
            'can_create_assignment': False,
            'can_return_assignment': False,
            'can_view_maintenances': True,
            'can_create_maintenance': False,
            'can_complete_maintenance': False,
            'can_manage_users': False,
            'can_manage_categories': False
        }
    }
    return permissions.get(role, permissions['employee'])

# ========== DASHBOARD ==========
def get_active_assignments():
    """Obtiene asignaciones activas"""
    data = load_data()
    assignments = data.get('assignments', [])
    return [a for a in assignments if a.get('is_active', True)]

def get_dashboard_stats():
    data = load_data()
    
    assets = data.get('assets', [])
    employees = data.get('employees', [])
    assignments = data.get('assignments', [])
    maintenances = data.get('maintenances', [])
    
    return {
        'total_assets': len(assets),
        'available_assets': len([a for a in assets if a.get('status') == 'available']),
        'assigned_assets': len([a for a in assets if a.get('status') == 'assigned']),
        'maintenance_assets': len([a for a in assets if a.get('status') == 'maintenance']),
        'total_employees': len(employees),
        'active_assignments': len([a for a in assignments if a.get('is_active', True)]),
        'pending_maintenances': len([m for m in maintenances if m.get('status') == 'scheduled']),
        'total_assets_value': sum([float(a.get('purchase_price', 0)) for a in assets])
    }