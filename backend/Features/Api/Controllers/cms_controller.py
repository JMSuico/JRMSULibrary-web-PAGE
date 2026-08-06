# [Layer: Api/Controllers] — cms_controller.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from Features.Api.Serializers.cms_serializers import (
    NewlyAcquiredBookSerializer, LibraryInteriorImageSerializer,
    EResourceDepartmentSerializer, EResourceFileSerializer,
    PageContentSerializer, PageImageSerializer,
    ManagedLinkSerializer, ManagedFileSerializer
)

from Features.Repositories.Implementations import (
    NewlyAcquiredBookRepository, LibraryInteriorImageRepository,
    EResourceDepartmentRepository, EResourceFileRepository,
    PageContentRepository, PageImageRepository,
    ManagedLinkRepository, ManagedFileRepository
)
from Features.Services.Implementations import (
    NewlyAcquiredBookService, LibraryInteriorImageService,
    EResourceDepartmentService, EResourceFileService,
    PageContentService, PageImageService,
    ManagedLinkService, ManagedFileService
)
class NewlyAcquiredBookViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = NewlyAcquiredBookService(NewlyAcquiredBookRepository())
    def list(self, request):
        return Response(NewlyAcquiredBookSerializer(self.service.get_all_books(), many=True).data)
    def retrieve(self, request, pk=None):
        item = self.service.get_book_by_id(pk)
        return Response(NewlyAcquiredBookSerializer(item).data) if item else Response(status=404)
    def create(self, request):
        ser = NewlyAcquiredBookSerializer(data=request.data)
        if ser.is_valid():
            return Response(NewlyAcquiredBookSerializer(self.service.add_book(ser.validated_data)).data, status=201)
        return Response(ser.errors, status=400)
    def update(self, request, pk=None):
        ser = NewlyAcquiredBookSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update_book(pk, ser.validated_data)
            return Response(NewlyAcquiredBookSerializer(item).data) if item else Response(status=404)
        return Response(ser.errors, status=400)
    def destroy(self, request, pk=None):
        return Response(status=204) if self.service.delete_book(pk) else Response(status=404)


