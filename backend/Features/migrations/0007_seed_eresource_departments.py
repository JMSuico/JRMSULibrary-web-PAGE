# [Layer: Data/Migrations] — 0007_seed_eresource_departments.py
# Data migration that seeds the initial E-Resource department folder structure
# for the Local Books TreeView based on standard library classifications.
# This uses Django's RunPython — it does NOT alter the schema.

from django.db import migrations


DEPARTMENTS = [
    # Root departments (no parent)
    # (name, order, sub_departments)
    ('General Works', 1, [
        ('Encyclopedias & General Reference', 1),
        ('Library & Information Science', 2),
        ('General Periodicals', 3),
    ]),
    ('Philosophy & Psychology', 2, [
        ('Metaphysics', 1),
        ('Psychology', 2),
        ('Ethics & Moral Philosophy', 3),
    ]),
    ('Religion', 3, [
        ('Christianity', 1),
        ('Islam', 2),
        ('Other Religions', 3),
    ]),
    ('Social Sciences', 4, [
        ('Political Science', 1),
        ('Economics', 2),
        ('Law', 3),
        ('Public Administration', 4),
        ('Education', 5),
        ('Sociology & Anthropology', 6),
        ('Statistics', 7),
    ]),
    ('Language', 5, [
        ('Filipino Language', 1),
        ('English Language', 2),
        ('Other Languages', 3),
    ]),
    ('Natural Sciences & Mathematics', 6, [
        ('Mathematics', 1),
        ('Physics', 2),
        ('Chemistry', 3),
        ('Biology', 4),
        ('Environmental Science', 5),
    ]),
    ('Technology & Applied Sciences', 7, [
        ('Engineering', 1),
        ('Agriculture', 2),
        ('Computer Science & Information Technology', 3),
        ('Medicine & Health Sciences', 4),
        ('Home Economics', 5),
    ]),
    ('Arts & Recreation', 8, [
        ('Fine Arts', 1),
        ('Music', 2),
        ('Sports & Recreation', 3),
    ]),
    ('Literature', 9, [
        ('Filipino Literature', 1),
        ('English Literature', 2),
        ('World Literature', 3),
    ]),
    ('History & Geography', 10, [
        ('Philippine History', 1),
        ('World History', 2),
        ('Biography & Genealogy', 3),
        ('Geography & Travel', 4),
    ]),
    ('Theses & Dissertations', 11, [
        ('Undergraduate Theses', 1),
        ('Graduate Theses & Dissertations', 2),
    ]),
    ('Government Publications', 12, []),
    ('Serials & Periodicals', 13, []),
]


def seed_departments(apps, schema_editor):
    EResourceDepartment = apps.get_model('Features', 'EResourceDepartment')
    
    for name, order, sub_depts in DEPARTMENTS:
        root, _ = EResourceDepartment.objects.get_or_create(
            name=name,
            parent=None,
            defaults={'order': order}
        )
        for sub_name, sub_order in sub_depts:
            EResourceDepartment.objects.get_or_create(
                name=sub_name,
                parent=root,
                defaults={'order': sub_order}
            )


def unseed_departments(apps, schema_editor):
    EResourceDepartment = apps.get_model('Features', 'EResourceDepartment')
    names = [name for name, _, _ in DEPARTMENTS]
    EResourceDepartment.objects.filter(name__in=names, parent=None).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('Features', '0006_alter_contactmessage_status_recyclebin'),
    ]

    operations = [
        migrations.RunPython(seed_departments, reverse_code=unseed_departments),
    ]
