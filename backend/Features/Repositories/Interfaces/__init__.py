from .contact_repository_interface import ContactRepositoryInterface
from .feedback_repository_interface import FeedbackRepositoryInterface
from .i_book_repository import INewlyAcquiredBookRepository
from .i_cms_repository import (
    IPageContentRepository,
    IPageImageRepository,
    IManagedLinkRepository,
    IManagedFileRepository
)
from .i_eresource_repository import IEResourceDepartmentRepository, IEResourceFileRepository
from .i_gallery_repository import ILibraryInteriorImageRepository
from .i_personnel_repository import IPersonnelRepository
from .i_analytics_repository import ISiteVisitRepository

__all__ = [
    'ContactRepositoryInterface',
    'FeedbackRepositoryInterface',
    'INewlyAcquiredBookRepository',
    'IPageContentRepository',
    'IPageImageRepository',
    'IManagedLinkRepository',
    'IManagedFileRepository',
    'IEResourceDepartmentRepository',
    'IEResourceFileRepository',
    'ILibraryInteriorImageRepository',
    'IPersonnelRepository',
    'ISiteVisitRepository'
]
