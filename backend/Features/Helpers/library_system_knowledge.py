from __future__ import annotations

# [Layer: Helpers] — library_system_knowledge.py
# Canonical, verified closed-world knowledge base and strategy helpers for all 7
# JRMSU Katipunan Campus Library system sections (Home, About, Services & Citizens Charter,
# Administration, Personnel, Collection, Physical Setup), honorific stripping, and
# external hallucination interception.

from dataclasses import dataclass
import re
from typing import Any, Callable, Dict, FrozenSet, Iterable, List, Optional, Sequence, Tuple


# ---------------------------------------------------------------------------
# Canonical Honorifics & Person Name Normalization
# ---------------------------------------------------------------------------
HONORIFIC_TOKENS: FrozenSet[str] = frozenset(
    {
        "maam",
        "ma'am",
        "mam",
        "sir",
        "ms",
        "mrs",
        "mr",
        "miss",
        "dr",
        "prof",
        "engr",
        "atty",
        "dean",
        "chief",
        "librarian",
    }
)

_PERSON_QUERY_STOP_WORDS: FrozenSet[str] = frozenset(
    {
        "who",
        "is",
        "are",
        "was",
        "were",
        "whos",
        "tell",
        "me",
        "about",
        "do",
        "you",
        "know",
        "does",
        "the",
        "a",
        "an",
        "of",
        "in",
        "at",
        "for",
        "from",
        "to",
        "library",
        "jrmsu",
        "katipunan",
        "campus",
        "please",
        "can",
        "find",
        "search",
        "our",
        "your",
        "name",
        "person",
        "staff",
        "personnel",
    }
)

_SYSTEM_ENTITY_KEYWORDS: FrozenSet[str] = frozenset(
    {
        "rizal",
        "you",
        "yourself",
        "librarian",
        "librarians",
        "staff",
        "personnel",
        "president",
        "presidents",
        "jrmsu",
        "library",
        "katipunan",
        "author",
        "authors",
        "wrote",
        "written",
        "avail",
        "developer",
        "developers",
        "admin",
        "administrator",
        "cashier",
        "osas",
        "registrar",
        "ched",
        "creator",
        "created",
        "book",
        "books",
        "thesis",
        "theses",
        "service",
        "services",
        "collection",
        "opac",
        "uopac",
        "eresource",
        "eresources",
        "manual",
        "policy",
        "policies",
        "history",
        "objectives",
        "vision",
        "mission",
        "values",
        "floor",
        "room",
        "rooms",
        "workstation",
        "setup",
        "charter",
        "clearance",
        "overdue",
        "fine",
        "fines",
        "hours",
        "schedule",
        "gps",
        "location",
        "email",
        "website",
        "portal",
        "system",
        "database",
        "tables",
    }
)

_JRMSU_HISTORICAL_PEOPLE_TOKENS: FrozenSet[str] = frozenset(
    {
        "ligan",
        "felipe",
        "sojor",
        "henry",
        "balbuena",
        "edgar",
        "jalosjos",
        "carreon",
        "cecilia",
        "cesar",
        "romeo",
        "arroyo",
        "gloria",
        "macapagal",
        "ramos",
        "fidel",
        "rosa",
        "rolando",
        "rizal",
        "jose",
    }
)

_EXTERNAL_HALLUCINATION_PHRASES: Tuple[str, ...] = (
    "actress",
    "filipino actor",
    "american actor",
    "british actor",
    "korean actor",
    "hollywood actor",
    "television drama",
    "tv drama",
    "tv dramas",
    "tv show",
    "tv series",
    "entertainment industry",
    "singer-songwriter",
    "singer songwriter",
    "pop star",
    "pop singer",
    "pop albums",
    "pop album",
    "romantic comedies",
    "romantic comedy",
    "filmography",
    "discography",
    "box office",
    "grammy",
    "billboard",
    "netflix",
    "teleserye",
    "soap opera",
    "celebrity",
    "kapamilya",
    "kapuso",
    "abs-cbn",
    "gma network",
    "recording artist",
    "concert tour",
    "taylor swift",
    "kathryn bernardo",
)

_EXTERNAL_HALLUCINATION_REGEXES: Tuple[re.Pattern[str], ...] = (
    re.compile(
        r"\b(?:filipino|american|british|korean|hollywood)\s+"
        r"(?:actress|actor|singer|musician|rapper|celebrity|model|politician)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bknown\s+for\s+(?:tv\s+dramas?|television\s+dramas?|romantic\s+comedies?|"
        r"pop\s+albums?|her\s+roles?\s+in|his\s+roles?\s+in|starring\s+in|hit\s+songs?)\b",
        re.IGNORECASE,
    ),
)

