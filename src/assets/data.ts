export const assets = {
  logos: {
    jrmsu: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABIe9XCBcYPIEsrc9KlZAXCjtNQg8zwbdkRWLMxPqmxFpfIh8eqiGW4toa-oWNSExQKbi3G3NGT2UbvoXUfsQ095y5BnyVwukyWEtwJo3rYE9syzP9snDmMY-7uDUiclsKhkHo2x_LXY32xyESJF7tdiA-NRSAZgnX4W3BpYn3LP79v163HAh5RwgNS8bj0OYbzGyzljPTqzp3s3rqMbfW1WBr3b8SHkmTq2igVPyKP4BRfcqHQhJCGPalhZKXcCaY599Z93_DGUpq'
  },
  images: {
    chiefLibrarian: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF64-Dr5jxyLaAfGblA6TVGOZPELh2cQO4fF1r8aMy47Lvutv-eUBibW_BNfbw2WPH__7A11NSFbQkRReklxenENCThxupL97Q47g2RDxjIlXD6SRbWrRWMal176fwlKcNFzVbcFisPS1Iv44tcJX6VjuyEc2CfhTfiNxv53pd3WbciUCDczqpkSVXZYcCU7KmIy8qaEJh-83GwP4wqY5pim0y2wYFn3oYzhYmnNRClJhhLA_9YdEyETcM_FkPWwl2FsSHr5J5t530'
  }
};

export const feedbackImages = [
  { id: 1, file: '1.jpg' },
  { id: 2, file: '2.jpg' },
  { id: 3, file: '3.jpg' },
  { id: 4, file: '4.jpg' },
  { id: 5, file: '5.jpg' },
  { id: 6, file: '6.jpg' },
  { id: 7, file: '7.jpg' },
  { id: 8, file: '8.jpg' },
  { id: 9, file: '9.jpg' },
  { id: 10, file: '10.jpg' },
];

export const externalServiceImages = [
  { id: 1, file: '1.jpg' },
  { id: 2, file: '2.jpg' },
  { id: 3, file: '3.jpg' },
  { id: 4, file: '4.jpg' },
  { id: 5, file: '5.jpg' },
  { id: 6, file: '6.jpg' },
  { id: 7, file: '7.jpg' },
  { id: 8, file: '8.jpg' },
  { id: 9, file: '9.jpg' },
  { id: 10, file: '10.jpg' },
  { id: 11, file: '11.jpg' },
  { id: 12, file: '12.jpg' },
  { id: 13, file: '13.jpg' },
  { id: 14, file: '14.jpg' },
  { id: 15, file: '15.jpg' },
  { id: 16, file: '16.jpg' },
  { id: 17, file: '17.jpg' },
  { id: 18, file: '18.jpg' },
  { id: 19, file: '19.jpg' },
  { id: 20, file: '20.jpg' },
];

