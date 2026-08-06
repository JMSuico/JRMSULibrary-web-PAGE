from Features.Data.Models.page_content_model import PageContent
res = PageContent.objects.filter(slug__in=['about_mission', 'about_vision']).delete()
print("Delete result:", res)