_PERSON_INQUIRY_PATTERNS: Tuple[re.Pattern[str], ...] = (
    re.compile(
        r"^(?:(?:hi|hello|hey|good\s+(?:morning|afternoon|evening)|please)\s*,?\s*)*"
        r"(?:who\s+(?:is|was|are)|who's|whos)\s+(.+?)\s*\??$",
        re.IGNORECASE,
    ),
    re.compile(
        r"^(?:(?:hi|hello|hey|please)\s*,?\s*)*"
        r"(?:do\s+you\s+know|can\s+you\s+tell\s+me\s+(?:about|who\s+is)|tell\s+me\s+about)\s+"
        r"(.+?)\s*\??$",
        re.IGNORECASE,
    ),
)


# ---------------------------------------------------------------------------
# Canonical 7-Section Static & Fallback Data (Verified Frontend Truth)
# ---------------------------------------------------------------------------
CANONICAL_HOME_INFO: Dict[str, str] = {
    "institution": "Jose Rizal Memorial State University (JRMSU) — Katipunan Campus",
    "tagline": "The Premier University in the Province of Zamboanga del Norte",
    "hero_highlight": "Excellence in Information — The Gateway to Academic Excellence",
    "address": "Barangay Dos, Katipunan, Zamboanga del Norte, Philippines",
    "gps": "8.510047, 123.286297",
    "maps_url": "https://maps.google.com/?q=8.510047,123.286297",
    "contact_email": "katipunan.library@jrmsu.edu.ph",
    "alternate_email": "jrmsukclibrary@gmail.com",
    "facebook_name": "JRMSU Katipunan Library",
    "facebook_url": "https://www.facebook.com/JRMSUkatipunanlibrary",
    "uopac_registration_url": "https://library.jrmsu.edu.ph/opac/registration",
    "privacy_law": "Republic Act No. 10173 (Data Privacy Act of 2012)",
}

CANONICAL_ABOUT_HISTORY: str = (
    "Jose Rizal Memorial State University was established by virtue of RA 9852 with "
    "Congresswoman Cecilia G. Jalosjos-Carreon as principal author, Congressman Cesar Jalosjos "
    "as co-author. It was approved by President Gloria Macapagal-Arroyo on December 15, 2009. "
    "It was formerly the Jose Rizal Memorial State College by virtue of RA 8193 sponsored by "
    "Congressman Romeo G. Jalosjos of the 1st District of Zamboanga del Norte which was approved "
    "on June 11, 1996 by the President of the Republic, Fidel V. Ramos. It was a consolidation "
    "of the Rizal Memorial Vocational School (RMNVS) in Dapitan City, the Zamboanga del Norte "
    "School of Arts and Trades (ZNSAT) in Dipolog City, and the Siocon National Vocational "
    "School (SNVS) in the Municipality of Siocon. In 2002, two higher education institutions "
    "(HEIs) within Zamboanga del Norte, namely the Katipunan National Agricultural School (KNAS) "
    "in the municipality of Katipunan and the Zamboanga del Norte Agricultural College (ZNAC) "
    "in the Municipality of Tampilisan, were integrated into then JRMSC pursuant to CHED "
    "Memorandum Order No. 27 series of 2000 thus comprising the fourth and fifth campuses, "
    "respectively of JRMSU.\n\n"
    "The first President was Dr. Felipe O. Ligan who was appointed in 1997. On June 7, 2002 "
    "CHED Special Order No. 35, s. 2002 appointed Dr. Henry A. Sojor as the OIC President of "
    "the Jose Rizal Memorial State College in concurrent capacity as President of Central "
    "Visayas Polytechnic College in Dumaguete City now Negros Oriental State University.\n\n"
    "In the span of two years and eight months, the Board of Trustee then deemed it best for "
    "the College to have its permanent leader. Thus, on March 1, 2005, Dr. Edgar S. Balbuena "
    "assumed office as second President of JRMSC pursuant to BOT Resolution No. 04, series of "
    "2005 Chairmaned by Fr. Rolando V. Rosa, OP. With the appointment of Dr. Balbuena, the "
    "College charted a new course, and in four years and nine months the College was elevated "
    "to the status of a University."
)

CANONICAL_QUALITY_OBJECTIVES: Tuple[str, ...] = (
    "Increase the acquisition of print, digital, and multimedia resources by 10% annually to ensure modern, relevant, and accessible materials that support instruction, research, extension, and production.",
    "Increase library user engagement by 10% and ensure the 100% provision of adaptive, inclusive, and transformative library facilities that foster creativity, critical thinking, and lifelong learning.",
    "Forge at least one (1) local and one (1) international formal partnership or collaboration each year, and implement at least one (1) joint program or activity with academic institutions, government agencies, or library networks to strengthen resource sharing, collaboration, and service innovation.",
    "Ensure that 100% of library personnel participate in at least two (2) capacity-building or professional development activities per year, strengthening their skills in technology, research support, customer service, and library management.",
    "Achieve a minimum of 90% overall user satisfaction rating in the annual library survey by continuously delivering equitable, technology-driven, and user-centered services.",
)

CANONICAL_VMGO: Dict[str, str] = {
    "vision": "A dynamic and diverse internationally recognized university.",
    "mission": "Jose Rizal Memorial State University delivers quality education, transformative research, sustainable extension services, and innovative production.",
    "core_values": "God-centeredness, Excellence, Commitment, Integrity, Collaboration, and Accountability.",
}

