from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse
from django.contrib.auth import get_user_model

def create_temp_admin(request):
    User = get_user_model()
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@jrmsu.edu.ph", "Admin@1111")
        return HttpResponse("SUCCESS: Admin created! You can now log in with admin / Admin@1111")
    return HttpResponse("ALREADY EXISTS: Admin account is already created.")

urlpatterns = [
    path("secure-admin-console/", admin.site.urls),
    path("create-admin-secret-999/", create_temp_admin),
    path("api/", include("Features.Api.Routes")),
]

# Force serve media files in Localhost/Docker even when DEBUG=False
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]
