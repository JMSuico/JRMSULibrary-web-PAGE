from __future__ import annotations

# [Layer: Helpers] -- ai_query_analyzer.py
# Strategy/table-driven sentence analyzer (<5ms) for intent classification,
# topic token extraction, complexity tiering, token-budget recommendation,
# and sub-1s cache candidate accuracy validation.

from dataclasses import dataclass
import re
from typing import Dict, FrozenSet, List, Pattern, Set, Tuple

from Features.Helpers.ai_read_view_helper import AIReadViewHelper


@dataclass(frozen=True)
class AnalyzedQuery:
    """Immutable analysis result produced by AIQueryAnalyzer (<5ms)."""

    intent: str
    topic_tokens: FrozenSet[str]
    normalized_query: str
    is_catalog_question: bool
    min_cache_score: float
    cache_budget_ms: int
    complexity_tier: str
    recommended_max_tokens: int

    @property
    def is_catalog_query(self) -> bool:
        return self.is_catalog_question

    @property
    def is_book_query(self) -> bool:
        return self.is_catalog_question

    @property
    def tier(self) -> str:
        return self.complexity_tier

    @property
    def max_tokens(self) -> int:
        return self.recommended_max_tokens

    @property
    def num_predict(self) -> int:
        return self.recommended_max_tokens

    @property
    def tokens(self) -> FrozenSet[str]:
        return self.topic_tokens


@dataclass(frozen=True)
class _IntentStrategyRule:
    """Table-driven strategy rule mapping regex/keyword cues to query intent and defaults."""

    intent: str
    patterns: Tuple[Pattern[str], ...]
    keyword_tokens: FrozenSet[str]
    is_catalog_question: bool
    default_tier: str
    min_cache_score: float