CANONICAL_17_LIBRARY_SERVICES: Tuple[str, ...] = (
    "Library User Education",
    "Informal Reference Service",
    "Readers Advisory Services",
    "Technical Services",
    "Audio-Visual Services",
    "Circulation Services",
    "Ask-a-Librarian / #AskRIZAL",
    "Photo/Scan Me Service",
    "OPAC Service",
    "Printing Service",
    "Property Counter Service",
    "Selective Dissemination of Information",
    "Current Awareness Services",
    "Referral Information Service (RIS)",
    "File Transfer Service",
    "Internet / e-Library / Free Wi-Fi",
    "Online Databases Service",
)

CANONICAL_CITIZENS_CHARTER: Tuple[Dict[str, Any], ...] = (
    {
        "id": "clearance-online",
        "title": "Signing of Library Clearance (Online Transaction)",
        "category": "External",
        "who": "Students",
        "time": "18 minutes",
        "fee": "Free",
        "requirements": ("Clearance form", "Borrower's Card / Clear Record in ILS"),
        "steps": (
            "01: Log in to jrmsu-arms.online and click student portal (agency: designee portal) — 5 min",
            "02: Request online clearance signing — 3 min",
            "03: Wait for processing and approval in ILS — 3 min",
            "04: Accomplish customer feedback form (www.jrmsu.online/feedback) — 5 min",
        ),
        "keywords": ("clearance", "online clearance", "jrmsu-arms", "arms", "designee", "student portal", "feedback"),
    },
    {
        "id": "borrowing-automated",
        "title": "Circulation — Borrowing Service (Automated Transaction)",
        "category": "Internal/External",
        "who": "Students, Faculty, Staff",
        "time": "23 minutes",
        "fee": "Free",
        "requirements": (
            "Validated Student's ID (from OSAS)",
            "EDP (from Registrar)",
            "Faculty/Staff ID (from OSAS)",
        ),
        "steps": (
            "01: Select book(s) using OPAC — 10 min",
            "02: Present ID and selected materials (ILS barcode scan & receipt) — 5 min",
            "03: Receive borrowed materials — 3 min",
            "04: Accomplish feedback form — 5 min",
        ),
        "keywords": ("borrow", "borrowing", "automated", "osas", "edp", "registrar", "circulation", "ils", "barcode"),
    },
    {
        "id": "borrowing-manual",
        "title": "Circulation — Borrowing Service (Manual Transaction)",
        "category": "Internal/External",
        "who": "Students, Faculty, Staff",
        "time": "26 minutes",
        "fee": "Free",
        "requirements": (
            "Validated Student's ID (from OSAS)",
            "EDP (from Registrar)",
            "Faculty/Staff ID (from OSAS)",
        ),
        "steps": (
            "01: Select book(s) using OPAC — 10 min",
            "02: Present ID and selected materials — 5 min",
            "03: Fill-out book card and borrower's card — 3 min",
            "04: Receive borrowed materials — 3 min",
            "05: Accomplish feedback form — 5 min",
        ),
        "keywords": ("borrow", "borrowing", "manual", "book card", "borrowers card", "osas", "edp", "registrar"),
    },
    {
        "id": "returning-automated",
        "title": "Circulation — Returning Service (Automated Transaction)",
        "category": "Internal/External",
        "who": "Students, Faculty, Staff",
        "time": "23 minutes",
        "fee": "PHP 10/hr overdue",
        "requirements": (
            "Borrowed book(s) or materials",
            "For Overdue: Official Receipt (OR) from Cashier",
        ),
        "steps": (
            "01: Present borrowed materials to circulation (ILS barcode scan) — 3 min",
            "02: For Overdue: Pay PHP 10/hr at Cashier and present Official Receipt (OR) — 15 min",
            "03: Accomplish feedback form — 5 min",
        ),
        "keywords": ("return", "returning", "overdue", "fine", "fines", "penalty", "penalties", "cashier", "official receipt", "php 10", "late"),
    },
    {
        "id": "returning-manual",
        "title": "Circulation — Returning Service (Manual Transaction)",
        "category": "Internal/External",
        "who": "Students, Faculty, Staff",
        "time": "27 minutes",
        "fee": "PHP 10/hr overdue",
        "requirements": (
            "Borrowed book(s) or materials",
            "For Overdue: Official Receipt (OR) from Cashier",
        ),
        "steps": (
            "01: Present borrowed materials (check book, record return, place card back) — 5 min",
            "02: For Overdue: Pay PHP 10/hr at Cashier and present Official Receipt (OR) — 15 min",
            "03: Receive borrower's card — 2 min",
            "04: Accomplish feedback form — 5 min",
        ),
        "keywords": ("return", "returning", "overdue", "fine", "fines", "penalty", "penalties", "cashier", "official receipt", "manual"),
    },
    {
        "id": "e-library",
        "title": "E-Library Services",
        "category": "E-Library",
        "who": "All users",
        "time": "19 minutes",
        "fee": "Free",
        "requirements": (
            "Student's ID / Employee's ID / Alumni ID",
            "External: Referral Letter",
        ),
        "steps": (
            "01: Present ID for logbook and swipe at barcode reader — 3 min",
            "02: First-time: get username and password (30 hrs/semester allowance) — 5 min",
            "03: Proceed to workstation — 3 min",
            "04: Log out account and organize workstation — 3 min",
            "05: Accomplish feedback form — 5 min",
        ),
        "keywords": ("e-library", "elibrary", "e library", "semester", "30 hrs", "barcode", "logbook", "alumni", "referral letter", "credentials", "quota"),
    },
    {
        "id": "clearance-manual",
        "title": "Signing of Library Clearance (Manual Transaction)",
        "category": "Internal",
        "who": "Faculty and Staff",
        "time": "13 minutes",
        "fee": "Free",
        "requirements": (
            "Return all borrowed book(s) or materials",
            "Faculty/Staff clearance form",
        ),
        "steps": (
            "01: Present clearance form (check records in ILS) — 5 min",
            "02: Wait for processing and approval — 3 min",
            "03: Accomplish feedback form — 5 min",
        ),
        "keywords": ("clearance", "faculty clearance", "staff clearance", "manual clearance"),
    },
)

