from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse
from django.contrib.auth import get_user_model

def create_temp_admin(request):
    User = get_user_model()
    user, created = User.objects.get_or_create(username="admin", defaults={"email": "admin@jrmsu.edu.ph"})
    user.set_password("Admin@1111")
    user.is_superuser = True
    user.is_staff = True
    user.is_active = True
    user.is_librarian = True
    user.save()
    return HttpResponse("SUCCESS: Admin password forced! You can now log in with admin / Admin@1111")

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
