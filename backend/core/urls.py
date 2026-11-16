from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView
from Features.Infrastructure.ApiTools.scalar_v1 import scalar_v1_view


urlpatterns = [
    path("secure-admin-console/", admin.site.urls),
    path("api/", include("Features.Api.Routes")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", scalar_v1_view, name="scalar-docs"),
]

_EBOOKS_BASENAME_CACHE = {}


def _find_ebook_fallback_by_basename(search_roots, req_basename: str, clean_rel: str):
    """Locate moved/re-nested eBook files within bounded eBooks directories only."""
    import os

    if not req_basename or req_basename in (".", ".."):
        return None
    req_parts = {p.lower() for p in clean_rel.split("/") if p and p != req_basename}

    for root in search_roots:
        if not root or not os.path.isdir(root):
            continue
        base_abs = os.path.realpath(root)
        index = _EBOOKS_BASENAME_CACHE.get(base_abs)
        if index is None:
            built = {}
            for dirpath, _dirs, filenames in os.walk(base_abs):
                for fname in filenames:
                    full = os.path.realpath(os.path.join(dirpath, fname))
                    try:
                        if os.path.commonpath([base_abs, full]) == base_abs and os.path.isfile(full):
                            built.setdefault(fname, []).append(full)
                    except ValueError:
                        continue
            index = built
            _EBOOKS_BASENAME_CACHE[base_abs] = index

        matches = index.get(req_basename)
        if not matches:
            continue
        if len(matches) == 1:
            return matches[0]
        # Prefer match sharing the closest department/folder segment
        best_path = matches[0]
        best_score = -1
        for cand in matches:
            cand_parts = {p.lower() for p in os.path.relpath(cand, base_abs).replace("\\", "/").split("/")}
            score = len(req_parts & cand_parts)
            if score > best_score:
                best_score = score
                best_path = cand
        return best_path
    return None


def secure_media_serve(request, path, document_root=None, show_indexes=False):
    """
    Hardened media file server that injects anti-download and security headers
    for read-only institutional library collection materials, with HTTP Range
    (206 Partial Content) streaming support for PDFs and large documents.
    Resolves files across MEDIA_ROOT, normalized eBooks subdirectories, and mounted
    frontend_assets before raising Http404 when the requested file is missing.
    """
    from django.http import Http404
    import mimetypes
    import os
    import re

    def _safe_join_under(base_dir: str, rel_part: str):
        if not base_dir or not rel_part:
            return None
        base_abs = os.path.realpath(base_dir)
        joined = os.path.realpath(os.path.join(base_abs, rel_part.lstrip("/\\")))
        try:
            if os.path.commonpath([base_abs, joined]) == base_abs and os.path.exists(joined) and os.path.isfile(joined):
                return joined
        except ValueError:
            return None
        return None

    clean_rel = (path or "").replace("\\", "/").lstrip("/")
    if "\x00" in clean_rel or ".." in clean_rel.split("/"):
        raise Http404("Invalid media path.")

    doc_root_str = str(document_root) if document_root else ""
    resolved_path = _safe_join_under(doc_root_str, clean_rel)

    if not resolved_path:
        stripped_eres = clean_rel[len("e_resources/"):] if clean_rel.startswith("e_resources/") else clean_rel
        single_ebooks_rel = clean_rel.replace("eBooks/eBooks/", "eBooks/")
        single_stripped_eres = stripped_eres.replace("eBooks/eBooks/", "eBooks/")

        base_dir_str = str(getattr(settings, "BASE_DIR", ""))
        frontend_src_assets = os.path.normpath(os.path.join(base_dir_str, "..", "frontend", "src", "Assets", "assets")) if base_dir_str else ""
        frontend_public_assets = os.path.normpath(os.path.join(base_dir_str, "..", "frontend", "public", "assets")) if base_dir_str else ""

        req_basename = os.path.basename(clean_rel)
        candidate_paths = [
            (doc_root_str, single_ebooks_rel),
            ("/app/frontend_assets", stripped_eres),
            ("/app/frontend_assets", single_stripped_eres),
            (frontend_src_assets, stripped_eres),
            (frontend_src_assets, single_stripped_eres),
        ]
        if req_basename:
            candidate_paths.append(("/app/frontend_public_assets", req_basename))
            candidate_paths.append((frontend_public_assets, req_basename))

        for root_dir, rel_cand in candidate_paths:
            matched = _safe_join_under(root_dir, rel_cand)
            if matched:
                resolved_path = matched
                break

        if not resolved_path and req_basename and ("ebooks/" in clean_rel.lower() or "e_resources/" in clean_rel.lower()):
            ebook_roots = [
                os.path.join(doc_root_str, "e_resources", "eBooks") if doc_root_str else "",
                os.path.join(doc_root_str, "eBooks") if doc_root_str else "",
                "/app/frontend_assets/eBooks",
                os.path.join(frontend_src_assets, "eBooks") if frontend_src_assets else "",
            ]
            resolved_path = _find_ebook_fallback_by_basename(ebook_roots, req_basename, clean_rel)

    if not resolved_path:
        raise Http404("Media file not found.")

    from django.http import FileResponse, HttpResponse, StreamingHttpResponse

    content_type, _ = mimetypes.guess_type(resolved_path)
    if not content_type:
        if resolved_path.lower().endswith(".pdf"):
            content_type = "application/pdf"
        else:
            content_type = "application/octet-stream"

    file_size = os.path.getsize(resolved_path)
    meta = getattr(request, "META", None) or {}
    range_header = (meta.get("HTTP_RANGE") or "").strip()

    def _apply_security_headers(resp):
        resp["Accept-Ranges"] = "bytes"
        resp["X-Content-Type-Options"] = "nosniff"
        resp["Content-Disposition"] = "inline"
        resp["Cache-Control"] = "private, no-transform, max-age=3600"
        resp["X-Frame-Options"] = "SAMEORIGIN"
        return resp

    if range_header:
        def _unsatisfiable_416():
            resp = HttpResponse(status=416)
            resp["Content-Range"] = f"bytes */{file_size}"
            return _apply_security_headers(resp)

        if not range_header.lower().startswith("bytes="):
            return _unsatisfiable_416()

        spec = range_header[6:].strip()
        match = re.fullmatch(r"(\d*)-(\d*)", spec)
        if not match:
            return _unsatisfiable_416()

        start_str, end_str = match.groups()
        if not start_str and not end_str:
            return _unsatisfiable_416()

        if file_size == 0:
            return _unsatisfiable_416()

        if not start_str:
            suffix_len = int(end_str)
            if suffix_len <= 0:
                return _unsatisfiable_416()
            start = max(0, file_size - suffix_len)
            end = file_size - 1
        else:
            start = int(start_str)
            if start >= file_size:
                return _unsatisfiable_416()
            if not end_str:
                end = file_size - 1
            else:
                end = int(end_str)
                if start > end:
                    return _unsatisfiable_416()
                end = min(end, file_size - 1)

        length = end - start + 1

        def _file_chunk_iterator(file_path, offset, remaining, chunk_size=65536):
            with open(file_path, "rb") as f:
                f.seek(offset)
                while remaining > 0:
                    chunk = f.read(min(chunk_size, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        response = StreamingHttpResponse(
            _file_chunk_iterator(resolved_path, start, length),
            status=206,
            content_type=content_type,
        )
        response["Content-Range"] = f"bytes {start}-{end}/{file_size}"
        response["Content-Length"] = str(length)
        return _apply_security_headers(response)

    response = FileResponse(open(resolved_path, "rb"), as_attachment=False, content_type=content_type)
    response["Content-Length"] = str(file_size)
    return _apply_security_headers(response)

# Force serve media files in Localhost/Docker even when DEBUG=False with anti-download security headers
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', secure_media_serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]
