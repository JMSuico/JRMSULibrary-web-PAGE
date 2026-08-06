from Features.Api.Controllers.cms_controller import PageContentViewSet
from Features.Data.Models.page_content_model import PageContent

class MockRequest:
    pass

viewset = PageContentViewSet()
response = viewset.import_defaults(MockRequest())

print("Response message:", response.data['message'])
print("Imported count:", response.data['imported'])

# Verify database slugs
slugs = list(PageContent.objects.values_list('slug', flat=True))
print("Database slugs after button click:", slugs)
