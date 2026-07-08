# [Layer: Services/Implementations] — eresource_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import IEResourceDepartmentService, IEResourceFileService
from Features.Repositories.Interfaces import IEResourceDepartmentRepository, IEResourceFileRepository
from Features.Repositories.Implementations.recycle_bin_repository import RecycleBinRepository
from Features.Api.Serializers.cms_serializers import EResourceDepartmentSerializer, EResourceFileSerializer
from Features.Helpers.malware_scanner_helper import MalwareScannerHelper
from rest_framework.exceptions import ValidationError

class EResourceDepartmentService(IEResourceDepartmentService):
    def __init__(self, repo: IEResourceDepartmentRepository):
        self._repo = repo
        self._recycle_repo = RecycleBinRepository()

    def get_departments(self) -> List[Any]:
        return self._repo.get_root_departments()

    def get_all(self):
        return self._repo.get_all()
        
    def get_by_id(self, id: int):
        return self._repo.get_by_id(id)

    def create(self, data: dict):
        return self._repo.create(data)

    def update(self, id: int, data: dict):
        return self._repo.update(id, data)

    def delete(self, id: int, user_id: int = None) -> bool:
        item = self._repo.get_by_id(id)
        if item:
            snapshot = EResourceDepartmentSerializer(item).data
            self._recycle_repo.create(
                original_id=id,
                source_module='ERESOURCE_DEPT',
                item_name=item.name or f"Department {id}",
                data_snapshot=snapshot,
                user_id=user_id
            )
        return self._repo.delete(id)


class EResourceFileService(IEResourceFileService):
    def __init__(self, repo: IEResourceFileRepository):
        self._repo = repo
        self._recycle_repo = RecycleBinRepository()

    def get_all_files(self) -> List[Any]:
        return self._repo.get_all_active()

    def get_all(self):
        return self._repo.get_all()
        
    def get_by_id(self, id: int):
        return self._repo.get_by_id(id)

    def create(self, data: dict, uploaded_file=None):
        if uploaded_file:
            ext = uploaded_file.name.split('.')[-1].lower()
            allowed_extensions = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'csv', 'xlsx'}
            if ext not in allowed_extensions:
                raise ValidationError({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'})
            MalwareScannerHelper.verify_file_safety(uploaded_file)
            data['file'] = uploaded_file
            
        if 'is_active' in data:
            val = data['is_active']
            if isinstance(val, str):
                data['is_active'] = val.lower() in ('true', '1', 'on', 'yes')
        else:
            data['is_active'] = False
            
        return self._repo.create(data)

    def update(self, id: int, data: dict):
        return self._repo.update(id, data)

    def delete(self, id: int, user_id: int = None) -> bool:
        item = self._repo.get_by_id(id)
        if item:
            snapshot = EResourceFileSerializer(item).data
            self._recycle_repo.create(
                original_id=id,
                source_module='ERESOURCE_FILE',
                item_name=item.title or f"E-Resource File {id}",
                data_snapshot=snapshot,
                user_id=user_id
            )
        return self._repo.delete(id)