CANONICAL_COLLECTION_TABS: Tuple[Dict[str, str], ...] = (
    {
        "id": "newly-acquired",
        "label": "Newly Acquired Books",
        "route": "/collection/newly-acquired",
        "summary": "Physical newly acquired book cover photos and cataloged titles.",
    },
    {
        "id": "local-books",
        "label": "Local Books",
        "route": "/collection/local-books",
        "summary": "60 E-Resource Academic Department folders with downloadable curriculum PDFs in protected TreeView.",
    },
    {
        "id": "online",
        "label": "Online Access",
        "route": "/collection/online",
        "summary": "Curated academic databases and Open Access Journals (ScienceDirect, ERIC, Gale, DOAJ, Springer, etc.).",
    },
    {
        "id": "external-libraries",
        "label": "External Libraries",
        "route": "/collection/external-libraries",
        "summary": "VitalBooks (https://bookshelf.vitalsource.com/home/my-library) and Scholaar (https://scholaar.com/Login.aspx).",
    },
    {
        "id": "union-opac",
        "label": "Union OPAC",
        "route": "/collection/union-opac",
        "summary": "Centralized JRMSU Union Online Public Access Catalog at https://library.jrmsu.edu.ph/opac/.",
    },
    {
        "id": "research-references",
        "label": "Research & Thesis References",
        "route": "/collection/research-references",
        "summary": "Student theses, dissertations, and research references searchable by college department.",
    },
)

CANONICAL_MANAGED_FILE_CATEGORIES: Tuple[str, ...] = ("OrgStructure", "Manual", "Excellence")


# ---------------------------------------------------------------------------
# Honorific Stripping & Personnel Matching Helpers
# ---------------------------------------------------------------------------
def _normalize_apostrophes_and_punct(text: str) -> str:
    s = str(text or "").replace("\u2018", "'").replace("\u2019", "'").lower()
    s = re.sub(r"\bma['\s]?am\b", "maam", s)
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def strip_person_honorifics(text: str) -> str:
    """Strips Filipino & English honorific titles (Ma'am, Sir, Dr., Prof., Chief, etc.)."""
    cleaned = _normalize_apostrophes_and_punct(text)
    if not cleaned:
        return ""
    tokens = [tok for tok in cleaned.split() if tok not in HONORIFIC_TOKENS]
    return " ".join(tokens)


def extract_person_candidate_tokens(query: str) -> List[str]:
    """
    Extracts meaningful person-name tokens from a query after removing
    question boilerplate and honorifics (e.g. 'who is Maam Kiara' -> ['kiara']).
    """
    stripped = strip_person_honorifics(query)
    if not stripped:
        return []
    out: List[str] = []
    for tok in stripped.split():
        if tok in _PERSON_QUERY_STOP_WORDS:
            continue
        if len(tok) >= 2:
            out.append(tok)
    return out


def match_personnel_records(query: str, personnel_records: Sequence[Any]) -> List[Any]:
    """
    Matches live Personnel DB records against a user query after stripping honorifics.
    Matches against both `Personnel.name` and `Personnel.title` (excluding pure generic
    role words stripped as honorifics like 'librarian' or 'chief').
    """
    if not query or not personnel_records:
        return []

    candidate_tokens = extract_person_candidate_tokens(query)
    if not candidate_tokens:
        return []

    scored: List[Tuple[float, int, Any]] = []
    for person in personnel_records:
        raw_name = str(getattr(person, "name", "") or "")
        raw_title = str(getattr(person, "title", "") or "")
        name_norm = _normalize_apostrophes_and_punct(raw_name)
        title_norm = _normalize_apostrophes_and_punct(raw_title)
        name_words = [w for w in name_norm.split() if len(w) >= 2]
        title_words = [w for w in title_norm.split() if len(w) >= 2]

        score = 0.0
        for tok in candidate_tokens:
            if tok in name_words:
                score += 6.0
            elif len(tok) >= 4 and any(w.startswith(tok) for w in name_words):
                score += 4.5
            elif tok in title_words:
                score += 2.5

        if score > 0.0:
            order_val = int(getattr(person, "order", 0) or 0)
            scored.append((score, order_val, person))

    scored.sort(key=lambda item: (-item[0], item[1], str(getattr(item[2], "name", "")).lower()))
    return [item[2] for item in scored]


