# [Layer: Data/Migrations] — 0008_seed_online_access_and_page_content.py
# Data migration that seeds the initial Online Access Links and Page Content

from django.db import migrations


LINKS = [
    # Open Access Journal
    ('Agriculture', 'https://www.mdpi.com/journal/agriculture', 'Open Access Journal', 1),
    ('Lis of Scientific Journal', 'https://en.wikipedia.org/wiki/Lists_of_academic_journals', 'Open Access Journal', 2),
    ('List of Academic Journal', 'https://en.wikipedia.org/wiki/Lists_of_academic_journals', 'Open Access Journal', 3),
    ('Worldcat', 'https://search.worldcat.org/', 'Open Access Journal', 4),
    ('Google Book', 'https://books.google.com/?hl=en', 'Open Access Journal', 5),
    ('Online Free E-Books', 'https://www.free-ebooks.net/', 'Open Access Journal', 6),
    ('Gutenberg', 'https://www.free-ebooks.net/', 'Open Access Journal', 7),
    ('Scribd', 'https://www.scribd.com/', 'Open Access Journal', 8),
    ('GetFreeEbooks', 'https://getfreeebooks.com/', 'Open Access Journal', 9),
    ('DOST Publication', 'https://www.dost.gov.ph/index.php?option=com_content&task=view&id=712&Itemid=201&appgw_azwaf_jsc=YU_apB7IN_mPNkdEH_BnTZWX6lhlM7xFfn7z7yLstI4', 'Open Access Journal', 10),
    ('Highwire Press', 'https://www.highwirepress.com/', 'Open Access Journal', 11),
    ('IPL Magazines', 'https://www.ipl.org/', 'Open Access Journal', 12),
    
    # Resources
    ('Science Direct', 'https://www.sciencedirect.com/', 'Resources', 13),
    ('Philippine Elib', 'https://www.elib.gov.ph/', 'Resources', 14),
    ('ERIC Educ. Res. Info. Center', 'https://eric.ed.gov/', 'Resources', 15),
    ('Gale Database', 'https://link.gale.com/apps/menu?userGroupName=phusm&prodId=MENU', 'Resources', 16),
    ('Philippine E-Journals', 'https://ejournals.ph/', 'Resources', 17),
    ('Springer Nature Link', 'https://link.springer.com/', 'Resources', 18),
    ('E-Library USA', 'https://docs.google.com/forms/d/e/1FAIpQLSdK93TrYAkWrl32xWxlOItfYFTTgUQPY_Ws2ZhxfuVMvojpiA/viewform?fbclid=IwAR07NWjxpHNoE7hV4WL85sW_9xMSLKWsWn5gbpsXCDdEUuVVxt0HAny2GPM', 'Resources', 19),
    ('Seameo-innotech eBooks', '#', 'Resources', 20),
    ('ProQuest', '#', 'Resources', 21),

    # Acquired E-Resources
    ('Bookshelf', 'https://www.vitalsource.com/', 'Acquired E-Resources', 22),
    ('Scholaar', 'https://scholaar.com/', 'Acquired E-Resources', 23),
]