export const libraryServices = [
  {
    id: 'clearance-online',
    title: 'Signing of Library Clearance',
    subtitle: 'Online Transaction',
    badgeType: 'external' as const,
    whoMayAvail: 'Students',
    totalTime: '18 minutes',
    totalFee: 'Free',
    requirements: [
      'Clearance form',
      "Borrower's Card / Clear Record in ILS",
    ],
    steps: [
      { step: '01', client: 'Log in to jrmsu-arms.online and click student portal', agency: 'Log in to jrmsu-arms.online and click designee portal', fees: 'None', time: '5 min' },
      { step: '02', client: 'Request online clearance signing', agency: 'View and check Student Clearance Request', fees: 'None', time: '3 min' },
      { step: '03', client: 'Wait for processing and approval', agency: 'Check records and process online clearance', fees: 'None', time: '3 min' },
      { step: '04', client: 'Accomplish customer feedback form', agency: 'Provide CSM form or link: www.jrmsu.online/feedback', fees: 'None', time: '5 min' },
    ],
  },
  {
    id: 'borrowing-automated',
    title: 'Circulation — Borrowing Service',
    subtitle: 'Automated Transaction',
    badgeType: 'internal-ext' as const,
    whoMayAvail: 'Students, Faculty, Staff',
    totalTime: '23 minutes',
    totalFee: 'Free',
    requirements: [
      "Validated Student's ID (from OSAS)",
      'EDP (from Registrar)',
      'Faculty/Staff ID (from OSAS)',
    ],
    steps: [
      { step: '01', client: 'Select book(s) using OPAC', agency: 'Assist in locating materials', fees: 'None', time: '10 min' },
      { step: '02', client: 'Present ID and selected materials', agency: 'Check ID, login ILS, scan barcodes, print receipt', fees: 'None', time: '5 min' },
      { step: '03', client: 'Receive borrowed materials', agency: 'Release materials to borrower', fees: 'None', time: '3 min' },
      { step: '04', client: 'Accomplish feedback form', agency: 'Provide CSM form', fees: 'None', time: '5 min' },
    ],
  },
  {
    id: 'borrowing-manual',
    title: 'Circulation — Borrowing Service',
    subtitle: 'Manual Transaction',
    badgeType: 'internal-ext' as const,
    whoMayAvail: 'Students, Faculty, Staff',
    totalTime: '26 minutes',
    totalFee: 'Free',
    requirements: [
      "Validated Student's ID (from OSAS)",
      'EDP (from Registrar)',
      'Faculty/Staff ID (from OSAS)',
    ],
    steps: [
      { step: '01', client: 'Select book(s) using OPAC', agency: 'Assist in locating materials', fees: 'None', time: '10 min' },
      { step: '02', client: 'Present ID and selected materials', agency: 'Check and verify ID and materials', fees: 'None', time: '5 min' },
      { step: '03', client: 'Fill-out book card and borrowers card', agency: 'Check signed cards', fees: 'None', time: '3 min' },
      { step: '04', client: 'Receive borrowed materials', agency: 'Release materials, keep borrower card', fees: 'None', time: '3 min' },
      { step: '05', client: 'Accomplish feedback form', agency: 'Provide CSM form', fees: 'None', time: '5 min' },
    ],
  },
  {
    id: 'returning-automated',
    title: 'Circulation — Returning Service',
    subtitle: 'Automated Transaction',
    badgeType: 'internal-ext' as const,
    whoMayAvail: 'Students, Faculty, Staff',
    totalTime: '23 minutes',
    totalFee: 'PHP 10/hr overdue',
    requirements: [
      'Borrowed book(s) or materials',
      'For Overdue: Official Receipt from Cashier',
    ],
    steps: [
      { step: '01', client: 'Present borrowed materials to circulation', agency: 'Scan/swipe book barcode in ILS return dashboard', fees: 'None', time: '3 min' },
      { step: '02', client: 'For Overdue: Pay at cashier, present OR', agency: 'Calculate fines, record OR in logbook', fees: 'PHP 10/hr', time: '15 min', isOverdue: true },
      { step: '03', client: 'Accomplish feedback form', agency: 'Provide CSM form', fees: 'None', time: '5 min' },
    ],
  },
  {
    id: 'returning-manual',
    title: 'Circulation — Returning Service',
    subtitle: 'Manual Transaction',
    badgeType: 'internal-ext' as const,
    whoMayAvail: 'Students, Faculty, Staff',
    totalTime: '27 minutes',
    totalFee: 'PHP 10/hr overdue',
    requirements: [
      'Borrowed book(s) or materials',
      'For Overdue: Official Receipt from Cashier',
    ],
    steps: [
      { step: '01', client: 'Present borrowed materials', agency: 'Receive/check book, record return, place card back', fees: 'None', time: '5 min' },
      { step: '02', client: 'For Overdue: Pay at cashier, present OR', agency: 'Calculate fines, instruct cashier, record OR', fees: 'PHP 10/hr', time: '15 min', isOverdue: true },
      { step: '03', client: 'Receive borrowers card', agency: 'Release card to borrower', fees: 'None', time: '2 min' },
      { step: '04', client: 'Accomplish feedback form', agency: 'Provide CSM form', fees: 'None', time: '5 min' },
    ],
  },
  {
    id: 'e-library',
    title: 'E-Library Services',
    subtitle: '',
    badgeType: 'e-library' as const,
    whoMayAvail: 'All users',
    totalTime: '19 minutes',
    totalFee: 'Free',
    requirements: [
      "Student's ID / Employee's ID / Alumni ID",
      'External: Referral Letter',
    ],
    steps: [
      { step: '01', client: 'Present ID for logbook, swipe at barcode reader', agency: 'Verify ID validity', fees: 'None', time: '3 min' },
      { step: '02', client: 'First-time: get username and password', agency: 'Issue credentials (30 hrs/semester)', fees: 'None', time: '5 min' },
      { step: '03', client: 'Proceed to workstation', agency: 'Assist and monitor as needed', fees: 'None', time: '3 min' },
      { step: '04', client: 'Log out account', agency: 'Instruct user to organize workstation', fees: 'None', time: '3 min' },
      { step: '05', client: 'Accomplish feedback form', agency: 'Provide CSM form', fees: 'None', time: '5 min' },
    ],
  },
  {
    id: 'clearance-manual',
    title: 'Signing of Library Clearance',
    subtitle: 'Manual Transaction',
    badgeType: 'internal' as const,
    whoMayAvail: 'Faculty and Staff',
    totalTime: '13 minutes',
    totalFee: 'Free',
    requirements: [
      'Return all borrowed book(s) or materials',
      'Faculty/Staff clearance form',
    ],
    steps: [
      { step: '01', client: 'Present clearance form', agency: 'Check records in ILS', fees: 'None', time: '5 min' },
      { step: '02', client: 'Wait for processing and approval', agency: 'Release signed clearance', fees: 'None', time: '3 min' },
      { step: '03', client: 'Accomplish feedback form', agency: 'Provide CSM form', fees: 'None', time: '5 min' },
    ],
  },
];

