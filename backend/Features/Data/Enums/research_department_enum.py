from django.db import models


class ResearchDepartment(models.TextChoices):
    BSF = 'Research of Bachelor of Science in Forestry (BSF)', 'Research of Bachelor of Science in Forestry (BSF)'
    BSCS = 'Research Books for Bachelor of Science in Computer Science', 'Research Books for Bachelor of Science in Computer Science'
    ABM = 'Research Books for Agri. Business Management', 'Research Books for Agri. Business Management'
    SECONDARY = 'Narrative Report of Secondary Education', 'Narrative Report of Secondary Education'
