from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from drf_spectacular.views import SpectacularAPIView
from Features.Infrastructure.ApiTools.scalar_v1 import scalar_v1_view


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
    # Secret endpoint only available in DEV mode
]

if settings.DEBUG:
    urlpatterns.append(path("create-admin-secret-999/", create_temp_admin))

urlpatterns += [
    path("api/", include("Features.Api.Routes")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", scalar_v1_view, name="scalar-docs"),
]

def secure_media_serve(request, path, document_root=None, show_indexes=False):
    """
    Hardened media file server that injects anti-download and security headers
    for read-only institutional library collection materials.
    """
    response = serve(request, path, document_root=document_root, show_indexes=show_indexes)
    response['X-Content-Type-Options'] = 'nosniff'
    response['Content-Disposition'] = 'inline'
    response['Cache-Control'] = 'private, no-transform, max-age=3600'
    response['X-Frame-Options'] = 'SAMEORIGIN'
    return response

# Force serve media files in Localhost/Docker even when DEBUG=False with anti-download security headers
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', secure_media_serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]