# ---------------------------------------------------------------------------
# Closed-World Person Gate & Hallucination Detection
# ---------------------------------------------------------------------------
def extract_ungrounded_person_query(query: str) -> Optional[str]:
    """
    Detects 'who is <person>' / 'tell me about <person>' queries whose target is NOT
    a known JRMSU system entity, role, or historical university figure.
    Returns the target phrase if ungrounded, otherwise None.
    """
    if not query:
        return None
    raw = str(query).replace("\u2018", "'").replace("\u2019", "'").strip()
    if not raw:
        return None

    target: Optional[str] = None
    for pat in _PERSON_INQUIRY_PATTERNS:
        m = pat.match(raw)
        if m:
            target = (m.group(1) or "").strip(" \t\r\n?.!,;:\"'")
            break

    if not target:
        return None

    target_norm = _normalize_apostrophes_and_punct(target)
    if not target_norm:
        return None
    target_words = set(target_norm.split())

    # Never intercept queries about JRMSU entities, roles, catalog items, or historical figures
    if target_words & _SYSTEM_ENTITY_KEYWORDS:
        return None
    if target_words & _JRMSU_HISTORICAL_PEOPLE_TOKENS:
        return None

    # Check after stripping honorifics too (e.g. "who is Maam Kiara" -> target "Maam Kiara")
    stripped_words = [w for w in target_norm.split() if w not in HONORIFIC_TOKENS]
    if not stripped_words:
        return None

    # Keep reasonable person-name lengths (1-6 words)
    if len(target_norm.split()) > 6:
        return None

    return target


def is_external_hallucination_output(text: str) -> bool:
    """
    Detects external celebrity, actress/actor, entertainment, or pop-culture
    hallucinations produced by an LLM (Ollama or Claude).
    """
    if not text:
        return False
    lower = str(text).lower()
    if any(marker in lower for marker in _EXTERNAL_HALLUCINATION_PHRASES):
        return True
    return any(pat.search(lower) for pat in _EXTERNAL_HALLUCINATION_REGEXES)


def build_closed_world_refusal(subject: str = "") -> str:
    """
    Returns a deterministic, closed-world institutional boundary response stating
    that the requested person or external topic is not found in JRMSU Katipunan
    Campus Library's system records.
    """
    clean_subject = re.sub(r"\s+", " ", str(subject or "")).strip(" \"'")
    if clean_subject:
        lead = f"'{clean_subject}' was not found in JRMSU Katipunan Campus Library's system records."
    else:
        lead = "That information was not found in JRMSU Katipunan Campus Library's system records."
    return (
        f"{lead} "
        "I am restricted to verified information within JRMSU Katipunan Campus Library's "
        "7 system sections (Home, About, Services & Citizens Charter, Administration, Personnel, "
        "Collection, and Physical Setup) and live library database. "
        "Please visit /personnel for our official library staff directory or use 'Send an Email' "
        "to contact our Campus Librarian for further assistance."
    )


# ---------------------------------------------------------------------------
# Strategy-Driven Static System Section Resolver (Sections 1-7)
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class _SectionStrategy:
    """Strategy mapping query cues to a deterministic 7-section formatter."""

    section_id: str
    phrases: Tuple[str, ...]
    token_groups: Tuple[FrozenSet[str], ...]
    builder: Callable[[str, Dict[str, Any]], str]


