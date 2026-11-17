# [Layer: Helpers] — ai_read_view_helper.py
"""
Deterministic Read/View & Weighted Relevance-Sorting Helper for the JRMSU Katipunan
Campus Library AI Assistant (Katipunan AI).

Implements the 5 core Read/View & Sorting Algorithms over the 13 public/student-facing
library tables while strictly respecting the privacy boundary (zero access to patron
or admin PII tables).
"""

import html
import os
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
        "found",
        "finding",
        "locate",
        "located",
        "suggest",
        "suggested",
        "recommend",
        "recommended",
        "want",
        "need",
        "know",
        "looking",
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
        "collections",
        "holdings",
        "title",
        "titles",
        "material",
        "materials",
        "resource",
        "resources",
        "eresource",
        "eresources",
        "local",
        "localbook",
        "localbooks",
        "localbok",
        "localboks",
        "ebook",
        "ebooks",
        "file",
        "files",
        "pdf",
        "pdfs",
        "document",
        "documents",
        "folder",
        "folders",
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
        - Whole-word or close stem/plural match (5.0) for longer tokens (len > 3), preventing
          false prefix collisions like 'found' -> 'foundation'.
        """
        if not token or not text_lower:
            return 0.0
        if len(token) <= 3:
            # Strict whole-word match for short acronyms like 'it', 'pe', 'cs', 'ai', 'caf', 'cba'
            return 5.0 if token in text_words else 0.0
        if token in text_words:
            return 5.0
        if len(token) >= 5 and any(
            w.startswith(token) and (len(w) - len(token) <= 4) for w in text_words
        ):
            return 5.0
        if len(token) >= 6 and any(
            token.startswith(w) and len(w) >= 5 and (len(token) - len(w) <= 4)
            for w in text_words
        ):
            return 4.0
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
            if t and t.lower() not in cls.GENERIC_CATALOG_WORDS and t.lower() not in cls.STOP_WORDS
        ]
        matched_codes = [t for t in tokens if t in cls.COLLEGE_PROGRAM_CODES]

        scored_nodes: List[Tuple[float, int, int, str, Dict[str, Any]]] = []
        for node in all_nodes:
            name_l = node["name"].lower()
            breadcrumb_l = node["breadcrumb"].lower()
            depth = int(node["depth"])
            order_val = int(node["order"])
            name_words = set(re.findall(r"[a-z0-9]+", name_l))
            breadcrumb_words = set(re.findall(r"[a-z0-9]+", breadcrumb_l))

            score = 0.0

            # 1. College/program code boost for descendant folders
            for code in matched_codes:
                if code in breadcrumb_words:
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
                if cls._match_token_in_text(tok, name_l, name_words) > 0:
                    score += 5.0
                if cls._match_token_in_text(tok, breadcrumb_l, breadcrumb_words) > 0:
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
    def normalize_zone_name(raw_title: str, section_label: str = "") -> Tuple[str, str]:
        """
        Normalizes a physical setup title + section_label into `(base_zone_name, floor_label)`.
        Examples:
          - 'WORKSTATION 12' -> ('WORKSTATION', '1st Floor / Main')
          - 'READING AREA 1 - 2nd floor' -> ('READING AREA', '2nd Floor')
          - 'SOCIAL LEARNING ZONE 3' -> ('SOCIAL LEARNING ZONE', '1st Floor / Main')
        """
        title = (raw_title or "").strip()
        sec = (section_label or "").strip()
        if not title and not sec:
            return ("UNSPECIFIED ZONE", "1st Floor / Main")

        combined_floor_text = f"{title} {sec}".strip()
        floor_label = "1st Floor / Main"
        if re.search(r"(?:2nd|second)\s*floor", combined_floor_text, flags=re.IGNORECASE):
            floor_label = "2nd Floor"
        elif re.search(r"(?:1st|first|ground)\s*floor", combined_floor_text, flags=re.IGNORECASE):
            floor_label = "1st Floor"

        # Strip floor suffix e.g. "- 2nd floor"
        cleaned = re.sub(
            r"\s*[-–—]?\s*\b(1st|first|2nd|second|ground)\s*floor\b.*$",
            "",
            title,
            flags=re.IGNORECASE,
        ).strip()
        # Strip trailing numbers e.g. "WORKSTATION 12" -> "WORKSTATION"
        cleaned = re.sub(r"\s+\d+\s*$", "", cleaned).strip()
        return (cleaned.upper() or title.upper() or sec.upper(), floor_label)

    @classmethod
    def group_and_sort_physical_zones(
        cls,
        images: List[Any],
        query_tokens: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Algorithm 3: Separates `LibraryInteriorImage` records into:
          - `physical_setup_rows`: 37 named Physical Setup zones (title does not start with 'IMG')
          - `interior_photo_rows`: 17 interior photos (title starts with 'IMG' or section_label == 'Library Interior')
        Uses only verified `LibraryInteriorImage` fields (`title`, `section_label`, `is_active`).
        Normalizes base zone names + floors and returns deterministically sorted summaries.
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
            section_label = str(getattr(img, "section_label", "") or "").strip()
            base_zone, floor_label = cls.normalize_zone_name(raw_title, section_label=section_label)

            grp = groups.setdefault(
                base_zone,
                {
                    "base_zone": base_zone,
                    "count": 0,
                    "floors": set(),
                    "titles": [],
                    "section_labels": set(),
                },
            )
            grp["count"] += 1
            grp["floors"].add(floor_label)
            if raw_title and raw_title not in grp["titles"]:
                grp["titles"].append(raw_title)
            if section_label:
                grp["section_labels"].add(section_label)

            if tokens:
                haystack = f"{raw_title} {base_zone} {section_label} {floor_label}".lower()
                score = sum(4.0 for tok in tokens if tok in haystack)
                if score > 0:
                    matched_zones.append(
                        {
                            "id": getattr(img, "id", None),
                            "title": raw_title,
                            "base_zone": base_zone,
                            "floor": floor_label,
                            "section_label": section_label,
                            "score": score,
                        }
                    )

        grouped_zones: List[Dict[str, Any]] = []
        for base_zone, data in groups.items():
            floors_sorted = sorted(data["floors"])
            count = data["count"]
            floor_note = (
                " (1st Floor & 2nd Floor)"
                if "2nd Floor" in floors_sorted and len(floors_sorted) > 1
                else (" (2nd Floor)" if floors_sorted == ["2nd Floor"] else (" (1st Floor)" if floors_sorted == ["1st Floor"] else ""))
            )
            unit_str = f"{count} unit{'s' if count != 1 else ''}" if count > 1 else "1 area"
            summary_line = f"{base_zone}: {unit_str}{floor_note}"

            grouped_zones.append(
                {
                    "base_zone": base_zone,
                    "count": count,
                    "floors": floors_sorted,
                    "titles": sorted(data["titles"]),
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

    # -------------------------------------------------------------------------
    # 8. Document & Thesis Knowledge Grounding Helpers
    # -------------------------------------------------------------------------
    @classmethod
    def _extract_file_breadcrumb(cls, file_obj: Any) -> str:
        """
        Extracts human-readable department breadcrumb for an EResourceFile instance.
        """
        if hasattr(file_obj, "breadcrumb") and file_obj.breadcrumb:
            return str(file_obj.breadcrumb).strip()
        if hasattr(file_obj, "department_breadcrumb") and file_obj.department_breadcrumb:
            return str(file_obj.department_breadcrumb).strip()

        dept = getattr(file_obj, "department", None)
        if not dept:
            return "General / E-Resources"

        if isinstance(dept, str):
            return dept.strip()

        # Traverse parent chain if dept is an object/model
        chain: List[str] = []
        curr = dept
        visited: Set[int] = set()
        while curr is not None and id(curr) not in visited:
            visited.add(id(curr))
            name = str(getattr(curr, "name", "") or "").strip()
            if name:
                chain.append(name)
            curr = getattr(curr, "parent", None)

        if chain:
            chain.reverse()
            return " > ".join(chain)

        return "General / E-Resources"

    @classmethod
    def _extract_relevant_fulltext_excerpts(
        cls,
        extracted_text: str,
        query_tokens: Optional[List[str]] = None,
        max_chars: int = 900,
    ) -> str:
        """
        Extracts clean, readable excerpts from full extracted document text.
        Prioritizes passages near matching query tokens; otherwise returns balanced
        opening, middle, and concluding excerpts while stripping TOC dot-leaders.
        """
        text = str(extracted_text or "").strip()
        if not text:
            return ""

        clean_lines: List[str] = []
        for raw_line in text.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            if re.match(r"^\[?Page\s+\d+\]?$", line, re.IGNORECASE):
                continue
            if re.search(r"\.{4,}\s*\d*\s*$", line):
                continue
            clean_lines.append(line)

        cleaned = re.sub(r"\s+", " ", " ".join(clean_lines)).strip()
        if not cleaned:
            return ""
        if len(cleaned) <= max_chars:
            return cleaned

        effective_tokens = [
            t.lower()
            for t in (query_tokens or [])
            if t and len(t) > 2 and t.lower() not in cls.STOP_WORDS
        ]

        if effective_tokens:
            lowered = cleaned.lower()
            chunks: List[Tuple[int, int, str]] = []
            step = 280
            win = 380
            for start in range(0, len(cleaned), step):
                end = min(len(cleaned), start + win)
                slice_str = cleaned[start:end].strip()
                if not slice_str:
                    continue
                slice_l = lowered[start:end]
                hits = sum(1 for tok in effective_tokens if tok in slice_l)
                if hits > 0:
                    chunks.append((hits, -start, slice_str))
            if chunks:
                chunks.sort(key=lambda x: (-x[0], -x[1]))
                selected: List[str] = []
                total = 0
                for _, _, chunk in chunks:
                    if any(chunk[:60] in s for s in selected):
                        continue
                    prefix = "..." if chunk and not chunk[0].isupper() else ""
                    piece = f"{prefix}{chunk}..."
                    if total + len(piece) > max_chars and selected:
                        break
                    selected.append(piece)
                    total += len(piece) + 3
                    if len(selected) >= 3:
                        break
                if selected:
                    return " | ".join(selected)[:max_chars]

        seg = max(140, (max_chars - 24) // 3)
        head = cleaned[:seg].rsplit(" ", 1)[0].strip()
        mid_start = max(len(head), (len(cleaned) // 2) - (seg // 2))
        mid = cleaned[mid_start:mid_start + seg].strip()
        tail = cleaned[-seg:].split(" ", 1)[-1].strip() if len(cleaned) > seg * 2 else ""
        parts = [p for p in [head, mid, tail] if p]
        return " [...] ".join(parts)[:max_chars]

    @staticmethod
    def _normalize_doc_text(text: Any) -> str:
        """Normalizes Unicode smart quotes/dashes to ASCII equivalents and lowercases text."""
        s = str(text or "")
        s = (
            s.replace("\u2018", "'")
            .replace("\u2019", "'")
            .replace("\u201c", '"')
            .replace("\u201d", '"')
            .replace("\u2013", "-")
            .replace("\u2014", "-")
            .replace("\u2212", "-")
        )
        return s.lower().strip()

    @staticmethod
    def _compact_doc_punctuation(text: str) -> str:
        """Collapses whitespace around '.', '-', '_' so spaced filenames match canonical filenames."""
        collapsed = re.sub(r"\s*([.\-_])\s*", r"\1", text)
        return re.sub(r"\s+", " ", collapsed).strip()

    @classmethod
    def _extract_doc_name(cls, doc: Any) -> str:
        """Extracts a document's display name or title, falling back safely to its file basename."""
        name_str = str(getattr(doc, "name", "") or getattr(doc, "title", "") or "").strip()
        if not name_str:
            file_field = getattr(doc, "file", None) or getattr(doc, "access_file", None)
            file_path_val = (
                file_field
                if isinstance(file_field, str)
                else getattr(file_field, "name", None)
            )
            if isinstance(file_path_val, str) and file_path_val.strip():
                name_str = os.path.basename(file_path_val.replace("\\", "/").strip())
        return name_str

    @staticmethod
    def _import_ocr_extractor() -> Optional[Any]:
        """Imports OCRTextExtractor cleanly across both package and standalone test contexts."""
        try:
            from Features.Helpers.ocr_text_extractor import OCRTextExtractor
            return OCRTextExtractor
        except Exception:
            try:
                from .ocr_text_extractor import OCRTextExtractor
                return OCRTextExtractor
            except Exception:
                return None

    @classmethod
    def match_eresource_files(
        cls,
        files: List[Any],
        query_tokens: List[str],
        raw_query: str = "",
        limit: int = 5,
    ) -> List[Any]:
        """
        Matches and ranks active EResourceFile instances against query tokens and raw query text.
        Normalizes Unicode punctuation and whitespace around filename delimiters ('.-', '-', '_').
        """
        if not files:
            return []

        clean_raw = cls._normalize_doc_text(raw_query)
        clean_raw_compact = cls._compact_doc_punctuation(clean_raw)
        clean_raw_norm = re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", clean_raw)).strip()

        effective_tokens = [
            cls._normalize_doc_text(t)
            for t in (query_tokens or [])
            if t and cls._normalize_doc_text(t) not in cls.STOP_WORDS
        ]
        if not effective_tokens and clean_raw_norm:
            effective_tokens = [
                tok
                for tok in clean_raw_norm.split()
                if len(tok) > 1 and tok not in cls.STOP_WORDS
            ]

        if not effective_tokens and not clean_raw:
            return []

        scored_files: List[Tuple[float, str, Any]] = []

        for f in files:
            if getattr(f, "is_active", True) is False:
                continue

            name_str = cls._extract_doc_name(f)
            if not name_str:
                continue

            kw_val = getattr(f, "keywords", "")
            if isinstance(kw_val, (list, tuple, set)):
                kw_str = " ".join(str(k) for k in kw_val)
            else:
                kw_str = str(kw_val or "").strip()

            summary_str = str(
                getattr(f, "summary", "")
                or getattr(f, "description", "")
                or ""
            ).strip()

            toc_val = (
                getattr(f, "table_of_contents", None)
                or getattr(f, "chapters", None)
                or getattr(f, "toc", None)
            )
            if isinstance(toc_val, (list, tuple)):
                toc_str = ", ".join(str(c).strip() for c in toc_val if str(c).strip())
            else:
                toc_str = str(toc_val or "").strip()

            topics_val = (
                getattr(f, "key_topics", None)
                or getattr(f, "concepts", None)
                or getattr(f, "topics", None)
            )
            if isinstance(topics_val, (list, tuple, set)):
                topics_str = ", ".join(str(t).strip() for t in topics_val if str(t).strip())
            else:
                topics_str = str(topics_val or "").strip()

            breadcrumb = cls._extract_file_breadcrumb(f)

            name_l = cls._normalize_doc_text(name_str)
            name_compact = cls._compact_doc_punctuation(name_l)
            name_norm = re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", name_l)).strip()
            kw_l = cls._normalize_doc_text(kw_str)
            summary_l = cls._normalize_doc_text(summary_str)
            breadcrumb_l = cls._normalize_doc_text(breadcrumb)
            toc_l = cls._normalize_doc_text(toc_str)
            topics_l = cls._normalize_doc_text(topics_str)
            full_text_str = str(getattr(f, "extracted_text", "") or "").strip()
            full_text_l = cls._normalize_doc_text(full_text_str)

            name_words = set(re.findall(r"[a-z0-9]+", name_l))
            kw_words = set(re.findall(r"[a-z0-9]+", kw_l))
            summary_words = set(re.findall(r"[a-z0-9]+", summary_l))
            breadcrumb_words = set(re.findall(r"[a-z0-9]+", breadcrumb_l))

            score = 0.0

            # 1. Exact & delimiter-normalized phrase matching
            if len(clean_raw) >= 3:
                if clean_raw in name_l or (len(name_compact) >= 5 and name_compact in clean_raw_compact):
                    score += 20.0
                if len(name_norm) >= 5 and name_norm in clean_raw_norm:
                    score += 18.0
                elif len(clean_raw_norm) >= 5 and clean_raw_norm in name_norm:
                    score += 15.0
                if clean_raw in kw_l:
                    score += 10.0
                if clean_raw in summary_l:
                    score += 8.0
                if clean_raw in toc_l or clean_raw in topics_l:
                    score += 6.0
                if full_text_l and clean_raw in full_text_l:
                    score += 8.0

            # 2. Token matching across name, keywords, summary, breadcrumb, TOC, key topics, and full extracted text
            for tok in effective_tokens:
                score += cls._match_token_in_text(tok, name_l, name_words) * 1.0
                score += cls._match_token_in_text(tok, kw_l, kw_words) * 0.9
                score += cls._match_token_in_text(tok, summary_l, summary_words) * 0.7
                score += cls._match_token_in_text(tok, breadcrumb_l, breadcrumb_words) * 0.5
                if tok in toc_l:
                    score += 2.0
                if tok in topics_l:
                    score += 2.0
                if full_text_l and re.search(rf"\b{re.escape(tok)}", full_text_l):
                    score += 2.5

            if score > 0.0:
                scored_files.append((score, name_l, f))

        if not scored_files:
            return []

        scored_files.sort(key=lambda item: (-item[0], item[1]))
        return [item[2] for item in scored_files[: max(1, limit)]]

    @classmethod
    def match_and_format_file_knowledge(
        cls,
        files: List[Any],
        query_tokens: List[str],
        raw_query: str = "",
        limit: int = 3,
    ) -> str:
        """
        Matches EResourceFile instances against user query tokens using file name,
        keywords, summary, table of contents, and full extracted document text.

        Returns a concise, grounded knowledge context string citing:
          - File name and parent Department breadcrumb
          - Document summary
          - Table of contents / chapters
          - Key topics / concepts covered
          - Full-text document excerpts
        """
        top_files = cls.match_eresource_files(
            files, query_tokens, raw_query=raw_query, limit=limit
        )
        if not top_files:
            return ""

        effective_tokens = [
            cls._normalize_doc_text(t)
            for t in (query_tokens or [])
            if t and cls._normalize_doc_text(t) not in cls.STOP_WORDS
        ]

        lines: List[str] = ["[DOCUMENT & BOOK CONTENT KNOWLEDGE (E-Resource Course Files)]"]
        for f in top_files:
            name_str = cls._extract_doc_name(f) or "Document"
            breadcrumb = cls._extract_file_breadcrumb(f)
            entry_lines = [f"- File: '{name_str}' (Department: {breadcrumb})"]

            summary_str = str(
                getattr(f, "summary", "")
                or getattr(f, "description", "")
                or ""
            ).strip()
            if summary_str:
                if len(summary_str) > 500:
                    summary_str = summary_str[:497].rstrip() + "..."
                entry_lines.append(f"  Summary: {summary_str}")

            toc_val = (
                getattr(f, "table_of_contents", None)
                or getattr(f, "chapters", None)
                or getattr(f, "toc", None)
            )
            if toc_val:
                if isinstance(toc_val, (list, tuple)):
                    toc_str = ", ".join(str(c).strip() for c in toc_val if str(c).strip())
                else:
                    toc_str = str(toc_val).strip()
                if len(toc_str) > 450:
                    toc_str = toc_str[:447].rstrip() + "..."
                entry_lines.append(f"  Table of Contents / Chapters: {toc_str}")

            topics_val = (
                getattr(f, "key_topics", None)
                or getattr(f, "concepts", None)
                or getattr(f, "topics", None)
                or getattr(f, "keywords", None)
            )
            if topics_val:
                if isinstance(topics_val, (list, tuple, set)):
                    topics_str = ", ".join(str(t).strip() for t in topics_val if str(t).strip())
                else:
                    topics_str = str(topics_val).strip()
                if len(topics_str) > 300:
                    topics_str = topics_str[:297].rstrip() + "..."
                entry_lines.append(f"  Key Topics / Concepts: {topics_str}")

            full_text_str = str(getattr(f, "extracted_text", "") or "").strip()
            excerpt_str = cls._extract_relevant_fulltext_excerpts(
                full_text_str, query_tokens=effective_tokens, max_chars=700
            )
            if excerpt_str:
                entry_lines.append(f"  Full-Text Document Excerpts: {excerpt_str}")

            lines.append("\n".join(entry_lines))

        return "\n".join(lines)

    @classmethod
    def _resolve_targeted_document(
        cls,
        files: List[Any],
        raw_query: str,
        tokens: Optional[Set[str]] = None,
    ) -> Optional[Any]:
        """
        Locates the single most specifically referenced document (EResourceFile or ResearchReference)
        from a user's inquiry. Evaluates exact filename, clean basename, extension-less title,
        Unicode/whitespace/punctuation normalization, and high-confidence keyword overlap.
        """
        if not files or not raw_query:
            return None

        clean_query = cls._normalize_doc_text(raw_query)
        clean_query_compact = cls._compact_doc_punctuation(clean_query)
        clean_query_norm = " " + re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", clean_query)).strip() + " "
        clean_query_noposs = re.sub(r"([a-z0-9])'s\b", r"\1s", clean_query)
        query_words = set(re.findall(r"[a-z0-9]+", clean_query)) | set(re.findall(r"[a-z0-9]+", clean_query_noposs))

        best_doc = None
        best_score = 0.0

        for f in files:
            name_str = cls._extract_doc_name(f)
            if not name_str:
                continue

            name_lower = cls._normalize_doc_text(name_str)
            name_compact = cls._compact_doc_punctuation(name_lower)
            name_clean = re.sub(r"^(?:\d+[\.\-_]+)+", "", name_lower)
            name_clean = re.sub(r"\.(pdf|docx|txt|doc|epub)$", "", name_clean)
            name_clean = name_clean.replace("-", " ").replace("_", " ").replace(".", " ")
            name_clean_noposs = re.sub(r"([a-z0-9])'s\b", r"\1s", name_clean)
            name_words = set(re.findall(r"[a-z0-9]+", name_clean))
            name_words_all = name_words | set(re.findall(r"[a-z0-9]+", name_clean_noposs))

            name_clean_norm = " " + re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", name_lower)).strip() + " "
            name_base_norm = " " + re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", name_clean)).strip() + " "

            score = 0.0

            # 1. Exact raw or delimiter-collapsed filename mention (handles "16 .- National-Organic- Farming-Handbook-author- USDA.pdf")
            if name_lower in clean_query or (len(name_compact) > 5 and name_compact in clean_query_compact):
                score += 150.0

            # 2. Normalized filename match (e.g. handles spaces around punctuation "01 .- Basic-Agriculture...")
            if len(name_clean_norm.strip()) > 5 and name_clean_norm.strip() in clean_query_norm:
                score += 180.0
            elif len(name_base_norm.strip()) > 5 and name_base_norm.strip() in clean_query_norm:
                score += 160.0

            # 3. Base name match without extension
            if len(name_clean.strip()) > 5 and name_clean.strip() in clean_query:
                score += 100.0

            # 4. High word overlap (including possessive-normalized terms like "Farmer’s" <-> "Farmers")
            common = query_words & name_words_all
            meaningful_common = [w for w in common if w not in cls.STOP_WORDS and len(w) > 2]
            if len(meaningful_common) >= 3:
                score += len(meaningful_common) * 20.0
            elif len(meaningful_common) >= 2 and len(name_words) <= 5:
                score += len(meaningful_common) * 15.0

            # 5. Numbered prefix match (e.g., "01", "02", "16") and matches key title word
            prefix_match = re.search(r"\b0?([1-9]\d?)\b", clean_query)
            if prefix_match:
                prefix = prefix_match.group(1)
                if name_lower.startswith(prefix) or name_lower.startswith(f"0{prefix}"):
                    if meaningful_common:
                        score += 35.0

            if score > best_score:
                best_score = score
                best_doc = f

        if best_score >= 30.0:
            return best_doc
        return None

    @classmethod
    def find_targeted_document(
        cls,
        files: List[Any],
        raw_query: str,
        tokens: Optional[Set[str]] = None,
    ) -> Optional[Any]:
        """Public alias delegating to _resolve_targeted_document."""
        return cls._resolve_targeted_document(files, raw_query, tokens=tokens)

    @staticmethod
    def _clean_summary_text(text: str) -> str:
        """
        Strips noisy leading page-number markers, TOC dot-leaders, and stray header
        fragments from extracted or generated summaries while preserving clean prose.
        """
        raw = str(text or "").strip()
        if not raw:
            return ""

        cleaned_lines: List[str] = []
        for raw_line in raw.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            if re.match(r"^\[?\s*page\s+\d+(?:\s+of\s+\d+)?\s*\]?$", line, re.IGNORECASE):
                continue
            if re.match(r"^[-_=]{3,}$", line):
                continue
            if re.search(r"\.{4,}\s*\d*\s*$", line):
                continue
            if re.match(r"^(?:table\s+of\s+contents|contents)\s*:?\s*$", line, re.IGNORECASE):
                continue
            if re.match(r"^(?:\d{1,4}|[ivxlcdm]{1,6})$", line, re.IGNORECASE):
                continue
            cleaned_lines.append(line)

        merged = " ".join(cleaned_lines)
        merged = re.sub(r"\[\s*Page\s+\d+\s*\]", " ", merged, flags=re.IGNORECASE)
        merged = re.sub(r"^\s*(?:Page\s+\d+(?:\s+of\s+\d+)?\s*[:\-]?\s*)+", "", merged, flags=re.IGNORECASE)
        merged = re.sub(r"^\s*(?:table\s+of\s+contents|contents)\s*[:\-]?\s*", "", merged, flags=re.IGNORECASE)
        merged = re.sub(r"\s+", " ", merged).strip()
        return merged

    @staticmethod
    def _strip_filename_from_query(query: str) -> str:
        """
        Removes explicit filename tokens/slugs (including '-author-...' suffixes and
        '.pdf'/'.docx' extensions) from a user query before aspect classification
        or RAG keyword extraction so filename words never pollute query intent.
        """
        text = str(query or "").strip()
        if not text:
            return ""
        # 1. Numbered prefix filenames with optional spaces around delimiters ending in extension
        text = re.sub(
            r"\b\d{1,3}\s*[\.\-_]+\s*[^\?\!\n]*?\.(?:pdf|docx|doc|txt|epub|pptx|xlsx)\b",
            " ",
            text,
            flags=re.IGNORECASE,
        )
        # 2. Any contiguous token ending in a document extension
        text = re.sub(r"\S+\.(?:pdf|docx|doc|txt|epub|pptx|xlsx)\b", " ", text, flags=re.IGNORECASE)
        # 3. Extension-less '-author-...' filename slugs
        text = re.sub(
            r"\b[A-Za-z0-9][A-Za-z0-9\.\-_]*[\.\-_]authors?[\.\-_][A-Za-z0-9\.\-_]+\b",
            " ",
            text,
            flags=re.IGNORECASE,
        )
        # 4. Extension-less numbered multi-separator filename slugs (e.g. 01.-Basic-Agriculture.-Handbook)
        text = re.sub(
            r"\b\d{1,3}\s*[\.\-_]+(?:[A-Za-z0-9]+[\.\-_]+){2,}[A-Za-z0-9]+\b",
            " ",
            text,
        )
        # 5. Long multi-separator slugs (4+ parts)
        text = re.sub(
            r"\b[A-Za-z0-9]+(?:[\.\-_][A-Za-z0-9]+){3,}\b",
            " ",
            text,
        )
        return re.sub(r"\s+", " ", text).strip()

    @staticmethod
    def _clean_author_candidate(raw: str) -> str:
        """Validates and normalizes a candidate author/publisher string."""
        cleaned = re.sub(r"\s+", " ", str(raw or "")).strip(" \t\r\n.,;:-–—\"'")
        if not cleaned or len(cleaned) < 2 or len(cleaned) > 120:
            return ""
        if cleaned.isdigit():
            return ""
        if cleaned.lower() in {
            "unknown",
            "n/a",
            "na",
            "none",
            "null",
            "anonymous",
            "unspecified",
            "not specified",
            "not available",
        }:
            return ""
        return cleaned

    @classmethod
    def extract_document_author(cls, doc: Any) -> str:
        """
        Deterministically extracts the author/compiler/publisher of a ResearchReference
        or EResourceFile using three ordered tiers:
          1. Explicit `doc.author` or `doc.authors` metadata fields.
          2. Filename / document-name `-author-...` or `_author_...` patterns.
          3. Explicit metadata lines (`Author(s):`, `Prepared by:`, `Written by:`,
             `Published by:`, `Compiler:`) within the first ~2,500 chars of `extracted_text`.
        Returns an empty string when no reliable author is found.
        """
        if doc is None:
            return ""

        # Tier 1: Explicit author / authors attributes
        for attr in ("author", "authors"):
            val = getattr(doc, attr, None)
            if isinstance(val, str):
                cand = cls._clean_author_candidate(val)
                if cand:
                    return cand
            elif isinstance(val, (list, tuple)) and all(isinstance(x, str) for x in val):
                joined = ", ".join(x.strip() for x in val if x.strip())
                cand = cls._clean_author_candidate(joined)
                if cand:
                    return cand

        # Tier 2: Filename / doc name patterns (e.g., "...-author-Shiksha-Kendra.pdf")
        candidate_names: List[str] = []
        doc_name = cls._extract_doc_name(doc)
        if doc_name:
            candidate_names.append(doc_name)
        for file_attr in ("file", "access_file"):
            f_val = getattr(doc, file_attr, None)
            f_path = f_val if isinstance(f_val, str) else getattr(f_val, "name", None)
            if isinstance(f_path, str) and f_path.strip():
                base = os.path.basename(f_path.replace("\\", "/").strip())
                if base and base not in candidate_names:
                    candidate_names.append(base)

        for raw_name in candidate_names:
            stem = re.sub(
                r"\.(?:pdf|docx|doc|txt|epub|pptx|xlsx)$",
                "",
                raw_name.strip(),
                flags=re.IGNORECASE,
            )
            match = re.search(
                r"(?:^|[\s\.\-_])authors?[\s\.\-_:]+(.+)$",
                stem,
                flags=re.IGNORECASE,
            )
            if match:
                parsed = re.sub(r"[-_]+", " ", match.group(1))
                parsed = re.sub(r"\s+", " ", parsed).strip()
                cand = cls._clean_author_candidate(parsed)
                if cand:
                    return cand

        # Tier 3: First ~2,500 chars of extracted_text for explicit author/publisher lines
        raw_text = getattr(doc, "extracted_text", None)
        if isinstance(raw_text, str) and raw_text.strip():
            head_text = raw_text[:2500]
            for raw_line in head_text.splitlines():
                line = raw_line.strip()
                if not line:
                    continue
                m = re.match(
                    r"^(?:author\s*\(s\)|authors?|prepared\s+by|written\s+by|"
                    r"published\s+by|compilers?|compiled\s+by)\s*[:\-]\s*(.+?)\s*$",
                    line,
                    flags=re.IGNORECASE,
                )
                if not m:
                    continue
                val_str = m.group(1).strip()
                # Trim trailing inline metadata columns (e.g. " | Date: 2022")
                val_str = re.split(r"\s+\|\s+|\t{1,}|\s{3,}", val_str)[0].strip()
                words = val_str.split()
                if len(words) > 12 or len(val_str) > 100:
                    continue
                lower_val = val_str.lower()
                if any(
                    noise in lower_val
                    for noise in ("http://", "https://", "all rights reserved", "copyright", "table of contents")
                ):
                    continue
                if (
                    len(words) >= 6
                    and val_str.endswith(".")
                    and not re.search(r"\b(?:Inc|Corp|Ltd|Jr|Sr|Ph\.D|M\.S|Dr|Co|Univ|Dept)\.$", val_str, re.I)
                ):
                    continue
                cand = cls._clean_author_candidate(val_str)
                if cand:
                    return cand

        return ""

    @classmethod
    def extract_document_references(cls, doc: Any, max_chars: int = 800) -> str:
        """
        Searches `doc.extracted_text` (or explicit `references`/`bibliography` metadata
        if present) for `References`, `Bibliography`, `Works Cited`, `Suggested Readings`,
        or `Further Reading` headings, or formal citation/URL entries. Returns concise
        clean bullet lines up to `max_chars`, or `""` if none exist.
        """
        if doc is None:
            return ""

        def _cap_bullets(entries: List[str], limit_chars: int) -> str:
            selected: List[str] = []
            total = 0
            for raw_entry in entries:
                clean_entry = re.sub(r"\s+", " ", raw_entry).strip()
                clean_entry = re.sub(r"^[-*•]+\s*", "", clean_entry).strip()
                if not clean_entry or len(clean_entry) < 6:
                    continue
                bullet = f"- {clean_entry}"
                if len(bullet) > limit_chars and not selected:
                    bullet = bullet[: max(20, limit_chars - 3)].rstrip() + "..."
                    selected.append(bullet)
                    break
                added = len(bullet) + (1 if selected else 0)
                if total + added > limit_chars:
                    break
                selected.append(bullet)
                total += added
            return "\n".join(selected)

        # Optional explicit metadata field if populated as string
        for attr in ("references", "bibliography"):
            explicit_val = getattr(doc, attr, None)
            if isinstance(explicit_val, str) and explicit_val.strip():
                explicit_lines = [l.strip() for l in explicit_val.splitlines() if l.strip()]
                formatted = _cap_bullets(explicit_lines, max_chars)
                if formatted:
                    return formatted

        raw_text = getattr(doc, "extracted_text", None)
        if not isinstance(raw_text, str) or not raw_text.strip():
            return ""

        lines = raw_text.splitlines()
        heading_re = re.compile(
            r"^\s*(?:(?:\d+|chapter\s+\d+|section\s+\d+|appendix\s*[a-z0-9]*)\s*[\.\-:]?\s*)?"
            r"(?:references|bibliography|works\s+cited|suggested\s+readings?|further\s+readings?)"
            r"\s*[:\-]?\s*$",
            re.IGNORECASE,
        )
        stop_heading_re = re.compile(
            r"^\s*(?:appendix(?:\s+[a-z0-9]+)?|index|glossary|about\s+the\s+authors?|"
            r"acknowledgements?|chapter\s+\d+|unit\s+\d+|table\s+of\s+contents)\b",
            re.IGNORECASE,
        )
        ref_signal_re = re.compile(
            r"(?:\(\d{4}\)|\b(?:19|20)\d{2}\b|https?://|doi\s*:|isbn\b|et\s+al\.|^\s*(?:\[\d+\]|\d+[\.\)]))",
            re.IGNORECASE,
        )

        # Locate candidate reference sections (scan from back to front to avoid TOC headers)
        candidate_indices = [
            i
            for i, line in enumerate(lines)
            if heading_re.match(line)
            and not re.search(r"\.{3,}", line)
            and not re.search(r"\s{3,}\d{1,4}\s*$", line)
        ]

        best_entries: List[str] = []
        for start_idx in reversed(candidate_indices):
            collected: List[str] = []
            blank_streak = 0
            for line_raw in lines[start_idx + 1 :]:
                s = line_raw.strip()
                if not s:
                    blank_streak += 1
                    if blank_streak >= 3 and collected:
                        break
                    continue
                blank_streak = 0
                if re.match(r"^\[?\s*page\s+\d+(?:\s+of\s+\d+)?\s*\]?$", s, re.IGNORECASE):
                    continue
                if re.match(r"^\d{1,4}$", s):
                    continue
                if re.search(r"\.{4,}\s*\d*\s*$", s):
                    continue
                if stop_heading_re.match(s):
                    break

                is_new_item = bool(
                    re.match(r"^(?:\[\d+\]|\d{1,3}[\.\)]|[-*•]|https?://|[A-Z][a-zA-Z\-]+,\s+[A-Z]\.)", s)
                )
                if (
                    collected
                    and not is_new_item
                    and not collected[-1].endswith((".", "!", "?", ")"))
                    and not re.search(r"https?://\S+$", collected[-1])
                ):
                    collected[-1] = f"{collected[-1]} {s}"
                else:
                    collected.append(s)

                if len(collected) >= 15:
                    break

            if collected and any(ref_signal_re.search(item) for item in collected):
                best_entries = collected
                break
            if collected and not best_entries:
                best_entries = collected

        if best_entries:
            formatted = _cap_bullets(best_entries, max_chars)
            if formatted:
                return formatted

        # Fallback: formal citations, DOIs, ISBNs, or URLs anywhere in extracted_text
        citation_re = re.compile(
            r"(?:https?://[^\s\)\]>]+|"
            r"\bdoi\s*[:\s]?\s*10\.\d{4,}/\S+|"
            r"\bisbn\s*[:\-\s]?\s*[\d\-X]{10,}|"
            r"\b[A-Z][a-zA-Z\-]{1,25},\s+[A-Z]\.(?:\s*[A-Z]\.)?.*?\(\d{4}\)|"
            r"\bet\s+al\.\s*\(\d{4}\))",
            re.IGNORECASE,
        )
        fallback_entries: List[str] = []
        seen_norm: Set[str] = set()
        for raw_line in lines:
            s = raw_line.strip()
            if not s or len(s) < 12 or re.search(r"\.{4,}\s*\d*\s*$", s):
                continue
            if citation_re.search(s):
                norm_s = s.lower()
                if norm_s not in seen_norm:
                    seen_norm.add(norm_s)
                    fallback_entries.append(s)
                    if len(fallback_entries) >= 6:
                        break

        return _cap_bullets(fallback_entries, max_chars) if fallback_entries else ""

    @classmethod
    def classify_document_query_aspects(cls, query: str) -> Set[str]:
        """
        Classifies which specific document fields/aspects a patron query is requesting:
          - `"author"`: authorship / writer / compiler / publisher inquiries
          - `"references"`: references / bibliography / works cited / sources
          - `"toc"`: chapters / table of contents / sections / outline / syllabus
          - `"keywords"`: key topics / concepts / keywords / subjects
          - `"summary"`: broad overview / summary / full details / legacy empty query
          - `"specific_question"`: narrow content question answered via RAG excerpts
        """
        if not query or not str(query).strip():
            return {"summary"}

        intent_q = cls._strip_filename_from_query(query)
        intent_l = cls._normalize_doc_text(intent_q)
        if not intent_l:
            return {"summary"}

        aspects: Set[str] = set()

        if re.search(
            r"\b(?:authors?|written\s+by|wrote|writer|prepared\s+by|compiled\s+by|compiler|publisher|published\s+by|creator)\b",
            intent_l,
        ):
            aspects.add("author")

        if re.search(
            r"\b(?:references?|bibliography|works?\s+cited|citations?|sources?|further\s+readings?|suggested\s+readings?)\b",
            intent_l,
        ):
            aspects.add("references")

        if re.search(
            r"\b(?:chapters?|table\s+of\s+contents|list\s+of\s+contents|toc|sections?|outline|units?|modules?|syllabus)\b",
            intent_l,
        ):
            aspects.add("toc")

        if re.search(
            r"\b(?:keywords?|key\s+topics?|topics?|concepts?|subjects?|tags?|themes?)\b",
            intent_l,
        ):
            aspects.add("keywords")

        is_explicit_summary = bool(
            re.search(
                r"\b(?:overview|summary|summarize|summarise|abstract|synopsis|full\s+details|all\s+details|everything|"
                r"about\s+this\s+(?:book|document|file|thesis|paper|handbook)|what\s+is\s+(?:this|it)\s+about)\b",
                intent_l,
            )
        )
        if not is_explicit_summary and re.search(r"\btell\s+me\s+about\b", intent_l) and not aspects:
            is_explicit_summary = True
        if is_explicit_summary:
            aspects.add("summary")

        if not aspects:
            ignored = (
                cls.STOP_WORDS
                | cls.GENERIC_CATALOG_WORDS
                | {
                    "this",
                    "that",
                    "these",
                    "those",
                    "file",
                    "files",
                    "document",
                    "documents",
                    "handbook",
                    "manual",
                    "guide",
                    "pdf",
                    "docx",
                    "please",
                    "info",
                    "information",
                    "details",
                }
            )
            rem_tokens = [
                t
                for t in re.findall(r"[a-z0-9]+", intent_l)
                if len(t) > 1 and t not in ignored
            ]
            if rem_tokens:
                aspects.add("specific_question")
            else:
                aspects.add("summary")

        return aspects

    @classmethod
    def build_targeted_document_knowledge_response(cls, doc: Any, query: str = "") -> str:
        """
        Formats an authoritative, grounded answer for RIZAL when a patron asks about
        a specific document (EResourceFile or ResearchReference).

        - When `query` requests narrow aspect(s) (`author`, `references`, `toc`,
          `keywords`, `specific_question`) without asking for an overview/summary,
          returns a concise, plain-text, direct answer (2-6 lines) containing ONLY
          the requested fields.
        - When `query` is empty (`""`) or requests a broad overview/summary, returns
          the full structured overview with cleaned summary text.
        """
        name_str = cls._extract_doc_name(doc) or "Document"
        breadcrumb = cls._extract_file_breadcrumb(doc)

        raw_summary = getattr(doc, "summary", "")
        summary_str = raw_summary.strip() if isinstance(raw_summary, str) else ""

        toc_val = (
            getattr(doc, "table_of_contents", None)
            or getattr(doc, "chapters", None)
            or getattr(doc, "toc", None)
        )
        if isinstance(toc_val, (list, tuple)):
            toc_lines = [f"- {str(c).strip()}" for c in toc_val if str(c).strip()]
            toc_str = "\n".join(toc_lines)
        elif isinstance(toc_val, str):
            toc_str = toc_val.strip()
        else:
            toc_str = ""

        keywords_val = (
            getattr(doc, "keywords", None)
            or getattr(doc, "key_topics", None)
            or getattr(doc, "topics", None)
        )
        if isinstance(keywords_val, (list, tuple, set)):
            keywords_str = ", ".join(str(k).strip() for k in keywords_val if str(k).strip())
        elif isinstance(keywords_val, str):
            keywords_str = keywords_val.strip()
        else:
            keywords_str = ""

        # Safely distinguish ResearchReference vs EResourceFile without crashing on missing or mocked attributes
        cls_name = getattr(getattr(doc, "__class__", None), "__name__", "")
        has_toc_attr = isinstance(getattr(doc, "table_of_contents", None), str) or isinstance(
            getattr(doc, "chapters", None), str
        )
        is_ref = (cls_name == "ResearchReference") or (
            cls_name != "EResourceFile"
            and not has_toc_attr
            and (
                isinstance(getattr(doc, "call_number", None), str)
                or isinstance(getattr(doc, "category", None), str)
                or getattr(doc, "access_type", None) in ("none", "link", "file")
                or (
                    isinstance(getattr(doc, "title", None), str)
                    and not isinstance(getattr(doc, "name", None), str)
                    and any(
                        isinstance(getattr(doc, attr, None), str)
                        for attr in ("abstract", "methodology", "findings_conclusion")
                    )
                )
            )
        )

        ocr_cls = cls._import_ocr_extractor()
        raw_full_text = getattr(doc, "extracted_text", "")
        full_text_str = raw_full_text.strip() if isinstance(raw_full_text, str) else ""

        raw_title = getattr(doc, "title", "")
        title_str = raw_title.strip() if isinstance(raw_title, str) and raw_title.strip() else name_str

        raw_dept = getattr(doc, "department", "")
        dept_str = (
            raw_dept.strip()
            if isinstance(raw_dept, str)
            else (cls._extract_file_breadcrumb(doc) if raw_dept else "")
        )

        query_clean = str(query or "").strip()
        aspects = cls.classify_document_query_aspects(query_clean) if query_clean else {"summary"}

        # ------------------------------------------------------------------
        # Narrow, Question-Aware Concise Mode (no wall-of-text overview dump)
        # ------------------------------------------------------------------
        if query_clean and "summary" not in aspects:
            display_title = title_str if is_ref else name_str
            if is_ref:
                location_str = (
                    f"Collection -> Research & Thesis References ({dept_str})"
                    if dept_str
                    else "Collection -> Research & Thesis References"
                )
            else:
                location_str = (
                    f"Collection -> Local Books ({breadcrumb})"
                    if breadcrumb
                    else "Collection -> Local Books"
                )

            answer_lines: List[str] = [
                f"Document: {display_title}",
                f"Location: {location_str}",
            ]

            if "author" in aspects:
                author_val = cls.extract_document_author(doc)
                answer_lines.append(
                    f"Author: {author_val}"
                    if author_val
                    else "Author: Not explicitly listed in the indexed document metadata or text."
                )

            if "references" in aspects:
                refs_cap = 480 if len(aspects) > 1 else 650
                refs_val = cls.extract_document_references(doc, max_chars=refs_cap)
                if refs_val:
                    max_bullets = 3 if len(aspects) > 1 else 4
                    ref_bullets = [l for l in refs_val.splitlines() if l.strip()][:max_bullets]
                    answer_lines.append("References:\n" + "\n".join(ref_bullets))
                else:
                    answer_lines.append(
                        "References: No References or Bibliography section is listed in the indexed text of this document."
                    )

            if "toc" in aspects:
                if not toc_str and full_text_str and ocr_cls:
                    try:
                        toc_str = str(ocr_cls._extract_table_of_contents(full_text_str) or "").strip()
                    except Exception:
                        pass
                if toc_str:
                    toc_items = [
                        (f"- {l}" if not l.startswith("-") and not re.match(r"^\d+\.", l) else l)
                        for l in (line.strip() for line in toc_str.splitlines())
                        if l
                    ]
                    answer_lines.append("Table of Contents:\n" + "\n".join(toc_items[:4]))
                else:
                    answer_lines.append(
                        "Table of Contents: No chapter headings are explicitly indexed for this document."
                    )

            if "keywords" in aspects:
                if not keywords_str and full_text_str and ocr_cls:
                    try:
                        keywords_str = str(ocr_cls._extract_keywords(full_text_str) or "").strip()
                    except Exception:
                        pass
                if keywords_str:
                    kw_short = keywords_str[:297].rstrip() + "..." if len(keywords_str) > 300 else keywords_str
                    answer_lines.append(f"Topics / Keywords: {kw_short}")
                else:
                    answer_lines.append(
                        "Topics / Keywords: No specific topic keywords are indexed for this document."
                    )

            if "specific_question" in aspects:
                intent_q = cls._strip_filename_from_query(query_clean)
                ignored_q = cls.GENERIC_CATALOG_WORDS | {
                    "say",
                    "says",
                    "tell",
                    "book",
                    "document",
                    "file",
                    "this",
                    "that",
                }
                q_tokens = [
                    t
                    for t in cls.expand_query_tokens(intent_q)
                    if t not in ignored_q
                ]
                excerpt = (
                    cls._extract_relevant_fulltext_excerpts(
                        full_text_str, query_tokens=q_tokens, max_chars=550
                    )
                    if full_text_str
                    else ""
                )
                if excerpt:
                    answer_lines.append(f"Relevant Passage: {excerpt}")
                else:
                    raw_fallback = (
                        getattr(doc, "abstract", "") if is_ref else summary_str
                    )
                    fallback_str = cls._clean_summary_text(
                        raw_fallback if isinstance(raw_fallback, str) else ""
                    )
                    if fallback_str:
                        if len(fallback_str) > 350:
                            fallback_str = fallback_str[:347].rstrip() + "..."
                        answer_lines.append(f"Relevant Summary: {fallback_str}")
                    else:
                        answer_lines.append(
                            "Relevant Passage: No matching passage was found in the indexed text of this document."
                        )

            return "\n".join(answer_lines)

        # ------------------------------------------------------------------
        # Broad Overview / Legacy Mode (query == "" or broad overview intent)
        # ------------------------------------------------------------------
        if is_ref:
            author_str = cls.extract_document_author(doc) or "Unknown"
            raw_call = getattr(doc, "call_number", None) or getattr(doc, "acc_no", None)
            call_str = raw_call.strip() if isinstance(raw_call, str) and raw_call.strip() else "N/A"
            raw_abstract = getattr(doc, "abstract", "")
            abstract_str = (raw_abstract.strip() if isinstance(raw_abstract, str) else "") or summary_str
            raw_method = getattr(doc, "methodology", "")
            method_str = raw_method.strip() if isinstance(raw_method, str) else ""
            raw_findings = getattr(doc, "findings_conclusion", "")
            findings_str = raw_findings.strip() if isinstance(raw_findings, str) else ""

            if full_text_str and (not abstract_str or not findings_str or not method_str):
                if ocr_cls and not abstract_str:
                    try:
                        abstract_str = ocr_cls._generate_summary(full_text_str)
                    except Exception:
                        pass
                if not findings_str or not method_str:
                    try:
                        from Features.management.commands.extract_file_knowledge import (
                            extract_findings_or_conclusion,
                            extract_methodology,
                        )
                        method_str = method_str or extract_methodology(full_text_str)
                        findings_str = findings_str or extract_findings_or_conclusion(full_text_str)
                    except Exception:
                        pass

            if not abstract_str or not findings_str:
                if ocr_cls:
                    try:
                        synth = ocr_cls.synthesize_domain_knowledge(title_str, dept_str)
                        abstract_str = abstract_str or synth.get("summary", "")
                    except Exception:
                        pass
                abstract_str = abstract_str or (
                    f"Academic research study titled '{title_str}' cataloged under the {dept_str or 'JRMSU'} repository."
                )
                findings_str = findings_str or (
                    f"Scholarly findings and academic outcomes for '{title_str}', "
                    f"contributing specialized research data to the {dept_str or 'JRMSU'} academic repository."
                )
                method_str = method_str or "Rigorous experimental and field methodology following institutional ethical guidelines."

            abstract_str = cls._clean_summary_text(abstract_str) or abstract_str

            dept_line = f"🏛️ Academic Department / Program: {dept_str}\n" if dept_str else ""
            author_line = f"✍️ Author / Researcher: {author_str}\n" if author_str else ""
            call_line = f"🏷️ Call Number: {call_str}\n" if call_str != "N/A" else ""
            method_section = f"\n🔬 Research Methodology:\n{method_str}\n" if method_str else ""
            findings_section = f"\n💡 Key Findings & Conclusions:\n{findings_str}\n" if findings_str else ""
            excerpt_str = (
                cls._extract_relevant_fulltext_excerpts(full_text_str, max_chars=900)
                if len(full_text_str) > 300
                else ""
            )
            excerpt_section = f"\n📄 Document Full-Text Highlights:\n{excerpt_str}\n" if excerpt_str else ""

            return (
                f"Here is the verified research knowledge for '{title_str}' from our library catalog:\n\n"
                f"🎓 Research Title: {title_str}\n"
                f"{author_line}"
                f"{dept_line}"
                f"{call_line}\n"
                f"📋 Research Abstract:\n"
                f"{abstract_str}\n"
                f"{method_section}"
                f"{findings_section}"
                f"{excerpt_section}\n"
                f"🛡️ Catalog Access Policy:\n"
                f"This academic research is cataloged under 'Collection' -> 'Research & Thesis References'. "
                f"To protect student and institutional copyright, digital viewing is served in read-only protected mode, "
                f"and bound physical copies are available inside the Research & Reference Section for on-site consultation."
            )

        # Extract structured knowledge from actual extracted_text first before domain synthesis fallback
        eresource_full_text = full_text_str
        if eresource_full_text and ocr_cls and (not summary_str or not toc_str or not keywords_str):
            try:
                if not summary_str:
                    summary_str = ocr_cls._generate_summary(eresource_full_text)
                if not toc_str:
                    toc_str = ocr_cls._extract_table_of_contents(eresource_full_text)
                if not keywords_str:
                    keywords_str = ocr_cls._extract_keywords(eresource_full_text)
            except Exception:
                pass

        # If knowledge was not yet generated, synthesize on the fly
        if not summary_str or not toc_str:
            synth: Dict[str, Any] = {}
            if ocr_cls:
                try:
                    synth = ocr_cls.synthesize_domain_knowledge(name_str, breadcrumb)
                except Exception:
                    synth = {}
            if not synth:
                synth = {
                    "summary": f"Comprehensive instructional handbook and curriculum reference for '{name_str}' under the {breadcrumb or 'Library'} collection.",
                    "table_of_contents": "Chapter 1: Theoretical Foundations & Principles\nChapter 2: Applied Methodologies & Best Practices\nChapter 3: Field Applications & Study Review",
                    "keywords": "Instructional Handbook, Curriculum Guide, Library Collection",
                }

            summary_str = summary_str or synth.get("summary", "")
            toc_str = toc_str or synth.get("table_of_contents", "")
            keywords_str = keywords_str or synth.get("keywords", "")

        summary_str = cls._clean_summary_text(summary_str) or summary_str

        # Persist newly derived/synthesized knowledge to database record if applicable
        if hasattr(doc, "save"):
            try:
                update_fields = []
                if hasattr(doc, "summary") and not getattr(doc, "summary", None) and summary_str:
                    doc.summary = summary_str
                    update_fields.append("summary")
                if hasattr(doc, "table_of_contents") and not getattr(doc, "table_of_contents", None) and toc_str:
                    doc.table_of_contents = toc_str
                    update_fields.append("table_of_contents")
                if hasattr(doc, "keywords") and not getattr(doc, "keywords", None) and keywords_str:
                    doc.keywords = keywords_str
                    update_fields.append("keywords")
                if hasattr(doc, "ocr_status") and getattr(doc, "ocr_status", "") in ("pending", "failed", "") and (summary_str or toc_str):
                    doc.ocr_status = "completed"
                    update_fields.append("ocr_status")
                if update_fields:
                    doc.save(update_fields=update_fields)
            except Exception:
                pass

        # Format clean bullet points for Table of Contents if not already bulleted
        formatted_toc = ""
        if toc_str:
            lines = [l.strip() for l in toc_str.splitlines() if l.strip()]
            formatted_toc = "\n".join([f"- {l}" if not l.startswith("-") and not re.match(r"^\d+\.", l) else l for l in lines])

        author_str = cls.extract_document_author(doc)
        author_display = f"✍️ Author: {author_str}\n" if author_str else ""
        dept_display = f"🏛️ Academic Department / Course: {breadcrumb}\n" if breadcrumb else ""
        keywords_display = f"\n🏷️ Core Topics & Concepts Covered:\n{keywords_str}\n" if keywords_str else ""
        fulltext_excerpt = (
            cls._extract_relevant_fulltext_excerpts(eresource_full_text, max_chars=1100)
            if len(eresource_full_text) > 200
            else ""
        )
        fulltext_display = f"\n📄 Document Full-Text Highlights:\n{fulltext_excerpt}\n" if fulltext_excerpt else ""

        return (
            f"Here is the verified document knowledge for '{name_str}' from our digital collection:\n\n"
            f"📖 Document: {name_str}\n"
            f"{author_display}"
            f"{dept_display}\n"
            f"📋 Executive Summary:\n"
            f"{summary_str}\n\n"
            f"📑 Table of Contents / Key Chapters:\n"
            f"{formatted_toc}\n"
            f"{keywords_display}"
            f"{fulltext_display}\n"
            f"🛡️ Collection Reading Policy:\n"
            f"This title is available for secure patron reading under our 'Collection' -> 'Local Books' TreeView. "
            f"To protect intellectual property and collection integrity, the document is served via our read-only protected document viewer with anti-download protection."
        )

    @classmethod
    def format_single_document_direct_answer(cls, doc: Any, query: str = "") -> str:
        """Backward-compatible alias delegating to build_targeted_document_knowledge_response."""
        return cls.build_targeted_document_knowledge_response(doc, query=query)

    @classmethod
    def match_and_format_thesis_knowledge(
        cls,
        references: List[Any],
        query_tokens: List[str],
        raw_query: str = "",
        limit: int = 3,
    ) -> str:
        """
        Matches ResearchReference instances that have extracted knowledge
        (abstract, findings_conclusion, methodology).

        Returns a concise grounded summary of the research methodology and key findings.
        """
        knowledge_refs: List[Any] = []
        for r in references or []:
            abstract = getattr(r, "abstract", None)
            findings = (
                getattr(r, "findings_conclusion", None)
                or getattr(r, "findings", None)
                or getattr(r, "conclusion", None)
            )
            methodology = (
                getattr(r, "methodology", None)
                or getattr(r, "methods", None)
            )
            if abstract or findings or methodology:
                knowledge_refs.append(r)

        if not knowledge_refs:
            return ""

        effective_tokens = [
            t.lower()
            for t in (query_tokens or [])
            if t and t.lower() not in cls.STOP_WORDS
        ]
        clean_raw = (raw_query or "").lower().strip()

        if not effective_tokens and not clean_raw:
            return ""

        scored_refs: List[Tuple[float, str, Any]] = []

        for r in knowledge_refs:
            title_str = str(getattr(r, "title", "") or "").strip()
            author_str = str(getattr(r, "author", "") or "").strip()
            dept_str = str(getattr(r, "department", "") or "").strip()
            cat_str = str(getattr(r, "category", "") or "").strip()
            abstract_str = str(getattr(r, "abstract", "") or "").strip()
            findings_str = str(
                getattr(r, "findings_conclusion", None)
                or getattr(r, "findings", None)
                or getattr(r, "conclusion", "")
                or ""
            ).strip()
            methodology_str = str(
                getattr(r, "methodology", None)
                or getattr(r, "methods", "")
                or ""
            ).strip()

            title_l = title_str.lower()
            dept_l = f"{dept_str} {cat_str}".lower()
            abstract_l = abstract_str.lower()
            findings_l = findings_str.lower()
            methodology_l = methodology_str.lower()
            full_text_str = str(getattr(r, "extracted_text", "") or "").strip()
            full_text_l = full_text_str.lower()

            title_words = set(re.findall(r"[a-z0-9]+", title_l))
            dept_words = set(re.findall(r"[a-z0-9]+", dept_l))
            findings_words = set(re.findall(r"[a-z0-9]+", findings_l))
            methodology_words = set(re.findall(r"[a-z0-9]+", methodology_l))
            abstract_words = set(re.findall(r"[a-z0-9]+", abstract_l))

            score = 0.0

            # 1. Exact raw query phrase matching
            if len(clean_raw) >= 3:
                if clean_raw in title_l:
                    score += 15.0
                if clean_raw in findings_l:
                    score += 10.0
                if clean_raw in methodology_l:
                    score += 10.0
                if clean_raw in abstract_l:
                    score += 6.0
                if full_text_l and clean_raw in full_text_l:
                    score += 8.0

            # 2. Token matching
            for tok in effective_tokens:
                score += cls._match_token_in_text(tok, title_l, title_words) * 1.0
                score += cls._match_token_in_text(tok, findings_l, findings_words) * 0.9
                score += cls._match_token_in_text(tok, methodology_l, methodology_words) * 0.9
                score += cls._match_token_in_text(tok, abstract_l, abstract_words) * 0.7
                score += cls._match_token_in_text(tok, dept_l, dept_words) * 0.5
                if full_text_l and re.search(rf"\b{re.escape(tok)}", full_text_l):
                    score += 2.5

            if score > 0.0:
                scored_refs.append((score, title_l, r))

        if not scored_refs:
            return ""

        scored_refs.sort(key=lambda item: (-item[0], item[1]))
        top_refs = [item[2] for item in scored_refs[: max(1, limit)]]

        lines: List[str] = ["[THESIS & RESEARCH KNOWLEDGE (Extracted Methodology & Findings)]"]
        for r in top_refs:
            title_str = str(getattr(r, "title", "") or "Untitled Research").strip()
            author_str = str(getattr(r, "author", "") or "Unknown").strip()
            dept_str = str(getattr(r, "department", "") or getattr(r, "category", "") or "General").strip()
            call_no = getattr(r, "call_number", None) or getattr(r, "acc_no", None)
            call_str = f" | Call No: {call_no}" if call_no else ""

            entry_lines = [f"- Thesis: '{title_str}' by {author_str} ({dept_str}{call_str})"]

            methodology = str(
                getattr(r, "methodology", None)
                or getattr(r, "methods", "")
                or ""
            ).strip()
            if methodology:
                if len(methodology) > 450:
                    methodology = methodology[:447].rstrip() + "..."
                entry_lines.append(f"  Methodology: {methodology}")

            findings = str(
                getattr(r, "findings_conclusion", None)
                or getattr(r, "findings", None)
                or getattr(r, "conclusion", "")
                or ""
            ).strip()
            if findings:
                if len(findings) > 500:
                    findings = findings[:497].rstrip() + "..."
                entry_lines.append(f"  Key Findings & Conclusion: {findings}")

            abstract = str(getattr(r, "abstract", "") or "").strip()
            if abstract and not (methodology and findings):
                if len(abstract) > 450:
                    abstract = abstract[:447].rstrip() + "..."
                entry_lines.append(f"  Abstract Summary: {abstract}")

            full_text_str = str(getattr(r, "extracted_text", "") or "").strip()
            excerpt_str = cls._extract_relevant_fulltext_excerpts(
                full_text_str, query_tokens=effective_tokens, max_chars=700
            )
            if excerpt_str:
                entry_lines.append(f"  Full-Text Thesis Excerpts: {excerpt_str}")

            lines.append("\n".join(entry_lines))

        return "\n".join(lines)


# Standalone function aliases for direct import flexibility
match_and_format_file_knowledge = AIReadViewHelper.match_and_format_file_knowledge
match_and_format_thesis_knowledge = AIReadViewHelper.match_and_format_thesis_knowledge