class AIQueryAnalyzer:
    """
    Fast (<5ms), deterministic Strategy/table-driven sentence analyzer.
    Classifies patron queries into canonical intents, extracts topic tokens,
    computes complexity tiers + non-truncating token budgets, and validates
    fuzzy FAQ cache candidates against topic/entity/room drift.
    """

    DEFAULT_CACHE_BUDGET_MS = 900  # Strict <= 1.0s fast-cache budget

    TIER_MAX_TOKENS: Dict[str, int] = {
        "TIER_1": 420,
        "TIER_2": 700,
        "TIER_3": 1000,
    }

    _FILLER_WORDS: FrozenSet[str] = frozenset(
        AIReadViewHelper.STOP_WORDS
        | AIReadViewHelper.GENERIC_CATALOG_WORDS
        | {
            "want",
            "need",
            "know",
            "looking",
            "recommend",
            "recommended",
            "suggest",
            "suggested",
            "good",
            "best",
            "something",
            "anything",
            "everything",
            "kind",
            "kinds",
            "type",
            "types",
            "topic",
            "topics",
            "subject",
            "subjects",
            "info",
            "information",
            "details",
            "collections",
        }
    )

    _PROCEDURAL_BOOK_PHRASES: Tuple[str, ...] = (
        "how can i borrow",
        "how do i borrow",
        "how many books can i borrow",
        "can i renew",
        "lose a book",
        "penalty for late",
        "late return",
        "return my book",
        "book gets wet",
        "highlight a book",
        "suggest a book",
        "donate books",
        "take photos of the books",
        "overnight book",
        "how are books arranged",
        "what does ref mean",
        "what does fil mean",
    )

    _DEEP_REASONING_CUES: Tuple[Pattern[str], ...] = (
        re.compile(
            r"\b(?:why|explain|analyze|analysis|compare|comparison|rrl|methodology|"
            r"framework|literature\s+review|formulate|synthesize|evaluate|implication|"
            r"pros\s+and\s+cons|difference\s+between|recommend\s+a\s+research\s+title|"
            r"sustainable|effect|effects|affect|affects)\b",
            re.IGNORECASE,
        ),
    )

    _INTENT_RULES: Tuple[_IntentStrategyRule, ...] = (
        _IntentStrategyRule(
            intent="thesis_search",
            patterns=(
                re.compile(
                    r"\b(?:research\s+papers?|research\s+references?|theses|thesis|"
                    r"dissertations?|softcopy|capstone|findings|methodology)\b",
                    re.IGNORECASE,
                ),
            ),
            keyword_tokens=frozenset(
                {"thesis", "theses", "dissertation", "dissertations", "softcopy", "capstone", "rrl"}
            ),
            is_catalog_question=True,
            default_tier="TIER_2",
            min_cache_score=0.88,
        ),
        _IntentStrategyRule(
            intent="facility_availability",
            patterns=(
                re.compile(
                    r"\b(?:discussion\s+rooms?|tutorium(?:\s+rooms?)?|multimedia\s+rooms?|"
                    r"library\s+comlab|computer\s+lab(?:oratory)?|comlab|"
                    r"reserve\s+(?:a\s+)?room|room\s+reservation|book\s+(?:a\s+)?room|"
                    r"available\s+rooms?|room\s+availability|physical\s+setup|workstations?)\b",
                    re.IGNORECASE,
                ),
            ),
            keyword_tokens=frozenset(
                {"tutorium", "comlab", "reservation", "workstation", "workstations"}
            ),
            is_catalog_question=False,
            default_tier="TIER_2",
            min_cache_score=0.88,
        ),
        _IntentStrategyRule(
            intent="book_topic_search",
            patterns=(
                re.compile(
                    r"\b(?:any\s+books?\s+(?:about|on|for|regarding)|"
                    r"books?\s+(?:about|on|for|regarding)|"
                    r"recommend\s+(?:me\s+)?(?:a\s+)?books?|"
                    r"what\s+books?\b|show\s+(?:me\s+)?books?|"
                    r"find\s+books?|looking\s+for\s+books?|"
                    r"textbooks?|handbooks?|manuals?|novels?)\b",
                    re.IGNORECASE,
                ),
            ),
            keyword_tokens=frozenset(
                {"handbook", "manual", "textbook", "textbooks", "novel", "novels"}
            ),
            is_catalog_question=True,
            default_tier="TIER_2",
            min_cache_score=0.88,
        ),
        _IntentStrategyRule(
            intent="library_policy",
            patterns=(
                re.compile(
                    r"\b(?:opening\s+hours|operating\s+hours|library\s+hours|what\s+time|"
                    r"how\s+(?:can|do)\s+i\s+borrow|how\s+many\s+books|can\s+i\s+renew|"
                    r"late\s+return|penalty|fines?|borrowing\s+rules|"
                    r"library\s+services|services\s+offered|who\s+is\s+the\s+librarian|"
                    r"personnel|staff|contact\s+email|vision|mission|core\s+values|"
                    r"quality\s+objectives|history\s+of\s+jrmsu)\b",
                    re.IGNORECASE,
                ),
            ),
            keyword_tokens=frozenset(
                {
                    "hours",
                    "schedule",
                    "borrow",
                    "renew",
                    "penalty",
                    "fine",
                    "fines",
                    "personnel",
                    "staff",
                    "librarian",
                    "services",
                    "policy",
                    "policies",
                }
            ),
            is_catalog_question=False,
            default_tier="TIER_1",
            min_cache_score=0.85,
        ),
        _IntentStrategyRule(
            intent="catalog_lookup",
            patterns=(
                re.compile(
                    r"\b(?:newly\s+acquired|book\s+catalog|picture\s+inventory|"
                    r"available\s+books|books\s+available|list\s+of\s+books|"
                    r"library\s+catalog|call\s+number|e-?resources?|online\s+databases?)\b",
                    re.IGNORECASE,
                ),
            ),
            keyword_tokens=frozenset(
                {"book", "books", "catalog", "catalogue", "holdings", "eresource", "eresources"}
            ),
            is_catalog_question=True,
            default_tier="TIER_2",
            min_cache_score=0.88,
        ),
    )

    _ORDINAL_NUMBER_MAP: Dict[str, str] = {
        "one": "1",
        "first": "1",
        "1st": "1",
        "two": "2",
        "second": "2",
        "2nd": "2",
        "three": "3",
        "third": "3",
        "3rd": "3",
        "four": "4",
        "fourth": "4",
        "4th": "4",
        "five": "5",
        "fifth": "5",
        "5th": "5",
    }

    _FACILITY_ENTITIES: FrozenSet[str] = frozenset(
        {
            "discussion",
            "tutorium",
            "multimedia",
            "comlab",
            "computer",
            "laboratory",
            "lab",
            "workstation",
            "baggage",
            "circulation",
            "honesty",
            "faculty",
        }
    )

    @staticmethod
    def normalize(text: str) -> str:
        """Normalizes query text to lowercase alphanumeric tokens separated by single spaces."""
        cleaned = re.sub(r"[^a-z0-9\s]", " ", str(text or "").lower())
        return re.sub(r"\s+", " ", cleaned).strip()

    @classmethod
    def extract_topic_tokens(cls, normalized_query: str) -> FrozenSet[str]:
        """Extracts meaningful topic/entity tokens, stripping stop words and generic filler."""
        if not normalized_query:
            return frozenset()
        tokens: Set[str] = set()
        for raw_tok in normalized_query.split():
            if raw_tok in cls._FILLER_WORDS:
                continue
            if len(raw_tok) > 1 or raw_tok.isdigit():
                tokens.add(raw_tok)
        return frozenset(tokens)

    @classmethod
    def _extract_numeric_markers(cls, normalized_query: str) -> FrozenSet[str]:
        markers: Set[str] = set()
        for tok in normalized_query.split():
            if tok.isdigit():
                markers.add(str(int(tok)))
            elif tok in cls._ORDINAL_NUMBER_MAP:
                markers.add(cls._ORDINAL_NUMBER_MAP[tok])
        return frozenset(markers)

    @classmethod
    def _extract_facility_markers(cls, normalized_query: str) -> FrozenSet[str]:
        tokens = set(normalized_query.split())
        matched = tokens & cls._FACILITY_ENTITIES
        if not matched:
            return frozenset()
        normalized_markers: Set[str] = set()
        for m in matched:
            if m in {"computer", "laboratory", "lab", "comlab"}:
                normalized_markers.add("comlab")
            else:
                normalized_markers.add(m)
        return frozenset(normalized_markers)

    @classmethod
    def analyze(cls, user_message: str) -> AnalyzedQuery:
        """
        Analyzes a user query in <5ms using table-driven strategy rules.
        Never returns a complexity tier/token budget below 420 tokens.
        """
        norm = cls.normalize(user_message)
        if not norm:
            return AnalyzedQuery(
                intent="general_chat",
                topic_tokens=frozenset(),
                normalized_query="",
                is_catalog_question=False,
                min_cache_score=0.85,
                cache_budget_ms=cls.DEFAULT_CACHE_BUDGET_MS,
                complexity_tier="TIER_1",
                recommended_max_tokens=cls.TIER_MAX_TOKENS["TIER_1"],
            )

        word_list = norm.split()
        word_set = set(word_list)
        topic_tokens = cls.extract_topic_tokens(norm)
        is_procedural_book = any(p in norm for p in cls._PROCEDURAL_BOOK_PHRASES)

        matched_rule: Optional[_IntentStrategyRule] = None
        for rule in cls._INTENT_RULES:
            if rule.intent == "book_topic_search" and is_procedural_book:
                continue
            if any(pat.search(norm) for pat in rule.patterns) or bool(rule.keyword_tokens & word_set):
                matched_rule = rule
                break

        # Elevate generic book queries with non-empty topic tokens (e.g., "basic agriculture")
        if matched_rule is not None and matched_rule.intent == "catalog_lookup" and topic_tokens and not is_procedural_book:
            if {"book", "books", "textbook", "textbooks"} & word_set:
                matched_rule = cls._INTENT_RULES[2]  # book_topic_search

        intent = matched_rule.intent if matched_rule else "general_chat"
        is_catalog = matched_rule.is_catalog_question if matched_rule else False
        min_cache_score = matched_rule.min_cache_score if matched_rule else 0.85
        tier = matched_rule.default_tier if matched_rule else "TIER_1"

        # Tier 3 escalation for deep academic reasoning or long analytical prompts
        has_deep_reasoning = any(pat.search(norm) for pat in cls._DEEP_REASONING_CUES)
        if has_deep_reasoning or (len(word_list) > 15 and bool({"how", "what", "research"} & word_set)):
            tier = "TIER_3"
        elif tier == "TIER_1" and (is_catalog or intent in {"book_topic_search", "catalog_lookup", "thesis_search", "facility_availability"}):
            tier = "TIER_2"
        elif tier == "TIER_1" and len(word_list) > 8 and bool({"how", "recommend", "suggest", "list"} & word_set):
            tier = "TIER_2"

        recommended_max_tokens = cls.TIER_MAX_TOKENS.get(tier, 700)

        return AnalyzedQuery(
            intent=intent,
            topic_tokens=topic_tokens,
            normalized_query=norm,
            is_catalog_question=is_catalog,
            min_cache_score=min_cache_score,
            cache_budget_ms=cls.DEFAULT_CACHE_BUDGET_MS,
            complexity_tier=tier,
            recommended_max_tokens=recommended_max_tokens,
        )

    @classmethod
    def is_cache_candidate_accurate(
        cls,
        analyzed: AnalyzedQuery,
        candidate_question: str,
        fuzzy_ratio: float,
    ) -> bool:
        """
        Validates that a fuzzy FAQ cache hit matches not just character similarity
        but also intent, numeric/room/facility identifiers, and topic tokens.
        """
        if not candidate_question or float(fuzzy_ratio) < float(analyzed.min_cache_score):
            return False

        cand = cls.analyze(candidate_question)
        if not cand.normalized_query:
            return False

        # 1. Intent compatibility check
        if analyzed.intent != cand.intent:
            catalog_pair = {analyzed.intent, cand.intent} <= {"book_topic_search", "catalog_lookup"}
            if not catalog_pair:
                return False

        # 2. Numeric / ordinal / room-number conflict check (e.g. Room 1 vs Room 2)
        user_nums = cls._extract_numeric_markers(analyzed.normalized_query)
        cand_nums = cls._extract_numeric_markers(cand.normalized_query)
        if user_nums != cand_nums:
            return False

        # 3. Facility / room entity check (e.g. ComLab vs Tutorium)
        user_facilities = cls._extract_facility_markers(analyzed.normalized_query)
        cand_facilities = cls._extract_facility_markers(cand.normalized_query)
        if (user_facilities or cand_facilities) and user_facilities != cand_facilities:
            return False

        # 4. Topic token overlap check (e.g. "Basic Agriculture" vs "Basic Aquaculture")
        user_topics = set(analyzed.topic_tokens)
        cand_topics = set(cand.topic_tokens)
        if user_topics or cand_topics:
            if not user_topics or not cand_topics:
                return False
            overlap = user_topics & cand_topics
            recall = len(overlap) / len(user_topics)
            precision = len(overlap) / len(cand_topics)

            strict_domain = analyzed.is_catalog_question or analyzed.intent in {
                "book_topic_search",
                "catalog_lookup",
                "thesis_search",
                "facility_availability",
            }
            if strict_domain:
                if recall < 0.85 or precision < 0.65:
                    return False
            else:
                if recall < 0.75 or precision < 0.60:
                    return False

        return True