def _format_home_response(_norm: str, live: Dict[str, Any]) -> str:
    settings = live.get("settings")
    visit_count = int(live.get("site_visit_count", 0) or 0)
    library_name = getattr(settings, "library_name", None) or "JRMSU Katipunan Campus Library"
    address = getattr(settings, "address", None) or CANONICAL_HOME_INFO["address"]
    contact_email = getattr(settings, "contact_email", None) or CANONICAL_HOME_INFO["contact_email"]
    alt_email = getattr(settings, "alternate_email", None) or CANONICAL_HOME_INFO["alternate_email"]
    phone_number = getattr(settings, "phone_number", None) or ""
    mon_fri = getattr(settings, "opening_hours_mon_fri", None) or "7:00 AM - 7:00 PM"
    sat = getattr(settings, "opening_hours_sat", None) or "Closed"
    sun = getattr(settings, "opening_hours_sun", None) or "Closed"

    # Ensure Barangay Dos appears clearly even if SiteSettings.address is abbreviated
    full_location = (
        address
        if "barangay dos" in str(address).lower()
        else f"{CANONICAL_HOME_INFO['address']} ({address})"
    )
    phone_line = f"\n- Phone: {phone_number}" if phone_number else ""
    visit_line = f"\n- Total Recorded Website Visits (`SiteVisit`): {visit_count:,}"

    return (
        f"{library_name} — Home & Campus Information (/):\n\n"
        f"- Tagline: {CANONICAL_HOME_INFO['tagline']}\n"
        f"- Location: {full_location}\n"
        f"- GPS Coordinates: {CANONICAL_HOME_INFO['gps']} (Map: {CANONICAL_HOME_INFO['maps_url']})\n"
        f"- Official Email: {contact_email}\n"
        f"- Alternate Email: {alt_email}{phone_line}\n"
        f"- Operating Hours: Monday–Friday {mon_fri} | Saturday: {sat} | Sunday: {sun}\n"
        f"- Facebook Page: {CANONICAL_HOME_INFO['facebook_name']} ({CANONICAL_HOME_INFO['facebook_url']})\n"
        f"- UOPAC Registration Link: {CANONICAL_HOME_INFO['uopac_registration_url']}\n"
        f"- Home Features: Live Open/Closed Clock, Feedback & Complaints Guide, External Services Gallery, and Data Privacy Notice ({CANONICAL_HOME_INFO['privacy_law']}){visit_line}"
    )


def _has_whole_phrase(norm: str, phrase: str) -> bool:
    clean_p = _normalize_apostrophes_and_punct(phrase)
    if not clean_p:
        return False
    return f" {clean_p} " in f" {norm} "


def _format_services_charter_response(norm: str, live: Dict[str, Any]) -> str:
    tokens = set(norm.split())
    has_elib = _has_whole_phrase(norm, "e library") or "elibrary" in tokens

    matched_workflows: List[Dict[str, Any]] = []
    for wf in CANONICAL_CITIZENS_CHARTER:
        if any(_has_whole_phrase(norm, kw) for kw in wf["keywords"]):
            matched_workflows.append(wf)

    has_charter_topic = (
        bool(matched_workflows)
        or bool(
            {
                "charter",
                "overdue",
                "fine",
                "fines",
                "penalty",
                "penalties",
                "clearance",
                "elibrary",
                "semester",
                "borrow",
                "borrowing",
                "return",
                "returning",
                "receipt",
                "osas",
                "edp",
                "arms",
            }
            & tokens
        )
        or has_elib
    )

    explicit_17_request = any(
        _has_whole_phrase(norm, p) for p in ("17 services", "17 official")
    )
    wants_17_list = explicit_17_request or (
        not has_charter_topic
        and (
            any(
                _has_whole_phrase(norm, p)
                for p in (
                    "library services",
                    "services offered",
                    "what services",
                    "services available",
                    "services do you offer",
                    "printing service",
                    "scanning service",
                    "referral service",
                    "orientation service",
                )
            )
            or (
                "services" in tokens
                and bool({"library", "offer", "offered", "available", "what", "list", "all"} & tokens)
            )
        )
    )

    if wants_17_list:
        svc_items: List[str] = list(live.get("services_items") or [])
        if not svc_items:
            svc_items = list(CANONICAL_17_LIBRARY_SERVICES)
        numbered = "\n".join(f"{i}. {item}" for i, item in enumerate(svc_items, 1))
        return (
            f"The JRMSU Katipunan Campus Library offers {len(svc_items)} official Library Services (/services):\n\n"
            f"{numbered}\n\n"
            "Visit our Services & Citizens Charter page at /services for step-by-step transaction workflows, requirements, and fees."
        )

    if not matched_workflows:
        matched_workflows = list(CANONICAL_CITIZENS_CHARTER)

    blocks: List[str] = []
    for wf in matched_workflows:
        reqs = "; ".join(wf["requirements"])
        steps = "\n   ".join(wf["steps"])
        blocks.append(
            f"- {wf['title']} [{wf['category']}] | Who: {wf['who']} | Time: {wf['time']} | Fee: {wf['fee']}\n"
            f"  Requirements: {reqs}\n"
            f"  Steps:\n   {steps}"
        )

    return (
        "JRMSU Katipunan Campus Library — Citizens Charter & Service Workflows (/services):\n\n"
        + "\n\n".join(blocks)
        + "\n\nNote: Overdue books incur PHP 10/hr (paid at Cashier with Official Receipt / OR). "
        "E-Library accounts include 30 hrs/semester after logbook & barcode swipe. "
        "Student online clearance is processed via jrmsu-arms.online."
    )


def _format_about_history_response(_norm: str, live: Dict[str, Any]) -> str:
    hist_text = str(live.get("about_history_text") or "").strip()
    if not hist_text:
        hist_text = CANONICAL_ABOUT_HISTORY
    return (
        f"JRMSU Katipunan Campus Library History (/about):\n\n"
        f"{hist_text}\n\n"
        "You can read the full history and Quality Objectives on our About page at /about."
    )