PAGE_CONTENTS = [
    (
        'about_history',
        'History of JRMSU Katipunan Campus',
        """<p>Jose Rizal Memorial State University was established by virtue of RA 9852 with Congresswoman Cecilia G. Jalosjos-Carreon as principal author, Congressman Cesar Jalosjos as co-author. It was approved by President Gloria Macapagal-Arroyo on December 15, 2009. It was formerly the Jose Rizal Memorial State College by virtue of RA 8193 sponsored by Congressman Romeo G. Jalosjos of the 1st District of Zamboanga del Norte which was approved on June 11, 1996 by the President of the Republic, Fidel V. Ramos. It was a consolidation of the Rizal Memorial Vocational School (RMNVS) in Dapitan City, the Zamboanga del Norte School of Arts and Trades (ZNSAT) in Dipolog City, and the Siocon National Vocational School (SNVS) in the Municipality of Siocon. In 2002, two higher education institutions (HEIs) within Zamboanga del Norte, namely the Katipunan National Agricultural School (KNAS) in the municipality of Katipunan and the Zamboanga del Norte Agricultural College (ZNAC) in the Municipality of Tampilisan, were integrated into then JRMSC pursuant to CHED Memorandum Order No. 27 series of 2000 thus comprising the fourth and fifth campuses, respectively of JRMSU.</p>
<p>The first President was Dr. Felipe O. Ligan who was appointed in 1997. On June 7, 2002 CHED Special Order No. 35, s. 2002 appointed Dr. Henry A. Sojor as the OIC President of the Jose Rizal Memorial State College in concurrent capacity as President of Central Visayas Polytechnic College in Dumaguete City now Negros Oriental State University.</p>
<p>In the span of two years and eight months, the Board of Trustee then deemed it best for the College to have its permanent leader. Thus, on March 1, 2005, Dr. Edgar S. Balbuena assumed office as second President of JRMSC pursuant to BOT Resolution No. 04, series of 2005 Chairmaned by Fr. Rolando V. Rosa, OP.</p>
<p>With the appointment of Dr. Balbuena, the College charted a new course. With his extraordinary leadership it took only four years and nine months for the College to be elevated to the status of a University. Indeed the growth of the University means a continuing and growing commitment for academic excellence and quality, research, and productivity, community involvement and partnership for national development and global competitiveness. Evidently, he emerged as a dynamo, leading the people of Zamboanga del Norte and adjacent provinces towards improved quality life.</p>"""
    ),
    (
        'about_quality',
        'JRMSU Library Quality Objectives',
        """<li>Increase the acquisition of print, digital, and multimedia resources by 10% annually to ensure modern, relevant, and accessible materials that support instruction, research, extension, and production.</li>
<li>Increase library user engagement by 10% and ensure the 100% provision of adaptive, inclusive, and transformative library facilities that foster creativity, critical thinking, and lifelong learning.</li>
<li>Forge at least one (1) local and one (1) international formal partnership or collaboration each year, and implement at least one (1) joint program or activity with academic institutions, government agencies, or library networks to strengthen resource sharing, collaboration, and service innovation.</li>
<li>Ensure that 100% of library personnel participate in at least two (2) capacity-building or professional development activities per year, strengthening their skills in technology, research support, customer service, and library management.</li>
<li>Achieve a minimum of 90% overall user satisfaction rating in the annual library survey by continuously delivering equitable, technology-driven, and user-centered services.</li>"""
    ),
    (
        'library_services',
        'Our 17 Library Services',
        """<p>Library User Education</p>
<p>Informal Reference Service</p>
<p>Readers Advisory Services</p>
<p>Technical Services</p>
<p>Audio-Visual Services</p>
<p>Circulation Services</p>
<p>Ask-a-Librarian / #AskRIZAL</p>
<p>Photo/Scan Me Service</p>
<p>OPAC Service</p>
<p>Printing Service</p>
<p>Property Counter Service</p>
<p>Selective Dissemination of Information</p>
<p>Current Awareness Services</p>
<p>Referral Information Service (RIS)</p>
<p>File Transfer Service</p>
<p>Internet / e-Library / Free Wi-Fi</p>
<p>Online Databases Service</p>"""
    ),
    (
        'personnel_text',
        'Librarian\'s Corner Text',
        """<p>From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence.</p>
<p>The Library of Jose Rizal Memorial State University Katipunan Campus is committed to supporting the University's Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources and services. In adherence to the standards, the library continuously enhances its collections, facilities, and technological services to meet the evolving needs of its academic community. It also promotes information literacy, strengthens research support, and fosters collaborative linkages to contribute to institutional development. The library remains dedicated to delivering quality services and nurturing a culture of lifelong learning among its users.</p>
<p>Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!</p>"""
    )
]


def seed_data(apps, schema_editor):
    ManagedLink = apps.get_model('Features', 'ManagedLink')
    PageContent = apps.get_model('Features', 'PageContent')
    
    for name, url, category, order in LINKS:
        ManagedLink.objects.get_or_create(
            name=name,
            defaults={'url': url, 'category': category, 'order': order}
        )

    for slug, title, content in PAGE_CONTENTS:
        PageContent.objects.get_or_create(
            slug=slug,
            defaults={'title': title, 'content': content}
        )


def unseed_data(apps, schema_editor):
    ManagedLink = apps.get_model('Features', 'ManagedLink')
    PageContent = apps.get_model('Features', 'PageContent')
    
    names = [name for name, _, _, _ in LINKS]
    ManagedLink.objects.filter(name__in=names).delete()

    slugs = [slug for slug, _, _ in PAGE_CONTENTS]
    PageContent.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('Features', '0007_seed_eresource_departments'),
    ]

    operations = [
        migrations.RunPython(seed_data, reverse_code=unseed_data),
    ]
