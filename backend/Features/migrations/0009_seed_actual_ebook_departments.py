# [Layer: Data/Migrations] — 0009_seed_actual_ebook_departments.py
# Data migration that replaces the Dewey Decimal classifications with the actual
# Local Books folder hierarchy requested by the user.

from django.db import migrations

OLD_DEPARTMENTS = [
    'General Works', 'Philosophy & Psychology', 'Religion', 'Social Sciences',
    'Language', 'Natural Sciences & Mathematics', 'Technology & Applied Sciences',
    'Arts & Recreation', 'Literature', 'History & Geography',
    'Theses & Dissertations', 'Government Publications', 'Serials & Periodicals'
]

NEW_TREE = [
  {
    "name": "AGRI",
    "children": [
      {
        "name": "BS Agriculture",
        "children": []
      }
    ]
  },
  {
    "name": "CAF",
    "children": [
      {
        "name": "BIOSYSTEM ENGINEERING",
        "children": [
          {
            "name": "1st year",
            "children": []
          },
          {
            "name": "2ND YEAR",
            "children": []
          },
          {
            "name": "3rd year",
            "children": []
          },
          {
            "name": "Fourth Year",
            "children": []
          },
          {
            "name": "Other related books for BSABE",
            "children": []
          }
        ]
      }
    ]
  },
  {
    "name": "CBA",
    "children": []
  },
  {
    "name": "CCS",
    "children": [
      {
        "name": "BSCS",
        "children": []
      },
      {
        "name": "BSIS",
        "children": [
          {
            "name": "Data Structures an Algorithms",
            "children": []
          },
          {
            "name": "Discrete Mathematics",
            "children": []
          },
          {
            "name": "Enterprise Architecture",
            "children": []
          },
          {
            "name": "Evaluation of Business Performance",
            "children": []
          },
          {
            "name": "Financial Management",
            "children": []
          },
          {
            "name": "Fundamentals of Information Systems",
            "children": []
          },
          {
            "name": "Fundamentals of Programming",
            "children": []
          },
          {
            "name": "Information Management",
            "children": []
          },
          {
            "name": "Intermediate Programming",
            "children": []
          },
          {
            "name": "Intro to 2D Animation",
            "children": []
          },
          {
            "name": "Introduction to Computing",
            "children": []
          },
          {
            "name": "IT Infrastructure & Network Techonologies",
            "children": []
          },
          {
            "name": "Mathematics in the Modern World",
            "children": []
          },
          {
            "name": "Multimedia Systems",
            "children": []
          },
          {
            "name": "Object Oriented Programming",
            "children": []
          },
          {
            "name": "PC Troubleshooting and Networking",
            "children": []
          },
          {
            "name": "Quantitative Methods",
            "children": []
          },
          {
            "name": "Science, Technology and Society",
            "children": []
          },
          {
            "name": "Web Systems and Technologies",
            "children": []
          }
        ]
      }
    ]
  },
  {
    "name": "CTED",
    "children": [
      {
        "name": "BEED",
        "children": []
      },
      {
        "name": "BPE",
        "children": [
          {
            "name": "Applied Motor Control and Learning of Exercise Sports and Dance",
            "children": []
          },
          {
            "name": "Assessment in Learning 1",
            "children": []
          },
          {
            "name": "Assessment in Learning 2",
            "children": []
          },
          {
            "name": "Building and Enhancing New Literacies  Across the Curriculum",
            "children": []
          },
          {
            "name": "Coordinated School Health Program",
            "children": []
          },
          {
            "name": "Curriculum and Assessment for Physical Education and Health Education",
            "children": []
          },
          {
            "name": "Dalumat sa Filipino",
            "children": []
          },
          {
            "name": "Drug Education , Consumer Health Education and Healthy Eating",
            "children": []
          },
          {
            "name": "Emergency Preparedness and Safety Management",
            "children": []
          },
          {
            "name": "Foundation of Special and Inclusive Education",
            "children": []
          },
          {
            "name": "Individual and Dual Sports (Racket Sports, Athletics, Martial Arts)",
            "children": []
          },
          {
            "name": "International Dance and Other Forms",
            "children": []
          },
          {
            "name": "Personal, Community and Environmental Health",
            "children": [
              {
                "name": "Emergency Preparedness and Safety Management",
                "children": []
              }
            ]
          },
          {
            "name": "Philippine Dance and Other Forms",
            "children": []
          },
          {
            "name": "Philippine Government and Constitution",
            "children": []
          },
          {
            "name": "Philippine Traditional Dances",
            "children": []
          },
          {
            "name": "Process of Teaching PE & Health Education",
            "children": []
          },
          {
            "name": "Research 1",
            "children": [
              {
                "name": "Research 1",
                "children": []
              }
            ]
          },
          {
            "name": "Research 2",
            "children": []
          },
          {
            "name": "Sports and Exercise Psychology",
            "children": []
          },
          {
            "name": "Technology Application 2",
            "children": []
          },
          {
            "name": "The Teacher and the School Curriculum",
            "children": []
          },
          {
            "name": "The Teaching Profession",
            "children": []
          }
        ]
      }
    ]
  }
]


def create_nodes(EResourceDepartment, nodes, parent=None, start_order=1):
    for idx, node in enumerate(nodes):
        dept, _ = EResourceDepartment.objects.get_or_create(
            name=node['name'],
            parent=parent,
            defaults={'order': start_order + idx}
        )
        if node.get('children'):
            create_nodes(EResourceDepartment, node['children'], parent=dept)

def seed_actual_departments(apps, schema_editor):
    EResourceDepartment = apps.get_model('Features', 'EResourceDepartment')
    
    # 1. Delete the old Dewey Decimal root nodes (which cascades to children)
    EResourceDepartment.objects.filter(name__in=OLD_DEPARTMENTS, parent=None).delete()
    
    # 2. Insert the actual department tree
    create_nodes(EResourceDepartment, NEW_TREE)

def unseed_actual_departments(apps, schema_editor):
    EResourceDepartment = apps.get_model('Features', 'EResourceDepartment')
    root_names = [n['name'] for n in NEW_TREE]
    EResourceDepartment.objects.filter(name__in=root_names, parent=None).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('Features', '0008_seed_online_access_and_page_content'),
    ]

    operations = [
        migrations.RunPython(seed_actual_departments, reverse_code=unseed_actual_departments),
    ]