def _format_about_quality_response(_norm: str, live: Dict[str, Any]) -> str:
    qual_items: List[str] = list(live.get("about_quality_items") or [])
    if not qual_items:
        qual_items = list(CANONICAL_QUALITY_OBJECTIVES)

    lines = ["JRMSU Katipunan Campus Library Quality Objectives (/about#objectives):\n"]
    for idx, item in enumerate(qual_items, 1):
        lines.append(f"{idx}. {item}")

    lines.append(
        "\n\nJRMSU Vision, Mission & Core Values:\n"
        f"- Vision: {CANONICAL_VMGO['vision']}\n"
        f"- Mission: {CANONICAL_VMGO['mission']}\n"
        f"- Core Values: {CANONICAL_VMGO['core_values']}"
    )
    return "\n".join(lines)


def _format_administration_response(_norm: str, live: Dict[str, Any]) -> str:
    managed_files = list(live.get("managed_files") or [])
    personnel_list = list(live.get("personnel") or [])

    if managed_files:
        file_lines = [
            f"- {getattr(f, 'name', 'Document')} (Category: {getattr(f, 'category', 'Manual') or 'Manual'})"
            for f in managed_files
        ]
    else:
        file_lines = [
            "- Library Organizational Structure (Category: OrgStructure)",
            "- Library Manual & Policies (Category: Manual)",
            "- Excellence in Information Visual (Category: Excellence)",
        ]

    if personnel_list:
        staff_lines = [f"- {getattr(p, 'name', '')}: {getattr(p, 'title', '')}" for p in personnel_list]
    else:
        staff_lines = ["- Kiara Keren M. Alavanza: Campus Librarian"]

    return (
        "JRMSU Katipunan Campus Library — Administration, Organizational Structure & Manual (/administration):\n\n"
        "Official Documents (`ManagedFile` categories: OrgStructure, Manual, Excellence):\n"
        + "\n".join(file_lines)
        + "\n\nLibrary Personnel:\n"
        + "\n".join(staff_lines)
        + "\n\nYou can view the Organizational Structure at /administration and the Library Manual & Policies at /administration#manual."
    )


def _format_collection_response(norm: str, live: Dict[str, Any]) -> str:
    inv = live.get("book_inventory") or {}
    batch_name = live.get("batch_name") or "Batch 1 2026"
    picture_count = int(inv.get("picture_count", 0) or 0)
    named_count = int(inv.get("named_count", 0) or 0)

    parts: List[str] = []
    if any(_has_whole_phrase(norm, k) for k in ("union opac", "opac")):
        parts.append(
            "JRMSU Union OPAC (Online Public Access Catalog):\n"
            "- Catalog Portal: https://library.jrmsu.edu.ph/opac/ (accessible under Collection -> Union OPAC at /collection/union-opac)\n"
            "- UOPAC Registration Link: https://library.jrmsu.edu.ph/opac/registration\n"
            "Use Union OPAC to search physical books, journals, and resources across all JRMSU campuses, then bring your validated ID to the Circulation Desk."
        )

    if any(k in norm for k in ("vitalbooks", "vitalsource", "scholaar", "external librar")):
        parts.append(
            "JRMSU Katipunan Campus Library — External Libraries (Collection -> External Libraries at /collection/external-libraries):\n"
            "- VitalBooks (VitalSource Bookshelf): https://bookshelf.vitalsource.com/home/my-library\n"
            "- Scholaar: https://scholaar.com/Login.aspx"
        )

    if "newly acquired" in norm:
        count_note = (
            f"{picture_count} Newly Acquired Book cover photos in '{batch_name}'"
            if picture_count > 0 and named_count == 0
            else (f"{named_count} cataloged titles" if named_count > 0 else "newly acquired catalog titles")
        )
        parts.append(
            f"You can view our Newly Acquired Books ({count_note}) under Collection -> Newly Acquired Books at /collection/newly-acquired."
        )

    tab_lines = [f"- {t['label']} ({t['route']}): {t['summary']}" for t in CANONICAL_COLLECTION_TABS]
    tabs_block = "JRMSU Katipunan Campus Library — 6 Collection Tabs (/collection):\n" + "\n".join(tab_lines)
    if parts:
        return "\n\n".join(parts) + "\n\n" + tabs_block
    return tabs_block


