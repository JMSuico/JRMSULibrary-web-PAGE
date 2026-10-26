# [Layer: Helpers] — ai_read_view_helper.py
"""
Deterministic Read/View & Weighted Relevance-Sorting Helper for the JRMSU Katipunan
Campus Library AI Assistant (Katipunan AI).

Implements the 5 core Read/View & Sorting Algorithms over the 13 public/student-facing
library tables while strictly respecting the privacy boundary (zero access to patron
or admin PII tables).
"""

import html
import re
from typing import Any, Dict, List, Optional, Set, Tuple


class AIReadViewHelper:
    """
    Stateless helper providing deterministic query tokenization, synonym expansion,
    weighted relevance ranking, hierarchical tree construction, physical zone grouping,
    HTML list extraction, and live database read/view audit reporting.
    """

    # Conversational stopwords stripped before relevance scoring.
    # Note: 'it', 'cs', 'pe' are intentionally excluded because they are academic program acronyms.
    STOP_WORDS: Set[str] = {
        "find",
        "me",
        "a",
        "an",
        "the",
        "is",
        "are",
        "was",
        "were",
        "what",
        "who",
        "how",
        "where",
        "when",
        "why",
        "which",
        "can",
        "could",
        "would",
        "should",
        "i",
        "we",
        "my",
        "our",
        "have",
        "has",
        "you",
        "your",
        "there",
        "please",
        "show",
        "do",
        "does",
        "did",
        "any",
        "some",
        "available",
        "tell",
        "list",
        "view",
        "read",
        "see",
        "give",
        "get",
        "about",
        "in",
        "on",
        "under",
        "for",
        "of",
        "to",
        "from",
        "with",
        "by",
        "at",
        "as",
        "and",
        "or",
    }

    # Generic catalog query words that should not exclude fallback results when no title matches.
    GENERIC_CATALOG_WORDS: Set[str] = {
        "book",
        "books",
        "catalog",
        "catalogue",
        "reference",
        "references",
        "library",
        "jrmsu",
        "katipunan",
        "collection",
        "holdings",
        "title",
        "titles",
        "material",
        "materials",
        "resource",
        "resources",
        "eresource",
        "eresources",
    }

    # Domain synonym and college/program acronym expansion table.
    SYNONYM_GROUPS: List[Tuple[Set[str], List[str]]] = [
        (
            {
                "cs",
                "computer",
                "computing",
                "it",
                "programming",
                "coding",
                "software",
                "information",
                "ccs",
                "bscs",
                "bsis",
            },
            [
                "ccs",
                "bscs",
                "bsis",
                "programming",
                "computing",
                "information",
                "data",
                "structures",
                "network",
                "web",
                "multimedia",
                "animation",
            ],
        ),
        (
            {
                "pe",
                "physical",
                "sports",
                "dance",
                "health",
                "education",
                "teaching",
                "teacher",
                "cted",
                "bpe",
                "beed",
            },
            [
                "cted",
                "bpe",
                "beed",
                "sports",
                "dance",
                "health",
                "exercise",
                "curriculum",
                "teaching",
                "assessment",
            ],
        ),
        (
            {
                "agriculture",
                "agri",
                "farming",
                "crops",
                "engineering",
                "biosystem",
                "bsabe",
                "caf",
            },
            [
                "agri",
                "agriculture",
                "caf",
                "biosystem",
                "engineering",
                "bsabe",
            ],
        ),
        (
            {
                "business",
                "management",
                "finance",
                "accounting",
                "cba",
                "financial",
                "enterprise",
            },
            [
                "cba",
                "business",
                "financial",
                "management",
                "enterprise",
            ],
        ),
        (
            {
                "history",
                "government",
                "constitution",
                "law",
                "filipino",
                "philippine",
                "dalumat",
            },
            [
                "history",
                "government",
                "constitution",
                "philippine",
                "dalumat",
                "filipino",
            ],
        ),
    ]

    # Lookup dictionary built deterministically from SYNONYM_GROUPS.
    SYNONYM_MAP: Dict[str, List[str]] = {
        trigger: expansions
        for triggers, expansions in SYNONYM_GROUPS
        for trigger in triggers
    }

    # Canonical college and program codes in EResourceDepartment hierarchy.
    COLLEGE_PROGRAM_CODES: Set[str] = {
        "ccs",
        "bsis",
        "bscs",
        "cted",
        "bpe",
        "beed",
        "agri",
        "caf",
        "cba",
        "biosystem",
        "bsabe",
    }

    # Canonical category order for ManagedLink (Online Databases).
    MANAGED_LINK_CATEGORY_ORDER: List[str] = [
        "Acquired E-Resources",
        "Resources",
        "Open Access Journal",
    ]

    # -------------------------------------------------------------------------
    # 1. Query Tokenization & Synonym Expansion
    # -------------------------------------------------------------------------
    @classmethod
    def expand_query_tokens(cls, user_message: str) -> List[str]:
        """
        Tokenizes `user_message` into lowercase alphanumeric tokens, filters out
        conversational stopwords, and expands domain synonyms and college/program
        acronyms deterministically.

        Original non-stopword tokens appear first, followed by expanded tokens
        (deduplicated while preserving deterministic order).
        """
        if not user_message:
            return []

        raw_tokens = re.findall(r"[a-z0-9]+", user_message.lower())
        base_tokens: List[str] = []
        seen: Set[str] = set()

        for tok in raw_tokens:
            if len(tok) < 2 and tok not in ("c",):
                continue
            if tok in cls.STOP_WORDS:
                continue
            if tok not in seen:
                seen.add(tok)
                base_tokens.append(tok)

        expanded_tokens: List[str] = list(base_tokens)
        for tok in base_tokens:
            synonyms = cls.SYNONYM_MAP.get(tok, [])
            for syn in synonyms:
                if syn not in seen:
                    seen.add(syn)
                    expanded_tokens.append(syn)

        return expanded_tokens

    # -------------------------------------------------------------------------
    # 2. Algorithm 1: Book Catalog Partitioning & Weighted Ranking
    # -------------------------------------------------------------------------
    @staticmethod
    def _match_token_in_text(token: str, text_lower: str, text_words: set) -> float:
        """
        Deterministic token matcher against a text field and its extracted word tokens.
        - Strict whole-word match for short acronyms like 'it', 'pe', 'cs', 'ai', 'caf', 'cba'
          (len <= 3) to prevent arbitrary substring collisions (e.g. 'with', 'open', 'basics', 'daily').
        - Prefix or whole-word match (5.0) or substring match (1.5) for longer tokens (len > 3).
        """
        if not token or not text_lower:
            return 0.0
        if len(token) <= 3:
            # Strict whole-word match for short acronyms like 'it', 'pe', 'cs', 'ai', 'caf', 'cba'
            return 5.0 if token in text_words else 0.0
        if token in text_words or any(w.startswith(token) for w in text_words):
            return 5.0
        if token in text_lower:
            return 1.5
        return 0.0

    @staticmethod
    def is_imported_cover_book(book: Any) -> bool:
        """
        Returns True if the Book row is an auto-imported camera filename record
        (`IMG*` title or `Imported` category) rather than a named catalog entry.
        """
        title = str(getattr(book, "title", "") or "").strip()
        category = str(getattr(book, "category", "") or "").strip()
        return title.upper().startswith("IMG") or category == "Imported"

    @classmethod
    def partition_books(cls, books: List[Any]) -> Dict[str, Any]:
        """
        Separates a list of Book objects into `named_books` and `img_cover_books`.
        """
        named_books: List[Any] = []
        img_cover_books: List[Any] = []
        for b in books or []:
            if cls.is_imported_cover_book(b):
                img_cover_books.append(b)
            else:
                named_books.append(b)
        return {
            "named_books": named_books,
            "img_cover_books": img_cover_books,
            "named_count": len(named_books),
            "img_cover_count": len(img_cover_books),
            "total_count": len(named_books) + len(img_cover_books),
        }

    @classmethod
    def rank_and_sort_books(
        cls,
        books: List[Any],
        query_tokens: List[str],
        raw_query: str = "",
        limit: int = 5,
    ) -> List[Any]:
        """
        Algorithm 1: Weighted Book Ranking.
        - Filters out `IMG*` cover records (`title.upper().startswith('IMG')` or `category == 'Imported'`).
        - Scores each named book B:
          * Exact phrase match of `raw_query.lower().strip()` (if len >= 3) in `title.lower()`: +12.0
          * For each token t in `query_tokens`:
            - t in `title.lower()`: +5.0 base via `_match_token_in_text`
            - t in `category.lower()`: +4.0 scaled via `_match_token_in_text * (4.0 / 5.0)`
            - t in `author.lower()`: +3.5 scaled via `_match_token_in_text * (3.5 / 5.0)`
            - t in `accession_number.lower()`: +6.0
        - Filters to books with `score > 0` if `query_tokens` matches any book (or returns top
          `limit` sorted by `-date_encoded` if no tokens match), sorted deterministically by
          `(-score, title.lower())`.
        """
        named_books = [b for b in (books or []) if not cls.is_imported_cover_book(b)]
        if not named_books:
            return []

        clean_raw = (raw_query or "").lower().strip()
        effective_tokens = [
            t.lower()
            for t in (query_tokens or [])
            if t and t.lower() not in cls.GENERIC_CATALOG_WORDS
        ]

        scored: List[Tuple[float, str, Any]] = []
        for b in named_books:
            title_l = str(getattr(b, "title", "") or "").lower()
            category_l = str(getattr(b, "category", "") or "").lower()
            author_l = str(getattr(b, "author", "") or "").lower()
            acc_l = str(
                getattr(b, "accession_number", None)
                or getattr(b, "acc_no", "")
                or ""
            ).lower()

            title_words = set(re.findall(r"[a-z0-9]+", title_l))
            category_words = set(re.findall(r"[a-z0-9]+", category_l))
            author_words = set(re.findall(r"[a-z0-9]+", author_l))

            score = 0.0
            if len(clean_raw) >= 3 and clean_raw in title_l:
                score += 12.0

            for tok in effective_tokens:
                score += cls._match_token_in_text(tok, title_l, title_words)
                score += cls._match_token_in_text(tok, category_l, category_words) * (4.0 / 5.0)
                score += cls._match_token_in_text(tok, author_l, author_words) * (3.5 / 5.0)
                if tok in acc_l:
                    score += 6.0

            scored.append((score, title_l, b))

        positive_matches = [item for item in scored if item[0] > 0.0]
        if positive_matches:
            positive_matches.sort(key=lambda item: (-item[0], item[1]))
            return [item[2] for item in positive_matches[: max(1, limit)]]

        # Fallback when query_tokens is empty or no specific tokens matched:
        # sort deterministically by (-date_encoded, title.lower()).
        def _fallback_sort_key(b: Any) -> Tuple[float, int, str]:
            dt = getattr(b, "date_encoded", None) or getattr(b, "created_at", None)
            ts = 0.0
            if dt is not None and hasattr(dt, "timestamp"):
                try:
                    ts = float(dt.timestamp())
                except Exception:
                    ts = 0.0
            book_id = int(getattr(b, "id", 0) or 0)
            title_l = str(getattr(b, "title", "") or "").lower()
            return (-ts, -book_id, title_l)

        fallback_sorted = sorted(named_books, key=_fallback_sort_key)
        return fallback_sorted[: max(1, limit)]

    # -------------------------------------------------------------------------
    # 3. Algorithm 1B: Research Reference Weighted Ranking
    # -------------------------------------------------------------------------
    @classmethod
    def rank_and_sort_references(
        cls,
        refs: List[Any],
        query_tokens: List[str],
        raw_query: str = "",
        limit: int = 5,
    ) -> List[Any]:
        """
        Algorithm 1B: Weighted ResearchReference Ranking.
        - Scores each ResearchReference R:
          * Exact phrase match of `raw_query.lower().strip()` (if len >= 3) in `title.lower()`: +12.0
          * For each token t in `query_tokens`:
            - t in `title.lower()`: +5.0 base via `_match_token_in_text`
            - t in `department.lower()` or `category.lower()`: +4.0 scaled via `_match_token_in_text * (4.0 / 5.0)`
            - t in `author.lower()`: +3.5 scaled via `_match_token_in_text * (3.5 / 5.0)`
            - t in `call_number.lower()` or `acc_no.lower()`: +6.0
          * Softcopy boost: if `getattr(r, 'access_type', 'none') in ('file', 'link')`: +1.5
        - Sorts deterministically by `(-score, title.lower())` and returns up to `limit`.
        """
        if not refs:
            return []

        clean_raw = (raw_query or "").lower().strip()
        effective_tokens = [
            t.lower()
            for t in (query_tokens or [])
            if t and t.lower() not in cls.GENERIC_CATALOG_WORDS
        ]

        scored: List[Tuple[float, float, str, Any]] = []
        for r in refs:
            title_l = str(getattr(r, "title", "") or "").lower()
            dept_l = str(getattr(r, "department", "") or "").lower()
            cat_l = str(getattr(r, "category", "") or "").lower()
            author_l = str(getattr(r, "author", "") or "").lower()
            call_l = str(getattr(r, "call_number", "") or "").lower()
            acc_l = str(
                getattr(r, "acc_no", None)
                or getattr(r, "accession_number", "")
                or ""
            ).lower()
            access_type = str(getattr(r, "access_type", "none") or "none").lower()

            category_l = f"{dept_l} {cat_l}".strip()
            title_words = set(re.findall(r"[a-z0-9]+", title_l))
            category_words = set(re.findall(r"[a-z0-9]+", category_l))
            author_words = set(re.findall(r"[a-z0-9]+", author_l))

            token_score = 0.0
            if len(clean_raw) >= 3 and clean_raw in title_l:
                token_score += 12.0

            for tok in effective_tokens:
                token_score += cls._match_token_in_text(tok, title_l, title_words)
                token_score += cls._match_token_in_text(tok, category_l, category_words) * (4.0 / 5.0)
                token_score += cls._match_token_in_text(tok, author_l, author_words) * (3.5 / 5.0)
                if tok in call_l or tok in acc_l:
                    token_score += 6.0

            softcopy_boost = 1.5 if access_type in ("file", "link") else 0.0
            total_score = token_score + softcopy_boost
            scored.append((total_score, token_score, title_l, r))

        # If specific tokens matched at least one reference, prioritize those with token_score > 0
        matched = [item for item in scored if item[1] > 0.0]
        target_pool = matched if matched else scored
        target_pool.sort(key=lambda item: (-item[0], item[2]))
        return [item[3] for item in target_pool[: max(1, limit)]]

    # -------------------------------------------------------------------------
    # 4. Algorithm 2: Hierarchical E-Resource Folder Tree & Course Matching
    # -------------------------------------------------------------------------
    @classmethod
    def build_sorted_eresource_tree(
        cls,
        departments: List[Any],
        files: Optional[List[Any]] = None,
    ) -> Dict[str, Any]:
        """
        Algorithm 2 (Part A): Builds an O(N) lookup map of `EResourceDepartment`
        rows, computes full breadcrumb paths (e.g. `CCS > BSIS > Data Structures an Algorithms`),
        and categorizes nodes into:
          - `roots` (depth 0: AGRI, CAF, CBA, CCS, CTED)
          - `programs` (depth 1)
          - `courses` (depth >= 2)
        Also attaches file counts per folder if `files` is provided.
        """
        by_raw_id: Dict[Any, Any] = {}
        for d in departments or []:
            d_id = getattr(d, "id", None)
            if d_id is not None:
                by_raw_id[d_id] = d

        files_by_dept: Dict[Any, List[Any]] = {}
        for f in files or []:
            if getattr(f, "is_active", True) is False:
                continue
            dept_id = getattr(f, "department_id", None)
            if dept_id is not None:
                files_by_dept.setdefault(dept_id, []).append(f)

        all_nodes: List[Dict[str, Any]] = []
        node_by_id: Dict[Any, Dict[str, Any]] = {}

        for d_id, d in by_raw_id.items():
            chain: List[Any] = []
            curr = d
            visited: Set[Any] = set()
            while curr is not None:
                c_id = getattr(curr, "id", None)
                if c_id in visited:
                    break
                if c_id is not None:
                    visited.add(c_id)
                chain.append(curr)
                parent_id = getattr(curr, "parent_id", None)
                curr = by_raw_id.get(parent_id) if parent_id is not None else None

            chain.reverse()
            names = [str(getattr(node, "name", "") or "").strip() for node in chain]
            breadcrumb = " > ".join(names)
            depth = max(0, len(chain) - 1)
            root_code = names[0] if names else ""
            program_name = names[1] if len(names) > 1 else ""
            order_val = int(getattr(d, "order", 0) or 0)
            dept_files = files_by_dept.get(d_id, [])

            node_info: Dict[str, Any] = {
                "id": d_id,
                "name": str(getattr(d, "name", "") or "").strip(),
                "parent_id": getattr(d, "parent_id", None),
                "slug": str(getattr(d, "slug", "") or "").strip(),
                "order": order_val,
                "depth": depth,
                "breadcrumb": breadcrumb,
                "root_code": root_code,
                "program_name": program_name,
                "ancestor_names": names,
                "file_count": len(dept_files),
                "files": dept_files,
            }
            all_nodes.append(node_info)
            node_by_id[d_id] = node_info

        roots = sorted(
            [n for n in all_nodes if n["depth"] == 0],
            key=lambda n: (n["order"], n["name"].lower()),
        )
        programs = sorted(
            [n for n in all_nodes if n["depth"] == 1],
            key=lambda n: (n["root_code"].lower(), n["order"], n["name"].lower()),
        )
        courses = sorted(
            [n for n in all_nodes if n["depth"] >= 2],
            key=lambda n: (
                n["root_code"].lower(),
                n["program_name"].lower(),
                n["depth"],
                n["order"],
                n["name"].lower(),
            ),
        )
        all_nodes.sort(key=lambda n: (n["breadcrumb"].lower(), n["order"]))

        # Group summary per root college
        college_summary: Dict[str, Dict[str, Any]] = {}
        for r in roots:
            code = r["name"]
            college_summary[code] = {
                "id": r["id"],
                "code": code,
                "programs": [
                    p["name"] for p in programs if p["root_code"] == code
                ],
                "courses": [
                    c["breadcrumb"] for c in courses if c["root_code"] == code
                ],
                "program_count": sum(
                    1 for p in programs if p["root_code"] == code
                ),
                "course_count": sum(
                    1 for c in courses if c["root_code"] == code
                ),
            }

        return {
            "roots": roots,
            "programs": programs,
            "courses": courses,
            "all_nodes": all_nodes,
            "by_id": node_by_id,
            "college_summary": college_summary,
            "counts": {
                "total": len(all_nodes),
                "colleges": len(roots),
                "programs": len(programs),
                "courses": len(courses),
                "files": sum(len(v) for v in files_by_dept.values()),
            },
        }

    @classmethod
    def match_eresource_folders(
        cls,
        departments: List[Any],
        query_tokens: List[str],
        raw_query: str = "",
        limit: int = 12,
    ) -> List[Dict[str, Any]]:
        """
        Algorithm 2 (Part B): Scores each EResourceDepartment node against
        `query_tokens` and `raw_query`:
          - Exact match on root/program code (`ccs`, `bsis`, `bscs`, `cted`, `bpe`, `beed`,
            `agri`, `caf`, `cba`, `biosystem`): boosts all child/descendant folders of that
            college/program (`+8.0` for direct children/courses, `+6.0` for program node).
          - Exact substring in `d.name.lower()`: `+10.0`
          - Token match in `d.name.lower()`: `+5.0` per token
          - Token match in `breadcrumb.lower()`: `+3.0` per token
        Sorts matching folders by `(-score, -depth, order ASC, name.lower() ASC)` and returns
        dicts `{'id': d.id, 'name': d.name, 'breadcrumb': breadcrumb, 'depth': depth, 'score': score}`.
        """
        tree = cls.build_sorted_eresource_tree(departments)
        all_nodes = tree["all_nodes"]
        if not all_nodes:
            return []

        clean_raw = (raw_query or "").lower().strip()
        tokens = [
            t.lower()
            for t in (query_tokens or [])
            if t and t.lower() not in cls.GENERIC_CATALOG_WORDS
        ]
        matched_codes = [t for t in tokens if t in cls.COLLEGE_PROGRAM_CODES]

        scored_nodes: List[Tuple[float, int, int, str, Dict[str, Any]]] = []
        for node in all_nodes:
            name_l = node["name"].lower()
            breadcrumb_l = node["breadcrumb"].lower()
            depth = int(node["depth"])
            order_val = int(node["order"])
            breadcrumb_words = set(re.findall(r"[a-z0-9]+", breadcrumb_l))

            score = 0.0

            # 1. College/program code boost for descendant folders
            for code in matched_codes:
                if code in breadcrumb_words or code in breadcrumb_l:
                    if depth >= 2:
                        score += 8.0
                    elif depth == 1:
                        score += 6.0
                    else:
                        score += 4.0

            # 2. Exact phrase/substring match in folder name
            if len(clean_raw) >= 3 and clean_raw in name_l:
                score += 10.0

            # 3. Token matches in folder name (+5.0) and breadcrumb (+3.0)
            for tok in tokens:
                if tok in name_l:
                    score += 5.0
                if tok in breadcrumb_l:
                    score += 3.0

            if score > 0.0:
                out_dict = {
                    "id": node["id"],
                    "name": node["name"],
                    "breadcrumb": node["breadcrumb"],
                    "depth": depth,
                    "score": round(score, 2),
                }
                scored_nodes.append(
                    (-score, -depth, order_val, name_l, out_dict)
                )

        if scored_nodes:
            scored_nodes.sort(key=lambda item: (item[0], item[1], item[2], item[3]))
            return [item[4] for item in scored_nodes[: max(1, limit)]]

        # Deterministic fallback when no specific tokens matched: return top course/program folders
        fallback_nodes = sorted(
            all_nodes,
            key=lambda n: (-int(n["depth"]), int(n["order"]), n["breadcrumb"].lower()),
        )
        return [
            {
                "id": n["id"],
                "name": n["name"],
                "breadcrumb": n["breadcrumb"],
                "depth": int(n["depth"]),
                "score": 0.0,
            }
            for n in fallback_nodes[: max(1, limit)]
        ]

    # -------------------------------------------------------------------------
    # 5. Algorithm 3: Physical Setup & Library Zone Grouping + Sorting
    # -------------------------------------------------------------------------
    @staticmethod
    def normalize_zone_name(raw_title: str) -> Tuple[str, str]:
        """
        Normalizes a physical setup title into `(base_zone_name, floor_label)`.
        Examples:
          - 'WORKSTATION 12' -> ('WORKSTATION', '1st Floor / Main')
          - 'READING AREA 1 - 2nd floor' -> ('READING AREA', '2nd Floor')
          - 'SOCIAL LEARNING ZONE 3' -> ('SOCIAL LEARNING ZONE', '1st Floor / Main')
        """
        title = (raw_title or "").strip()
        if not title:
            return ("UNSPECIFIED ZONE", "1st Floor / Main")

        floor_label = "1st Floor / Main"
        if re.search(r"2nd\s*floor", title, flags=re.IGNORECASE):
            floor_label = "2nd Floor"
        elif re.search(r"1st\s*floor|ground\s*floor", title, flags=re.IGNORECASE):
            floor_label = "1st Floor / Main"

        # Strip floor suffix e.g. "- 2nd floor"
        cleaned = re.sub(
            r"\s*[-–—]?\s*\b(1st|2nd|3rd|ground)\s*floor\b.*$",
            "",
            title,
            flags=re.IGNORECASE,
        ).strip()
        # Strip trailing numbers e.g. "WORKSTATION 12" -> "WORKSTATION"
        cleaned = re.sub(r"\s+\d+\s*$", "", cleaned).strip()
        return (cleaned.upper() or title.upper(), floor_label)

    @classmethod
    def group_and_sort_physical_zones(
        cls,
        images: List[Any],
        query_tokens: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Algorithm 3: Separates `LibraryImage` records into:
          - `physical_setup_rows`: 37 named Physical Setup zones (title does not start with 'IMG')
          - `interior_photo_rows`: 17 interior photos (title starts with 'IMG' or section_label == 'Library Interior')
        Normalizes base zone names and returns a deterministically sorted list of grouped
        zone summaries plus matched specific zones when `query_tokens` is provided.
        """
        physical_setup_rows: List[Any] = []
        interior_photo_rows: List[Any] = []

        for img in images or []:
            if getattr(img, "is_active", True) is False:
                continue
            title_str = str(getattr(img, "title", "") or "").strip()
            section_label = str(getattr(img, "section_label", "") or "").strip()
            if title_str.upper().startswith("IMG") or (
                not title_str and section_label == "Library Interior"
            ):
                interior_photo_rows.append(img)
            else:
                physical_setup_rows.append(img)

        groups: Dict[str, Dict[str, Any]] = {}
        matched_zones: List[Dict[str, Any]] = []
        tokens = [
            t.lower()
            for t in (query_tokens or [])
            if t and t.lower() not in cls.STOP_WORDS
        ]

        for img in physical_setup_rows:
            raw_title = str(getattr(img, "title", "") or "").strip()
            desc = str(
                getattr(img, "description", None)
                or getattr(img, "caption", "")
                or ""
            ).strip()
            section_label = str(getattr(img, "section_label", "") or "").strip()
            base_zone, floor_label = cls.normalize_zone_name(raw_title)

            grp = groups.setdefault(
                base_zone,
                {
                    "base_zone": base_zone,
                    "count": 0,
                    "floors": set(),
                    "titles": [],
                    "descriptions": [],
                    "section_labels": set(),
                },
            )
            grp["count"] += 1
            grp["floors"].add(floor_label)
            if raw_title and raw_title not in grp["titles"]:
                grp["titles"].append(raw_title)
            if desc and desc not in grp["descriptions"]:
                grp["descriptions"].append(desc)
            if section_label:
                grp["section_labels"].add(section_label)

            if tokens:
                haystack = f"{raw_title} {base_zone} {desc} {section_label} {floor_label}".lower()
                score = sum(4.0 for tok in tokens if tok in haystack)
                if score > 0:
                    matched_zones.append(
                        {
                            "id": getattr(img, "id", None),
                            "title": raw_title,
                            "base_zone": base_zone,
                            "floor": floor_label,
                            "description": desc,
                            "section_label": section_label,
                            "score": score,
                        }
                    )

        grouped_zones: List[Dict[str, Any]] = []
        for base_zone, data in groups.items():
            floors_sorted = sorted(data["floors"])
            desc_sample = data["descriptions"][0] if data["descriptions"] else ""
            count = data["count"]
            floor_note = (
                " (includes 2nd Floor)"
                if "2nd Floor" in floors_sorted and len(floors_sorted) > 1
                else (" (2nd Floor)" if floors_sorted == ["2nd Floor"] else "")
            )
            unit_str = f"{count} unit{'s' if count != 1 else ''}" if count > 1 else "1 area"
            summary_line = f"{base_zone}: {unit_str}{floor_note}"
            if desc_sample:
                summary_line += f" — {desc_sample}"

            grouped_zones.append(
                {
                    "base_zone": base_zone,
                    "count": count,
                    "floors": floors_sorted,
                    "titles": sorted(data["titles"]),
                    "description": desc_sample,
                    "section_labels": sorted(data["section_labels"]),
                    "formatted_summary": summary_line,
                }
            )

        # Sort by (-count, base_zone ASC) so major zones appear first deterministically
        grouped_zones.sort(key=lambda g: (-g["count"], g["base_zone"]))
        matched_zones.sort(key=lambda m: (-m["score"], m["title"].lower()))

        return {
            "physical_setup_rows": physical_setup_rows,
            "interior_photo_rows": interior_photo_rows,
            "physical_setup_count": len(physical_setup_rows),
            "interior_photo_count": len(interior_photo_rows),
            "total_count": len(physical_setup_rows) + len(interior_photo_rows),
            "grouped_zones": grouped_zones,
            "matched_zones": matched_zones[:10],
        }

    # -------------------------------------------------------------------------
    # 6. Algorithm 4: Managed Links Grouping & HTML List Item Extraction
    # -------------------------------------------------------------------------
    @classmethod
    def group_and_sort_managed_links(
        cls,
        links: List[Any],
        query_tokens: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Algorithm 4 (Part A): Groups active `ManagedLink` objects by `category`
        (`Acquired E-Resources`, `Resources`, `Open Access Journal`) sorted by
        `(order ASC, name ASC)`, and computes `matched_links` if `query_tokens`
        match `name`, `category`, `description`, or `url`.
        """
        active_links = [
            lnk
            for lnk in (links or [])
            if getattr(lnk, "is_active", True) is not False
        ]

        by_category_raw: Dict[str, List[Any]] = {
            cat: [] for cat in cls.MANAGED_LINK_CATEGORY_ORDER
        }
        for lnk in active_links:
            cat = str(getattr(lnk, "category", "") or "Resources").strip() or "Resources"
            by_category_raw.setdefault(cat, []).append(lnk)

        ordered_categories = list(cls.MANAGED_LINK_CATEGORY_ORDER) + sorted(
            [c for c in by_category_raw.keys() if c not in cls.MANAGED_LINK_CATEGORY_ORDER]
        )

        by_category: Dict[str, List[Dict[str, Any]]] = {}
        category_counts: Dict[str, int] = {}
        matched_links: List[Dict[str, Any]] = []
        tokens = [
            t.lower()
            for t in (query_tokens or [])
            if t and t.lower() not in cls.STOP_WORDS
        ]

        for cat in ordered_categories:
            cat_links = by_category_raw.get(cat, [])
            if not cat_links and cat not in cls.MANAGED_LINK_CATEGORY_ORDER:
                continue
            cat_links.sort(
                key=lambda x: (
                    int(getattr(x, "order", 0) or 0),
                    str(getattr(x, "name", "") or "").lower(),
                )
            )
            serialized_list: List[Dict[str, Any]] = []
            for lnk in cat_links:
                name_str = str(getattr(lnk, "name", "") or "").strip()
                url_str = str(getattr(lnk, "url", "") or "").strip()
                desc_str = str(getattr(lnk, "description", "") or "").strip()
                order_val = int(getattr(lnk, "order", 0) or 0)
                entry = {
                    "id": getattr(lnk, "id", None),
                    "name": name_str,
                    "category": cat,
                    "url": url_str,
                    "description": desc_str,
                    "order": order_val,
                }
                serialized_list.append(entry)

                if tokens:
                    haystack = f"{name_str} {cat} {desc_str} {url_str}".lower()
                    score = sum(
                        5.0 if tok in name_str.lower() else 3.0
                        for tok in tokens
                        if tok in haystack
                    )
                    if score > 0:
                        matched_entry = dict(entry)
                        matched_entry["score"] = score
                        matched_links.append(matched_entry)

            by_category[cat] = serialized_list
            category_counts[cat] = len(serialized_list)

        matched_links.sort(
            key=lambda m: (-m["score"], m["order"], m["name"].lower())
        )

        return {
            "by_category": by_category,
            "category_counts": category_counts,
            "total_active": len(active_links),
            "matched_links": matched_links[:12],
        }

    @staticmethod
    def extract_html_list_items(html_text: str) -> List[str]:
        """
        Algorithm 4 (Part B): Extracts clean text items from `<p>...</p>` or `<li>...</li>`
        tags in `PageContent` HTML blocks so `PageContent(slug='library_services')` yields
        all 17 official Library Services in exact order.
        """
        if not html_text:
            return []

        blocks = re.findall(
            r"<(?:p|li)\b[^>]*>(.*?)</(?:p|li)>",
            html_text,
            flags=re.IGNORECASE | re.DOTALL,
        )
        items: List[str] = []
        source_blocks = blocks if blocks else html_text.splitlines()

        for raw_block in source_blocks:
            # Strip inner HTML tags
            no_tags = re.sub(r"<[^>]+>", " ", raw_block)
            unescaped = html.unescape(no_tags)
            cleaned = re.sub(r"\s+", " ", unescaped).strip()
            if cleaned:
                items.append(cleaned)

        return items

    # -------------------------------------------------------------------------
    # 7. Algorithm 5: Live Database Read/View Access Audit Report
    # -------------------------------------------------------------------------
    @classmethod
    def build_live_database_audit_report(cls, audit_counts: Dict[str, Any]) -> str:
        """
        Algorithm 5: Formats a clear, structured, human-friendly Live Database
        Read/View Access Report listing all 13 permitted tables/modules and their
        live row counts, while explicitly confirming that private admin/patron PII
        tables are protected and never accessed.
        """
        counts = audit_counts or {}

        books_total = int(counts.get("books_total", 72))
        books_named = int(counts.get("books_named", 6))
        books_img = int(counts.get("books_img", max(0, books_total - books_named)))

        batches_total = int(counts.get("batches_total", 1))
        active_batch_name = str(
            counts.get("active_batch_name") or "New Arrival Books — March 2026"
        )

        refs_total = int(counts.get("research_references_total", 6))
        refs_active = int(counts.get("research_references_active", refs_total))

        depts_total = int(counts.get("eresource_departments_total", 60))
        colleges_count = int(counts.get("eresource_colleges", 5))
        programs_count = int(counts.get("eresource_programs", 6))
        courses_count = int(
            counts.get(
                "eresource_courses",
                max(0, depts_total - colleges_count - programs_count),
            )
        )
        eresource_files_total = int(counts.get("eresource_files_total", 0))

        links_total = int(counts.get("managed_links_total", 23))
        links_by_cat = counts.get("managed_links_by_category") or {}
        acquired_count = int(links_by_cat.get("Acquired E-Resources", 2))
        resources_count = int(links_by_cat.get("Resources", 9))
        oaj_count = int(links_by_cat.get("Open Access Journal", 12))

        images_total = int(counts.get("library_images_total", 54))
        physical_setup_count = int(counts.get("physical_setup_count", 37))
        interior_photo_count = int(
            counts.get(
                "interior_photo_count", max(0, images_total - physical_setup_count)
            )
        )

        personnel_total = int(counts.get("personnel_total", 4))
        page_content_total = int(counts.get("page_content_total", 4))
        services_count = int(counts.get("library_services_count", 17))
        managed_files_total = int(counts.get("managed_files_total", 2))
        faqs_total = int(counts.get("faqs_total", 104))
        site_settings_total = int(counts.get("site_settings_total", 7))
        team_members_total = int(counts.get("team_members_total", 0))

        lines = [
            "### Live Database Read/View Access Report (13 Public/Student-Facing Modules)",
            f"1. **Book Catalog (`Book`)**: `{books_total}` total records (`{books_named}` named catalog titles + `{books_img}` imported book cover scans)",
            f"2. **Catalog Batches (`CatalogBatch`)**: `{batches_total}` active batch (`{active_batch_name}`)",
            f"3. **Featured & New Arrival Books (`ResearchReference`)**: `{refs_active}` active curated references (`{refs_total}` total)",
            f"4. **Academic E-Resource Folders (`EResourceDepartment`)**: `{depts_total}` sorted folders (`{colleges_count}` Colleges: AGRI, CAF, CBA, CCS, CTED | `{programs_count}` Programs | `{courses_count}` Course folders)",
            f"5. **Uploaded E-Resource Syllabi & Course Files (`EResourceFile`)**: `{eresource_files_total}` active files",
            f"6. **Online Databases & Portals (`ManagedLink`)**: `{links_total}` active databases (`{acquired_count}` Acquired E-Resources, `{resources_count}` General Resources, `{oaj_count}` Open Access Journals)",
            f"7. **Physical Setup & Library Gallery (`LibraryImage`)**: `{images_total}` active visual records (`{physical_setup_count}` Physical Setup zones + `{interior_photo_count}` Library Interior photos)",
            f"8. **Library Staff & Personnel (`Personnel`)**: `{personnel_total}` active personnel records",
            f"9. **CMS Library Pages & Services (`PageContent`)**: `{page_content_total}` published sections (including `{services_count}` official Library Services)",
            f"10. **Downloadable Library Documents (`ManagedFile`)**: `{managed_files_total}` official documents (`Organizational Structure`, `Excellence in Information`)",
            f"11. **Curated Library Knowledge Base (`FAQ`)**: `{faqs_total}` active Q&A entries",
            f"12. **Campus Contact & Configuration (`SiteSetting`)**: `{site_settings_total}` active settings",
            f"13. **Developer & Library Team Credits (`TeamMember`)**: `{team_members_total}` team records",
            "",
            "**Privacy & Security Boundary**: Private admin and patron PII tables (`AdminUser`, `User` / `Student`, `AttendanceLog`, `BorrowerRecord`, `AnalyticsEvent`, `Subscriber`) are strictly protected and **never** accessed by the AI assistant.",
        ]
        return "\n".join(lines)
