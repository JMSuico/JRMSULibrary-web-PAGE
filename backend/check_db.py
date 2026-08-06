from Features.Data.Models.page_content_model import PageContent
print("Database slugs:", list(PageContent.objects.values_list('slug', flat=True)))