_SECTION_STRATEGIES: Tuple[_SectionStrategy, ...] = (
    _SectionStrategy(
        section_id="services_citizens_charter",
        phrases=(
            "citizens charter",
            "citizen charter",
            "overdue",
            "e-library",
            "elibrary",
            "e library",
            "hrs/semester",
            "hours per semester",
            "hours/semester",
            "clearance online",
            "online clearance",
            "library clearance",
            "signing of library clearance",
            "jrmsu-arms",
            "jrmsu arms",
            "official receipt",
            "library services",
            "services offered",
            "what services",
            "services available",
            "services do you offer",
            "printing service",
            "scanning service",
            "referral service",
            "orientation service",
            "17 services",
            "borrowing service",
            "returning service",
            "osas",
            "edp",
        ),
        token_groups=(
            frozenset({"overdue"}),
            frozenset({"fine"}),
            frozenset({"fines"}),
            frozenset({"penalty"}),
            frozenset({"penalties"}),
            frozenset({"clearance"}),
            frozenset({"elibrary"}),
            frozenset({"charter"}),
            frozenset({"services", "library"}),
            frozenset({"services", "offer"}),
            frozenset({"services", "offered"}),
            frozenset({"services", "list"}),
        ),
        builder=_format_services_charter_response,
    ),
    _SectionStrategy(
        section_id="administration",
        phrases=(
            "library manual",
            "manual and policies",
            "organizational structure",
            "org structure",
            "org chart",
            "organization chart",
            "organization structure",
            "excellence in information",
            "managed file",
            "managed files",
            "official documents",
            "downloadable documents",
        ),
        token_groups=(
            frozenset({"administration"}),
            frozenset({"manual"}),
            frozenset({"policies"}),
        ),
        builder=_format_administration_response,
    ),
    _SectionStrategy(
        section_id="about_quality",
        phrases=(
            "quality objectives",
            "quality objective",
            "5 objectives",
            "five objectives",
            "quality policy",
            "vision and mission",
            "library vision",
            "library mission",
            "library goals",
            "core values",
            "core value",
            "jrmsu core values",
            "library core values",
        ),
        token_groups=(
            frozenset({"objectives"}),
            frozenset({"objective"}),
            frozenset({"goals"}),
            frozenset({"vision"}),
            frozenset({"mission"}),
            frozenset({"vmgo"}),
            frozenset({"core", "values"}),
            frozenset({"core", "value"}),
        ),
        builder=_format_about_quality_response,
    ),
    _SectionStrategy(
        section_id="about_history",
        phrases=(
            "history of jrmsu",
            "library history",
            "history of the library",
            "when was jrmsu",
            "republic act 9852",
            "ra 9852",
            "republic act 8193",
            "ra 8193",
            "cmo no 27",
            "cmo 27",
            "ched memorandum order",
            "katipunan national agricultural school",
            "zamboanga del norte agricultural college",
            "felipe o ligan",
            "felipe ligan",
            "henry a sojor",
            "henry sojor",
            "edgar s balbuena",
            "edgar balbuena",
            "about the library",
        ),
        token_groups=(
            frozenset({"presidents"}),
            frozenset({"president", "jrmsu"}),
            frozenset({"history", "jrmsu"}),
            frozenset({"history", "library"}),
            frozenset({"history", "campus"}),
            frozenset({"history", "katipunan"}),
            frozenset({"knas"}),
            frozenset({"znac"}),
            frozenset({"ligan"}),
            frozenset({"sojor"}),
            frozenset({"balbuena"}),
        ),
        builder=_format_about_history_response,
    ),
    _SectionStrategy(
        section_id="home",
        phrases=(
            "gps location",
            "gps coordinates",
            "alternate email",
            "alt email",
            "uopac registration",
            "opac registration",
            "register opac",
            "register uopac",
            "barangay dos",
            "where is the library",
            "where is jrmsu library",
            "library location",
            "library address",
            "contact email",
            "email address",
            "phone number",
            "facebook page",
            "fb page",
            "visitor count",
            "website visitors",
            "site visits",
            "feedback guide",
            "complaints mechanism",
            "external services gallery",
        ),
        token_groups=(
            frozenset({"gps"}),
            frozenset({"coordinates"}),
            frozenset({"facebook"}),
            frozenset({"visitors"}),
        ),
        builder=_format_home_response,
    ),
    _SectionStrategy(
        section_id="collection_portal",
        phrases=(
            "union opac",
            "newly acquired books location",
            "where is newly acquired",
            "where are newly acquired",
            "external libraries",
            "vitalbooks",
            "vital books",
        ),
        token_groups=(
            frozenset({"opac"}),
            frozenset({"collection", "tabs"}),
        ),
        builder=_format_collection_response,
    ),
)


def resolve_static_system_section(
    user_message: str,
    live_data: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """
    Strategy-driven resolver for JRMSU Katipunan Campus Library's institutional
    system sections (Home, About, Services & Citizens Charter, Administration,
    Collection portals), enriched with live database records passed in `live_data`.
    Returns None if the query does not target these sections.
    """
    if not user_message:
        return None

    norm = _normalize_apostrophes_and_punct(user_message)
    if not norm:
        return None
    tokens = set(norm.split())
    live = live_data or {}

    for strategy in _SECTION_STRATEGIES:
        phrase_hit = any(_has_whole_phrase(norm, p) for p in strategy.phrases)
        token_hit = any(grp.issubset(tokens) for grp in strategy.token_groups)
        if phrase_hit or token_hit:
            return strategy.builder(norm, live)

    return None