class LibraryInteriorImageViewSet(viewsets.ViewSet):
    """
    Full CRUD for library interior images.
    - GET /api/gallery/ → public list (active only)
    - All other actions require authentication.
    """
    # Removed incorrect parser_classes

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = LibraryInteriorImageService(LibraryInteriorImageRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_gallery_images()
        else:
            data = self.service.get_all()
        return Response(LibraryInteriorImageSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        ser = LibraryInteriorImageSerializer(data=request.data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(LibraryInteriorImageSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def partial_update(self, request, pk=None, *args, **kwargs):
        ser = LibraryInteriorImageSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            if item:
                return Response(LibraryInteriorImageSerializer(item).data)
            return Response(status=404)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        user_id = request.user.id if request.user.is_authenticated else None
        if self.service.delete(pk, user_id):
            return Response(status=204)
        return Response(status=404)


class EResourceDepartmentViewSet(viewsets.ViewSet):
    # Removed incorrect parser_classes
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EResourceDepartmentService(EResourceDepartmentRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        # Always return root-level departments; the serializer recursively nests children
        data = self.service.get_departments()
        return Response(EResourceDepartmentSerializer(data, many=True, context={'request': request}).data)

    def create(self, request, *args, **kwargs):
        ser = EResourceDepartmentSerializer(data=request.data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(EResourceDepartmentSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def partial_update(self, request, pk=None, *args, **kwargs):
        ser = EResourceDepartmentSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            if item:
                return Response(EResourceDepartmentSerializer(item).data)
            return Response(status=404)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        user_id = request.user.id if request.user.is_authenticated else None
        if self.service.delete(pk, user_id):
            return Response(status=204)
        return Response(status=404)


class EResourceFileViewSet(viewsets.ViewSet):
    # Removed incorrect parser_classes
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EResourceFileService(EResourceFileRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_all_files()
        else:
            data = self.service.get_all()
        return Response(EResourceFileSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        mutable_data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
        uploaded_file = request.FILES.get('file')
        from rest_framework.exceptions import ValidationError
        try:
            item = self.service.create(mutable_data, uploaded_file)
            return Response(EResourceFileSerializer(item).data, status=201)
        except ValidationError as e:
            return Response(e.detail, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def partial_update(self, request, pk=None, *args, **kwargs):
        ser = EResourceFileSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            if item:
                return Response(EResourceFileSerializer(item).data)
            return Response(status=404)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        user_id = request.user.id if request.user.is_authenticated else None
        if self.service.delete(pk, user_id):
            return Response(status=204)
        return Response(status=404)


class PageContentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = PageContentService(PageContentRepository())
    def list(self, request):
        content = self.service.get_all_content()
        return Response(PageContentSerializer(content, many=True).data)

    @action(detail=False, methods=['post'], url_path='import-defaults')
    def import_defaults(self, request):
        from Features.Data.Models.page_content_model import PageContent
        defaults = [
            {
                'slug': 'about_history',
                'title': 'History of JRMSU Katipunan Campus',
                'content': '<p>Jose Rizal Memorial State University was established by virtue of RA 9852 with Congresswoman Cecilia G. Jalosjos-Carreon as principal author, Congressman Cesar Jalosjos as co-author. It was approved by President Gloria Macapagal-Arroyo on December 15, 2009. It was formerly the Jose Rizal Memorial State College by virtue of RA 8193 sponsored by Congressman Romeo G. Jalosjos of the 1st District of Zamboanga del Norte which was approved on June 11, 1996 by the President of the Republic, Fidel V. Ramos. It was a consolidation of the Rizal Memorial Vocational School (RMNVS) in Dapitan City, the Zamboanga del Norte School of Arts and Trades (ZNSAT) in Dipolog City, and the Siocon National Vocational School (SNVS) in the Municipality of Siocon. In 2002, two higher education institutions (HEIs) within Zamboanga del Norte, namely the Katipunan National Agricultural School (KNAS) in the municipality of Katipunan and the Zamboanga del Norte Agricultural College (ZNAC) in the Municipality of Tampilisan, were integrated into then JRMSC pursuant to CHED Memorandum Order No. 27 series of 2000 thus comprising the fourth and fifth campuses, respectively of JRMSU.</p><p>The first President was Dr. Felipe O. Ligan who was appointed in 1997. On June 7, 2002 CHED Special Order No. 35, s. 2002 appointed Dr. Henry A. Sojor as the OIC President of the Jose Rizal Memorial State College in concurrent capacity as President of Central Visayas Polytechnic College in Dumaguete City now Negros Oriental State University.</p><p>In the span of two years and eight months, the Board of Trustee then deemed it best for the College to have its permanent leader. Thus, on March 1, 2005, Dr. Edgar S. Balbuena assumed office as second President of JRMSC pursuant to BOT Resolution No. 04, series of 2005 Chairmaned by Fr. Rolando V. Rosa, OP.</p><p>With the appointment of Dr. Balbuena, the College charted a new course. With his extraordinary leadership it took only four years and nine months for the College to be elevated to the status of a University. Indeed the growth of the University means a continuing and growing commitment for academic excellence and quality, research, and productivity, community involvement and partnership for national development and global competitiveness. Evidently, he emerged as a dynamo, leading the people of Zamboanga del Norte and adjacent provinces towards improved quality life.</p>'
            },
            {
                'slug': 'about_quality',
                'title': 'JRMSU Library Quality Objectives',
                'content': '<ul><li>Increase the acquisition of print, digital, and multimedia resources by 10% annually to ensure modern, relevant, and accessible materials that support instruction, research, extension, and production.</li><li>Increase library user engagement by 10% and ensure the 100% provision of adaptive, inclusive, and transformative library facilities that foster creativity, critical thinking, and lifelong learning.</li><li>Forge at least one (1) local and one (1) international formal partnership or collaboration each year, and implement at least one (1) joint program or activity with academic institutions, government agencies, or library networks to strengthen resource sharing, collaboration, and service innovation.</li><li>Ensure that 100% of library personnel participate in at least two (2) capacity-building or professional development activities per year, strengthening their skills in technology, research support, customer service, and library management.</li><li>Achieve a minimum of 90% overall user satisfaction rating in the annual library survey by continuously delivering equitable, technology-driven, and user-centered services.</li></ul>'
            },
            {
                'slug': 'our_services',
                'title': 'Our 17 Library Services',
                'content': '<p>Library User Education</p><p>Informal Reference Service</p><p>Readers Advisory Services</p><p>Technical Services</p><p>Audio-Visual Services</p><p>Circulation Services</p><p>Ask-a-Librarian / #AskRIZAL</p><p>Photo/Scan Me Service</p><p>OPAC Service</p><p>Printing Service</p><p>Property Counter Service</p><p>Selective Dissemination of Information</p><p>Current Awareness Services</p><p>Referral Information Service (RIS)</p><p>File Transfer Service</p><p>Internet / e-Library / Free Wi-Fi</p><p>Online Databases Service</p>'
            },
            {
                'slug': 'personnel_text',
                'title': 'Librarian\'s Corner Text',
                'content': '<p>From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence.</p><p>The Library of Jose Rizal Memorial State University Katipunan Campus is committed to supporting the University\'s Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources and services. In adherence to the standards, the library continuously enhances its collections, facilities, and technological services to meet the evolving needs of its academic community. It also promotes information literacy, strengthens research support, and fosters collaborative linkages to contribute to institutional development. The library remains dedicated to delivering quality services and nurturing a culture of lifelong learning among its users.</p><p>Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!</p>'
            }
        ]
        
        imported_count = 0
        existing_slugs = set(PageContent.objects.values_list('slug', flat=True))
        
        for d in defaults:
            if d['slug'] not in existing_slugs:
                PageContent.objects.create(slug=d['slug'], title=d['title'], content=d['content'])
                imported_count += 1
                
        if imported_count == 0:
            return Response({'message': 'All defaults are already imported.', 'imported': 0}, status=200)
            
        return Response({'message': f'Successfully imported {imported_count} default texts.', 'imported': imported_count}, status=200)
    def retrieve(self, request, pk=None): # Note: router mapped this to slug previously, DRF passes it as pk
        item = self.service.get_content_by_slug(pk)
        return Response(PageContentSerializer(item).data) if item else Response(status=404)
    def update(self, request, pk=None):
        ser = PageContentSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update_content(pk, ser.validated_data)
            return Response(PageContentSerializer(item).data) if item else Response(status=404)
        return Response(ser.errors, status=400)
    def partial_update(self, request, pk=None):
        return self.update(request, pk)


class PageImageViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = PageImageService(PageImageRepository())
    def list(self, request):
        return Response(PageImageSerializer(self.service.get_all_images(), many=True).data)


class ManagedLinkViewSet(viewsets.ViewSet):
    # Removed incorrect parser_classes
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ManagedLinkService(ManagedLinkRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_all_links()
        else:
            data = self.service.get_all()
        return Response(ManagedLinkSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        ser = ManagedLinkSerializer(data=data)
        if ser.is_valid():
            # Auto index order if not provided
            if 'order' not in ser.validated_data or ser.validated_data['order'] is None:
                from Features.Data.Models.managed_link_model import ManagedLink
                max_order = ManagedLink.objects.all().order_by('-order').first()
                ser.validated_data['order'] = (max_order.order + 1) if max_order else 1
            item = self.service.create(ser.validated_data)
            return Response(ManagedLinkSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    @action(detail=False, methods=['post'], url_path='import-defaults')
    def import_defaults(self, request):
        from Features.Data.Models.managed_link_model import ManagedLink
        LINKS = [
            # Open Access Journal
            ('Agriculture', 'https://www.mdpi.com/journal/agriculture', 'Open Access Journal'),
            ('Lis of Scientific Journal', 'https://en.wikipedia.org/wiki/Lists_of_academic_journals', 'Open Access Journal'),
            ('List of Academic Journal', 'https://en.wikipedia.org/wiki/Lists_of_academic_journals', 'Open Access Journal'),
            ('Worldcat', 'https://search.worldcat.org/', 'Open Access Journal'),
            ('Google Book', 'https://books.google.com/?hl=en', 'Open Access Journal'),
            ('Online Free E-Books', 'https://www.free-ebooks.net/', 'Open Access Journal'),
            ('Gutenberg', 'https://www.free-ebooks.net/', 'Open Access Journal'),
            ('Scribd', 'https://www.scribd.com/', 'Open Access Journal'),
            ('GetFreeEbooks', 'https://getfreeebooks.com/', 'Open Access Journal'),
            ('DOST Publication', 'https://www.dost.gov.ph/index.php?option=com_content&task=view&id=712&Itemid=201&appgw_azwaf_jsc=YU_apB7IN_mPNkdEH_BnTZWX6lhlM7xFfn7z7yLstI4', 'Open Access Journal'),
            ('Highwire Press', 'https://www.highwirepress.com/', 'Open Access Journal'),
            ('IPL Magazines', 'https://www.ipl.org/', 'Open Access Journal'),
            
            # Resources
            ('Science Direct', 'https://www.sciencedirect.com/', 'Resources'),
            ('Philippine Elib', 'https://www.elib.gov.ph/', 'Resources'),
            ('ERIC Educ. Res. Info. Center', 'https://eric.ed.gov/', 'Resources'),
            ('Gale Database', 'https://link.gale.com/apps/menu?userGroupName=phusm&prodId=MENU', 'Resources'),
            ('Philippine E-Journals', 'https://ejournals.ph/', 'Resources'),
            ('Springer Nature Link', 'https://link.springer.com/', 'Resources'),
            ('E-Library USA', 'https://docs.google.com/forms/d/e/1FAIpQLSdK93TrYAkWrl32xWxlOItfYFTTgUQPY_Ws2ZhxfuVMvojpiA/viewform?fbclid=IwAR07NWjxpHNoE7hV4WL85sW_9xMSLKWsWn5gbpsXCDdEUuVVxt0HAny2GPM', 'Resources'),
            ('Seameo-innotech eBooks', '#', 'Resources'),
            ('ProQuest', '#', 'Resources'),

            # Acquired E-Resources
            ('Bookshelf', 'https://www.vitalsource.com/', 'Acquired E-Resources'),
            ('Scholaar', 'https://scholaar.com/', 'Acquired E-Resources'),
        ]
        
        imported_count = 0
        existing_names = set(ManagedLink.objects.values_list('name', flat=True))
        
        for name, url, category in LINKS:
            if name not in existing_names:
                max_order = ManagedLink.objects.all().order_by('-order').first()
                new_order = (max_order.order + 1) if max_order else 1
                ManagedLink.objects.create(name=name, url=url, category=category, order=new_order)
                imported_count += 1
                
        if imported_count == 0:
            return Response({'message': 'All default links are already imported.', 'imported': 0}, status=200)
            
        return Response({'message': f'Successfully imported {imported_count} missing default links.', 'imported': imported_count}, status=200)

    def partial_update(self, request, pk=None, *args, **kwargs):
        ser = ManagedLinkSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            if item:
                return Response(ManagedLinkSerializer(item).data)
            return Response(status=404)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        user_id = request.user.id if request.user.is_authenticated else None
        if self.service.delete(pk, user_id):
            return Response(status=204)
        return Response(status=404)


class ManagedFileViewSet(viewsets.ViewSet):
    # Removed incorrect parser_classes
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ManagedFileService(ManagedFileRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_all_files()
        else:
            data = self.service.get_all()
        return Response(ManagedFileSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        mutable_data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
        uploaded_file = request.FILES.get('file')
        from rest_framework.exceptions import ValidationError
        try:
            item = self.service.create(mutable_data, uploaded_file)
            return Response(ManagedFileSerializer(item).data, status=201)
        except ValidationError as e:
            return Response(e.detail, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def destroy(self, request, pk=None):
        user_id = request.user.id if request.user.is_authenticated else None
        if self.service.delete(pk, user_id):
            return Response(status=204)
        return Response(status=404)
