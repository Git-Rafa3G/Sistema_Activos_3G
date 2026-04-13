from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sistema Activos 3G</title>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    color: white;
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    background: #2d2d2d;
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    max-width: 600px;
                    text-align: center;
                    border: 1px solid #d32f2f;
                }
                h1 { color: #d32f2f; margin-bottom: 10px; }
                .subtitle { color: #999; margin-bottom: 30px; }
                .endpoint {
                    background: #1e1e1e;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 8px;
                    font-family: monospace;
                    text-align: left;
                }
                .endpoint a { color: #d32f2f; text-decoration: none; }
                .method { display: inline-block; width: 70px; font-weight: bold; }
                .get { color: #4caf50; }
                .post { color: #2196f3; }
                hr { border-color: #d32f2f; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏢 Sistema Activos 3G</h1>
                <div class="subtitle">API de Control de Activos e Inventario</div>
                <hr>
                <h3>📡 Endpoints disponibles:</h3>
                <div class="endpoint"><span class="method get">GET</span> <a href="/api/assets/">/api/assets/</a> <span style="color:#888;"> - Activos</span></div>
                <div class="endpoint"><span class="method get">GET</span> <a href="/api/assignments/">/api/assignments/</a> <span style="color:#888;"> - Asignaciones</span></div>
                <div class="endpoint"><span class="method get">GET</span> <a href="/api/maintenance/">/api/maintenance/</a> <span style="color:#888;"> - Mantenimientos</span></div>
                <div class="endpoint"><span class="method get">GET</span> <a href="/api/categories/">/api/categories/</a> <span style="color:#888;"> - Categorías</span></div>
                <div class="endpoint"><span class="method get">GET</span> <a href="/api/dashboard/">/api/dashboard/</a> <span style="color:#888;"> - Dashboard</span></div>
                <div class="endpoint"><span class="method post">POST</span> <a href="/api/auth/login/">/api/auth/login/</a> <span style="color:#888;"> - Login</span></div>
                <div class="endpoint"><span class="method post">POST</span> <a href="/api/auth/register/">/api/auth/register/</a> <span style="color:#888;"> - Registro</span></div>
                <div class="endpoint"><span class="method get">GET</span> <a href="/api/users/">/api/users/</a> <span style="color:#888;"> - Usuarios</span></div>
                <hr>
                <div style="font-size:12px; color:#666;">Frontend React: <strong>http://localhost:3000</strong></div>
            </div>
        </body>
        </html>
    """)

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    
    # Módulos principales
    path('api/assets/', include('apps.assets.urls')),  # ← Esta línea debe existir
    path('api/assignments/', include('apps.assignments.urls')),
    path('api/maintenance/', include('apps.maintenance.urls')),
    path('api/categories/', include('apps.core.category_urls')),  # ← Esta es para categorías
    path('api/dashboard/', include('apps.core.dashboard_urls')),
    path('api/auth/', include('apps.core.auth_urls')),
    path('api/users/', include('apps.core.user_urls')),  # ← Esta es para usuarios
]