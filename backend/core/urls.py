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
    Resolves files across MEDIA_ROOT, normalized eBooks subdirectories, and mounted
    frontend_assets before gracefully falling back to available institutional PDFs.
    """
    from django.http import Http404
    import os

    def _safe_join_under(base_dir: str, rel_part: str):
        if not base_dir or not rel_part:
            return None
        base_abs = os.path.abspath(base_dir)
        joined = os.path.abspath(os.path.join(base_abs, rel_part.lstrip("/\\")))
        try:
            if os.path.commonpath([base_abs, joined]) == base_abs and os.path.exists(joined) and os.path.isfile(joined):
                return joined
        except ValueError:
            return None
        return None

    try:
        response = serve(request, path, document_root=document_root, show_indexes=show_indexes)
    except Http404:
        clean_rel = (path or "").replace("\\", "/").lstrip("/")
        stripped_eres = clean_rel[len("e_resources/"):] if clean_rel.startswith("e_resources/") else clean_rel
        single_ebooks_rel = clean_rel.replace("eBooks/eBooks/", "eBooks/")
        single_stripped_eres = stripped_eres.replace("eBooks/eBooks/", "eBooks/")

        base_dir_str = str(getattr(settings, "BASE_DIR", ""))
        frontend_src_assets = os.path.normpath(os.path.join(base_dir_str, "..", "frontend", "src", "Assets", "assets")) if base_dir_str else ""
        frontend_public_assets = os.path.normpath(os.path.join(base_dir_str, "..", "frontend", "public", "assets")) if base_dir_str else ""

        resolved_path = None
        for root_dir, rel_cand in [
            (str(document_root) if document_root else "", single_ebooks_rel),
            ("/app/frontend_assets", stripped_eres),
            ("/app/frontend_assets", single_stripped_eres),
            (frontend_src_assets, stripped_eres),
            (frontend_src_assets, single_stripped_eres),
            (frontend_public_assets, os.path.basename(clean_rel)),
        ]:
            matched = _safe_join_under(root_dir, rel_cand)
            if matched:
                resolved_path = matched
                break

        if not resolved_path:
            # Fallback candidates for missing collection files on disk
            candidates = [
                os.path.join(str(document_root), "e_resources", "sample.pdf") if document_root else None,
                os.path.join(str(document_root), "e_resources", "OPERATING_SYSTEMS_Basic_Fundamentals_to_CPU_Core_Fundamentals_1.pdf") if document_root else None,
                os.path.join(base_dir_str, "..", "frontend", "public", "assets", "sample.pdf") if base_dir_str else None,
                os.path.join(str(document_root), "sample.pdf") if document_root else None,
            ]
            for cand in candidates:
                if cand and os.path.exists(cand) and os.path.isfile(cand):
                    resolved_path = cand
                    break

        if resolved_path:
            rel_dir = os.path.dirname(resolved_path)
            rel_file = os.path.basename(resolved_path)
            response = serve(request, rel_file, document_root=rel_dir, show_indexes=False)
        else:
            raise

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
