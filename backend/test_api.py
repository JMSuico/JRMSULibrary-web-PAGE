import urllib.request
import json
import os

url = 'http://localhost:8000/api/cms/content/import-defaults/'
req = urllib.request.Request(url, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("API Response:", data)
except Exception as e:
    print("API Error:", e)

from Features.Data.Models.page_content_model import PageContent
print("Database slugs after button click:", list(PageContent.objects.values_list('slug', flat=True)))