export const openAccessLinks = [
  { name: 'Agriculture', url: 'https://www.mdpi.com/journal/agriculture' },
  { name: 'List of Scientific Journals', url: 'https://en.wikipedia.org/wiki/Lists_of_academic_journals' },
  { name: 'List of Academic Journal', url: 'https://en.wikipedia.org/wiki/Lists_of_academic_journals' },
  { name: 'Worldcat', url: 'https://search.worldcat.org/' },
  { name: 'Google Books', url: 'https://books.google.com/?hl=en' },
  { name: 'Online Free E-Books', url: 'https://www.free-ebooks.net/' },
  { name: 'Gutenberg', url: 'https://www.gutenberg.org/' },
  { name: 'Scribd', url: 'https://www.scribd.com/' },
  { name: 'GetFreeEbooks', url: 'https://getfreeebooks.com/' },
  { name: 'DOST Publication', url: 'https://www.dost.gov.ph/index.php?option=com_content&task=view&id=712&Itemid=201' },
  { name: 'Highwire Press', url: 'https://www.highwirepress.com/' },
  { name: 'IPL Magazines', url: 'https://www.ipl.org/' },
];

export const resourcesLinks = [
  { name: 'Science Direct', url: 'https://www.sciencedirect.com/' },
  { name: 'Philippine Elib', url: 'https://www.elib.gov.ph/' },
  { name: 'ERIC Education Research', url: 'https://eric.ed.gov/' },
  { name: 'Gale Database', url: 'https://link.gale.com/apps/menu?userGroupName=phusm&prodId=MENU' },
  { name: 'Philippine E-Journals', url: 'https://ejournals.ph/' },
  { name: 'Springer Nature Link', url: 'https://link.springer.com/' },
  { name: 'E-Library USA', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdK93TrYAkWrl32xWxlOItfYFTTgUQPY_Ws2ZhxfuVMvojpiA/viewform' },
  { name: 'ProQuest', url: 'https://www.proquest.com/' },
  { name: 'Student Handbooks', url: 'https://drive.google.com/file/d/18erQ6LSfT3Jia84n77WBPOb1JfzI-tQj/view' },
];

export const acquiredELinks = [
  { name: 'Bookshelf (VitalSource)', url: 'https://www.vitalsource.com/' },
  { name: 'Scholaar', url: 'https://scholaar.com/' },
];
