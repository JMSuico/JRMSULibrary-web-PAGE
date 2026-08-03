from django.db import migrations
import json

def seed_faq_cache(apps, schema_editor):
    AIFaqCache = apps.get_model('Features', 'AIFaqCache')
    
    faq_data = {
      "what are the library hours": ["The JRMSU-KC Library is open from Monday to Friday, 8:00 AM to 5:00 PM, with no noon break."],
      "is the library open on weekends": ["The library is closed on Saturdays, Sundays, and regular public holidays unless otherwise announced."],
      "who can use the library": ["All currently enrolled students, faculty, and staff of JRMSU Katipunan Campus with a valid school ID can use the library."],
      "how can i borrow a book": ["To borrow a book, present your valid school ID to the circulation desk along with the book you wish to borrow. The librarian will scan it into the automated system."],
      "how many books can i borrow": ["Students can borrow up to 3 books at a time for a period of 3 days. Faculty members can borrow up to 5 books for one week."],
      "can i renew a borrowed book": ["Yes, you can renew a book once for another 3 days, provided no other student has reserved it."],
      "what is the penalty for late returns": ["The overdue fine is Php 5.00 per book per day, excluding weekends and holidays."],
      "what happens if i lose a book": ["If you lose a book, you must report it immediately to the librarian. You will be required to replace it with the exact same title and edition, or pay its current market value plus a processing fee."],
      "can i borrow magazines or newspapers": ["Periodicals like magazines, journals, and newspapers are for strictly inside-library use only."],
      "where is the filipiniana section": ["The Filipiniana section is located on the right side of the library upon entering, just past the circulation desk."],
      "where are the it books": ["Information Technology (IT) and Computer Science books are located in the 000-099 section of the General Circulation area."],
      "where are the nursing books": ["Nursing and medical books are located in the 610 section (Applied Sciences) in the General Circulation area."],
      "do you have thesis copies": ["Yes, completed thesis and research papers are available in the Research Section. However, they are for inside use only and cannot be photocopied."],
      "how do i access e-resources": ["You can browse the E-Resources tab on this website to download digital modules, PDFs, and links provided by your departments."],
      "do i need internet to use e-resources": ["Yes, downloading E-Resources requires an internet connection, but once downloaded, you can read them offline."],
      "is there free wifi in the library": ["Yes, JRMSU-KC provides free Wi-Fi access for research purposes. Ask the librarian for the current semester's password."],
      "can i charge my laptop": ["Yes, charging stations are available in the designated study areas. Please do not leave your devices unattended."],
      "can i bring food inside": ["No. Eating and drinking (except water in sealed tumblers) are strictly prohibited inside the library to protect the books and equipment."],
      "can i bring my bag inside": ["Bags must be deposited at the baggage counter near the entrance. Only valuables (wallets, phones, laptops) and notebooks should be brought inside."],
      "how do i access the main campus uopac": ["To access the Main Campus UOPAC, visit the official JRMSU OPAC link. Use your student ID number as your username. Rizal can guide you through the search process if you need help."],
      "how do i search in uopac": ["Once logged into UOPAC, use the search bar to type the title, author, or subject. Use the filters on the left to narrow down by campus or material type."],
      "what is uopac": ["UOPAC stands for Unified Online Public Access Catalog. It is a system that allows you to search for books available across all JRMSU campuses."],
      "who is rizal": ["I am Rizal, the AI Assistant for the JRMSU-KC Library. I am here to help you find books, understand library policies, and navigate our resources!"],
      "who created rizal": ["I was developed by the brilliant future researchers of JRMSU Katipunan Campus as part of their Library Management System thesis project."],
      "can rizal write my essay": ["I am specialized in library assistance, book recommendations, and JRMSU-KC policies. I cannot write academic essays for you, but I can suggest great books for your research!"],
      "do i need a library card": ["Your validated JRMSU Student ID serves as your official library card. Make sure it is scanned for the automated log-in upon entry."],
      "what is the automated borrow and return process": ["The automated process uses a barcode scanner. The librarian scans your ID and the book's barcode to instantly record the transaction in the database, making it fast and accurate."],
      "can i reserve a book online": ["Currently, book reservations must be done in person at the circulation desk. If a book is borrowed, you can ask the librarian to place you on the waitlist."],
      "where can i read silently": ["The Silent Study Area is located at the back of the library. Please observe strict silence in this zone."],
      "are group studies allowed": ["Yes, there is a designated collaborative area where quiet discussions are allowed. Please keep your voices low so as not to disturb others."],
      "can outsiders use the library": ["Visiting researchers from other schools may use the library upon presenting a valid ID and a referral letter from their Chief Librarian, subject to a research fee."],
      "how do i get a referral letter": ["If you need to visit the Main Campus library or another institution, request a referral letter from the JRMSU-KC Chief Librarian at least one day in advance."],
      "where is the cr": ["The restrooms are located outside the main library doors, down the hall to your left."],
      "can i use the library computers": ["Yes, the library provides computer units for OPAC searching and academic research. Gaming and social media are prohibited."],
      "how long can i use the computer": ["Computer usage is limited to 1 hour per student to allow others a chance to use them, though this may be extended if no one is waiting."],
      "do you have a printer": ["The library does not currently offer printing services. Please use the printing stalls located near the campus gate."],
      "what is a clearance": ["A library clearance proves you have no unreturned books or unpaid fines. It is required at the end of every semester before enrollment or graduation."],
      "how do i get my clearance signed": ["Present your clearance form to the circulation desk. The librarian will check the automated system to ensure your account is clear."],
      "why wasn't my clearance signed": ["If your clearance was not signed, you likely have an overdue book or unpaid penalty. Check with the librarian to settle your account."],
      "can someone else return my book": ["Yes, you can ask a friend to return your book to the circulation desk to avoid late fines. However, you are still responsible if the book is damaged."],
      "what if the book gets wet": ["Water damage is considered severe. You will be required to replace the book or pay for its replacement cost."],
      "can i highlight a book": ["No. Writing, highlighting, or tearing pages from library books is considered vandalism and is subject to disciplinary action."],
      "how do i suggest a book": ["You can use the 'Feedback' section on this website or talk to the librarian to recommend titles you need for your course."],
      "who is the librarian": ["Please approach the front circulation desk to speak with our friendly JRMSU-KC registered librarians and student assistants."],
      "how are books arranged": ["Books are arranged using the Dewey Decimal Classification (DDC) system, which groups books by subject using numbers from 000 to 999."],
      "what is 000 in ddc": ["000 covers Computer Science, Information, and General Works."],
      "what is 100 in ddc": ["100 covers Philosophy and Psychology."],
      "what is 200 in ddc": ["200 covers Religion."],
      "what is 300 in ddc": ["300 covers Social Sciences, including Education, Law, and Economics."],
      "what is 400 in ddc": ["400 covers Language and Linguistics."],
      "what is 500 in ddc": ["500 covers Pure Sciences like Mathematics, Physics, and Biology."],
      "what is 600 in ddc": ["600 covers Technology and Applied Sciences, including Engineering, Agriculture, and Medicine."],
      "what is 700 in ddc": ["700 covers Arts and Recreation."],
      "what is 800 in ddc": ["800 covers Literature."],
      "what is 900 in ddc": ["900 covers History and Geography."],
      "how do i find a specific author": ["First, find the DDC subject number for the book. On the shelf, books within the same subject are arranged alphabetically by the author's last name."],
      "what does ref mean on a book": ["REF stands for Reference. These books (like dictionaries and encyclopedias) cannot be borrowed and must be used inside the library."],
      "what does fil mean on a book": ["FIL stands for Filipiniana. These are books written by Filipino authors, published in the Philippines, or about the Philippines."],
      "do you have board exam reviewers": ["Yes! Licensure examination reviewers for Criminology, Education, and Agriculture are available in the Reserve Section. They are usually for room use only."],
      "where is the reserve section": ["The Reserve Section is located directly behind the circulation desk. Ask the librarian to retrieve these books for you."],
      "can i borrow reserve books overnight": ["Reserve books can sometimes be borrowed overnight, 1 hour before the library closes. They must be returned within the first hour of opening the next day."],
      "what if i return an overnight book late": ["The penalty for late overnight books is strictly enforced, usually higher than regular circulation books. Return them promptly at 8:00 AM!"],
      "can i donate books": ["Yes! JRMSU-KC welcomes book donations. Please bring them to the Chief Librarian for evaluation and processing."],
      "do you have fiction books": ["Yes, we have a selection of fiction and novels located in the 800 section and a dedicated recreational reading corner."],
      "is there a dress code": ["Yes, the library strictly follows the JRMSU Katipunan Campus dress code. Students in inappropriate attire (e.g., sando, shorts, slippers) will be denied entry."],
      "what should i do if the fire alarm rings": ["Leave your books on the tables and exit calmly through the main doors or emergency exits. Do not stop to get your deposited bags."],
      "can i take photos of the books": ["You may take pictures of specific pages for research, but scanning entire books violates copyright laws."],
      "how can i contact the library": ["You can send us a message through the 'Contact Us' page on this website, and the staff will reply to your email."],
      "does the library have a facebook page": ["Yes, search for the official JRMSU Katipunan Campus Library page on Facebook for announcements and events."],
      "do you offer library orientation": ["Yes, a library orientation is conducted every start of the academic year for all freshmen and transferees."],
      "what is a call number": ["A call number is like a book's address. It is found on the spine of the book and tells you exactly where to find it on the shelf (e.g., 370.15 B32)."],
      "how do i read a call number": ["Read it line by line: first by the DDC number (e.g., 370), then alphabetically by the author's letter, then by the following decimal numbers."],
      "can the ai find my book": ["I can tell you the general section and shelf where your subject is located, but you should check the OPAC for the exact real-time availability."],
      "are there e-books available": ["Yes, check the E-Resources section of this website. If your department has uploaded PDFs or links, you can access them there."],
      "can i use my phone": ["Phones must be set to silent mode. If you need to take a call, please step outside the library."],
      "what is an automated library system": ["It means our cataloging, borrowing, returning, and tracking of books is done digitally using software and barcode scanners, rather than manual index cards."],
      "why is automation better": ["Automation allows for faster transactions, accurate tracking of penalties, instant searching of available books, and robust data security."],
      "how secure is my data": ["Your data is highly secure. The system uses encrypted sessions, Row Level Security, and strict authentication to protect your student information."],
      "can i reset my password": ["If you are a library admin, you can reset your password from the login screen. Students do not need to log in to browse the website."],
      "where can i give feedback": ["You can submit your thoughts, suggestions, or complaints using the Feedback Form on the home page."],
      "do you have audio visual materials": ["Yes, CDs and DVDs accompanying textbooks are kept at the circulation desk. Ask the librarian for access."],
      "what is the periodicals section": ["This section contains magazines, academic journals, newspapers, and bounded serials. They provide the most up-to-date research information."],
      "how often are new books added": ["New books are acquired every semester. You can see the latest additions in the 'Newly Acquired Books' carousel on the home page."],
      "can i recommend a book for the library to buy": ["Yes! We highly encourage students and faculty to submit purchase recommendations to the librarian to improve our collection."],
      "what is an isbn": ["ISBN stands for International Standard Book Number. It is a unique 13-digit code used to identify a specific book edition."],
      "where is the library located": ["The library is located inside the JRMSU Katipunan Campus. Ask the guard at the main gate for directions to the Library Building."],
      "can i do my project inside": ["Yes, you can do academic projects, assignments, and research inside, as long as you maintain a quiet environment."],
      "is sleeping allowed": ["No. The library is a place for active research and study. Sleeping is not allowed."],
      "can i leave my things on the table": ["Do not leave your valuables unattended. The library is not responsible for lost items. If you leave your seat for a long time, take your things with you."],
      "how do i know if a book is available": ["You can check the UOPAC system. If the status says 'Available', it should be on the shelf. If it says 'Checked Out', another student has borrowed it."],
      "what is a bibliography": ["A bibliography is a list of all the sources (books, articles, websites) you used when writing your research paper."],
      "can rizal help me with citations": ["I can explain the difference between APA and MLA formats, but I recommend consulting the official manuals located in the Reference section for accuracy."],
      "what is apa format": ["APA (American Psychological Association) is the standard citation style used for Social Sciences, Education, and Psychology."],
      "what is mla format": ["MLA (Modern Language Association) is the standard citation style used for Literature, Arts, and Humanities."],
      "are there dictionaries in the library": ["Yes, English, Tagalog, and subject-specific dictionaries are available in the Reference (REF) section."],
      "can i check my fines online": ["Currently, you must ask the librarian at the circulation desk to check your outstanding fines in the system."],
      "why is the library important": ["The library is the heart of the university. It provides verified, peer-reviewed information essential for your academic success and critical thinking."],
      "what makes this library system unique": ["This system is unique because it integrates an AI Assistant (Rizal) directly into the web platform, making it incredibly easy for students to find answers instantly!"],
      "thank you": ["You're very welcome! If you need anything else, I'm always here to help. Happy studying!"],
      "hello": ["Hello! Welcome to the JRMSU Katipunan Campus Library. How can I assist you today?"]
    }
    
    for question, answers in faq_data.items():
        if not AIFaqCache.objects.filter(question=question).exists():
            AIFaqCache.objects.create(question=question, answers=answers)

def reverse_seed(apps, schema_editor):
    AIFaqCache = apps.get_model('Features', 'AIFaqCache')
    AIFaqCache.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ('Features', '0034_aifaqcache'),
    ]

    operations = [
        migrations.RunPython(seed_faq_cache, reverse_seed),
    ]
