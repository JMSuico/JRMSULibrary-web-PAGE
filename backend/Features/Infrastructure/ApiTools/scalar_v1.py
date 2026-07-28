from django.http import HttpResponse
from django.contrib.auth.decorators import user_passes_test

@user_passes_test(lambda u: u.is_superuser)
def scalar_v1_view(request):
    html = """
    <!doctype html>
    <html>
      <head>
        <title>JRMSU Library API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <!-- Point to the drf-spectacular schema -->
        <script
          id="api-reference"
          data-url="/api/schema/"
        ></script>
        
        <!-- Load Scalar V1 UI -->
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
    """
    return HttpResponse(html)
