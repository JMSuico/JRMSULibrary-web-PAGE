# [Layer: Services/Implementations] — ai_service.py
# Handles high-speed communication with the local Ollama AI instance with multi-tier Redis caching and connection pooling.

import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import json
import logging
import re
import random
import difflib
from typing import Generator, List, Dict, Any, Tuple, Optional
from django.core.cache import cache
from Features.Repositories.Implementations.personnel_repository import PersonnelRepository
from Features.Repositories.Implementations.cms_repository import ManagedLinkRepository
from Features.Repositories.Implementations.batch_repository import BatchRepository
from Features.Repositories.Implementations.book_repository import NewlyAcquiredBookRepository
from Features.Repositories.Implementations.reference_repository import ResearchReferenceRepository
from Features.Repositories.Implementations.ai_faq_repository import AIFaqRepository
from Features.Repositories.Implementations.gallery_repository import LibraryInteriorImageRepository
from Features.Services.Interfaces.i_ai_service import IAIService

logger = logging.getLogger(__name__)

# Cache constants
INSTITUTION_CONTEXT_CACHE_KEY = "rizal_institution_context"
FAQ_DATASET_CACHE_KEY = "rizal_faq_dataset"
L1_QUESTION_CACHE_PREFIX = "rizal_l1_faq:"
CACHE_TTL_LONG = 3600  # 1 hour
CACHE_TTL_L1 = 86400    # 24 hours


class AIService(IAIService):
    def __init__(self):
        # Use OLLAMA_URL env var if available (useful for Docker to reach host), else fallback
        self.ollama_url = os.environ.get('OLLAMA_URL', 'http://127.0.0.1:11434/api/chat')
        self.model_name = 'qwen2.5:0.5b'
        self.personnel_repo = PersonnelRepository()
        self.link_repo = ManagedLinkRepository()
        self.batch_repo = BatchRepository()
        self.book_repo = NewlyAcquiredBookRepository()
        self.reference_repo = ResearchReferenceRepository()
        self.faq_repo = AIFaqRepository()
        self.gallery_repo = LibraryInteriorImageRepository()

        # Persistent HTTP connection pool for Ollama API
        self.session = requests.Session()
        retries = Retry(total=2, backoff_factor=0.2, status_forcelist=[502, 503, 504])
        adapter = HTTPAdapter(pool_connections=10, pool_maxsize=20, max_retries=retries)
        self.session.mount('http://', adapter)
        self.session.mount('https://', adapter)

    def _normalize_question(self, text: str) -> str:
        """Converts to lowercase and removes punctuation for consistent matching"""
        text = str(text).lower()
        return re.sub(r'[^a-z0-9\s]', '', text).strip()

    def _get_cached_answer(self, question: str, seen_answers: Optional[list] = None) -> Tuple[Optional[str], Optional[str]]:
        if seen_answers is None:
            seen_answers = []
            
        norm_q = self._normalize_question(question)
        if not norm_q:
            return None, None

        # 1. Check L1 Exact Normalized Hash in Redis (<1ms)
        l1_key = f"{L1_QUESTION_CACHE_PREFIX}{norm_q}"
        try:
            l1_answers = cache.get(l1_key)
            if l1_answers and isinstance(l1_answers, list):
                unseen = [ans for ans in l1_answers if ans not in seen_answers]
                if unseen:
                    return random.choice(unseen), norm_q
        except Exception as e:
            logger.warning(f"Redis L1 read warning: {e}")

        # 2. Check L2 Fuzzy Semantic Matching
        try:
            faq_entries = cache.get(FAQ_DATASET_CACHE_KEY)
            if faq_entries is None:
                db_entries = list(self.faq_repo.get_all())
                faq_entries = {entry.question: entry.answers for entry in db_entries if entry.answers}
                cache.set(FAQ_DATASET_CACHE_KEY, faq_entries, timeout=CACHE_TTL_LONG)
            
            if not faq_entries:
                return None, None

            matches = difflib.get_close_matches(norm_q, list(faq_entries.keys()), n=1, cutoff=0.85)
            if not matches:
                return None, None

            matched_q = matches[0]
            answers_list = faq_entries.get(matched_q, [])
            if not isinstance(answers_list, list) or not answers_list:
                return None, None

            unseen_indices = [i for i in range(len(answers_list)) if answers_list[i] not in seen_answers]
            if not unseen_indices:
                return None, None

            selected_answer = answers_list[random.choice(unseen_indices)]
            # Also populate L1 for exact subsequent hits with this phrasing
            try:
                cache.set(l1_key, answers_list, timeout=CACHE_TTL_L1)
            except Exception:
                pass
            return selected_answer, matched_q
        except Exception as e:
            logger.error(f"Error reading FAQ cache: {e}")
            return None, None

    def _save_to_cache(self, question: str, answer: str):
        if not answer or len(answer) < 10 or "I'm sorry" in answer or "I'm currently offline" in answer:
            return
            
        try:
            norm_q = self._normalize_question(question)
            if not norm_q:
                return

            # Update DB entry
            existing = self.faq_repo.find_by_question_exact(norm_q)
            if existing:
                self.faq_repo.update_answers(existing, answer.strip())
            else:
                self.faq_repo.create(question=norm_q, answers=[answer.strip()])

            # Invalidate L2 FAQ cache and populate L1
            cache.delete(FAQ_DATASET_CACHE_KEY)
            l1_key = f"{L1_QUESTION_CACHE_PREFIX}{norm_q}"
            cache.set(l1_key, [answer.strip()], timeout=CACHE_TTL_L1)
        except Exception as e:
            logger.error(f"Error saving to FAQ cache: {e}")

    @staticmethod
    def _format_ref(ref) -> str:
        if getattr(ref, 'access_type', None) == 'file' and getattr(ref, 'access_file', None):
            softcopy = "Softcopy PDF File Available (Viewable directly on website)"
        elif getattr(ref, 'access_type', None) == 'link' and getattr(ref, 'access_link', None):
            softcopy = "Softcopy Online Link Available"
        else:
            softcopy = "Physical Copy Only (Room Use inside Library)"
        cat = "Thesis" if "Thesis" in (getattr(ref, 'category', '') or '') else "Student Research"
        return f"'{ref.title}' by {ref.author or 'Unknown'} (Category: {cat}, Call No: {ref.call_number or 'N/A'}, Softcopy: {softcopy})"

    def _get_or_build_institutional_context(self) -> str:
        """Retrieves static institution context from Redis or compiles from DB (1h TTL). Saves 7 SQL queries per message."""
        try:
            cached_context = cache.get(INSTITUTION_CONTEXT_CACHE_KEY)
            if cached_context:
                return cached_context
        except Exception as e:
            logger.warning(f"Redis institutional context read warning: {e}")

        try:
            personnel = self.personnel_repo.get_all()
            personnel_text = ", ".join([f"{p.first_name} {p.last_name} ({p.role})" for p in personnel]) or "None listed"

            links = self.link_repo.get_all_active()
            links_text = ", ".join([f"{l.name}" for l in links]) or "None listed"

            recent_books_raw = self.book_repo.get_recent(5)
            recent_books = [
                f"'{b.title}' by {b.author or 'Unknown'} (Category: {b.category or 'General'}, Accession: {b.accession_number or 'N/A'})"
                for b in recent_books_raw
            ]
            recent_books_text = "; ".join(recent_books) if recent_books else "None listed"

            oldest_books_raw = self.book_repo.get_oldest(5)
            oldest_books = [
                f"'{b.title}' by {b.author or 'Unknown'} (Category: {b.category or 'General'}, Accession: {b.accession_number or 'N/A'})"
                for b in oldest_books_raw
            ]
            oldest_books_text = "; ".join(oldest_books) if oldest_books else "None listed"

            recent_refs_raw = self.reference_repo.get_recent(5)
            recent_theses_text = "; ".join([self._format_ref(r) for r in recent_refs_raw]) if recent_refs_raw else "None listed"

            oldest_refs_raw = self.reference_repo.get_oldest(5)
            oldest_theses_text = "; ".join([self._format_ref(r) for r in oldest_refs_raw]) if oldest_refs_raw else "None listed"

            gallery = self.gallery_repo.get_all_active()
            gallery_text = ", ".join([f"Area: '{img.title}' located at '{img.section_label}'" for img in gallery if img.title or img.section_label]) or "No physical sections mapped"

            compiled = f"""DYNAMIC DATABASE KNOWLEDGE:
- Library Personnel & Developers: {personnel_text}
- Recent E-Resource Links Added: {links_text}
- Newly Acquired Books (Newest): {recent_books_text}
- Newly Acquired Books (Oldest Archive): {oldest_books_text}
- Research & Thesis References (Newest): {recent_theses_text}
- Research & Thesis References (Oldest Archive): {oldest_theses_text}
- Physical Setup & Library Sections Map: {gallery_text}"""

            try:
                cache.set(INSTITUTION_CONTEXT_CACHE_KEY, compiled, timeout=CACHE_TTL_LONG)
            except Exception as e:
                logger.warning(f"Redis institutional context write warning: {e}")

            return compiled
        except Exception as e:
            logger.error(f"Error fetching dynamic context: {e}")
            return "DYNAMIC DATABASE KNOWLEDGE: General library information available."

    def _build_dynamic_system_prompt(self, user_message: str = "") -> str:
        institutional_context = self._get_or_build_institutional_context()

        # Targeted search for user query (RAG)
        targeted_matches = []
        if user_message:
            clean_q = re.sub(r'[^a-zA-Z0-9\s]', '', str(user_message)).strip()
            stop_tokens = {'find', 'me', 'a', 'book', 'the', 'is', 'what', 'who', 'how', 'can', 'i', 'have', 'you', 'there', 'please', 'show'}
            query_tokens = [w for w in clean_q.lower().split() if w not in stop_tokens and len(w) > 2]
            search_term = " ".join(query_tokens)
            if search_term:
                try:
                    matched_refs = self.reference_repo.search(query=search_term)[:3]
                    for r in matched_refs:
                        targeted_matches.append(f"- [Thesis/Research Reference] {self._format_ref(r)}")
                    matched_books = self.book_repo.search(query=search_term, limit=3)
                    for b in matched_books:
                        targeted_matches.append(f"- [Newly Acquired Book] '{b.title}' by {b.author or 'Unknown'} (Category: {b.category or 'General'}, Accession: {b.accession_number or 'N/A'})")
                except Exception as e:
                    logger.warning(f"Targeted search warning: {e}")

        targeted_matches_text = "\n".join(targeted_matches) if targeted_matches else "No specific matches found in direct keyword search."

        return f"""You are Rizal, the AI assistant for the JRMSU (Jose Rizal Memorial State University) Katipunan Campus Library.
Your goal is to help students and visitors with their library-related questions based strictly on the provided context below.

CRITICAL BEHAVIOR RULES:
1. Be polite, professional, concise, and helpful. 
2. Always keep your answers relatively short so they fit in a chat bubble.
3. VERY IMPORTANT: If a user casually greets you (e.g. "Good morning", "Hi", "Hello", "Hey"), DO NOT reply with the exact same repetitive phrase. Always vary your greetings naturally (e.g. "Hello there!", "Good morning, how can I help you?", "Hey! Welcome to the library.", "Greetings!").
4. Do not use markdown formatting (like **bold** or *italics*) because the chat UI displays raw text. Just use plain text with line breaks.
5. If asked a question you don't know the answer to based on the context, politely advise them to use the 'Send an Email' option to contact the human librarian. Do not hallucinate answers.
6. SOFTCOPY & DOCUMENT ACCESS RULES:
   - When asked about research papers, theses, or books, reference their availability and softcopy status accurately from the context below.
   - If a research paper or thesis indicates "Softcopy PDF File Available", inform the user they can read or download the full text online on the website under the 'Collection' -> 'Research & Thesis References' tab by clicking 'View File'.
   - If it indicates "Softcopy Online Link Available", inform the user that a digital link is available on the website.
   - If it indicates "Physical Copy Only", explain that it is available for physical room use inside the library (Special Collections / Archives).
   - If asked for the newest or oldest books or theses, cite the exact titles and authors provided in the dynamic database knowledge below.

LIBRARY CONTEXT & LIVE INFORMATION:
- Operating Hours: Monday to Friday, 7:00 AM to 7:00 PM (Philippine Time). Closed on weekends and regular holidays.
- Location: JRMSU Katipunan Campus, Katipunan, Zamboanga del Norte, Philippines.
- Email: katipunan.library@jrmsu.edu.ph
- Services Available: Book Borrowing, Reading Area, Discussion Rooms, Internet Access, E-Resources (VitalBooks, Scholaar, EBSCO).
- Available Rooms/Spaces for Reservation: Discussion Room 1, Discussion Room 2, Tutorium Room 1, Tutorium Room 2, and Multimedia Room.
- Borrowing Limits: Students can borrow up to 3 books for 3 days. Faculty can borrow up to 5 books for 1 week.
- UOPAC Borrow/Return Guidance: To borrow or return books, students must use the Main Campus UOPAC system. The default login is usually their Student ID. They should search the OPAC catalog, filter for Katipunan Campus, and bring their ID to the circulation desk.

{institutional_context}

SPECIFIC SEARCH RESULTS FOR USER INQUIRY:
{targeted_matches_text}
"""

    def _get_ollama_options(self) -> dict:
        """Fast CPU inference options for Ollama."""
        return {
            "num_ctx": 1024,
            "num_predict": 180,
            "temperature": 0.25,
            "top_k": 20,
            "top_p": 0.85,
            "repeat_penalty": 1.15
        }

    def generate_chat_stream(self, user_message: str, chat_history: Optional[list] = None, seen_answers: Optional[list] = None) -> Generator[str, None, None]:
        """Streams Ollama chunks or yields cached answer token stream immediately without artificial sleep."""
        cached_answer, matched_q = self._get_cached_answer(user_message, seen_answers)
        if cached_answer:
            words = cached_answer.split(' ')
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")
            return

        messages = [{"role": "system", "content": self._build_dynamic_system_prompt(user_message)}]
        if chat_history:
            for msg in chat_history[-6:]:
                role = "assistant" if msg.get('sender') == 'rizal' else "user"
                messages.append({"role": role, "content": msg.get('text', '')})
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "stream": True,
            "keep_alive": -1,
            "options": self._get_ollama_options()
        }

        try:
            response = self.session.post(self.ollama_url, json=payload, stream=True, timeout=60)
            response.raise_for_status()

            full_answer = ""
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    if 'message' in data and 'content' in data['message']:
                        chunk = data['message']['content']
                        full_answer += chunk
                        yield chunk

            if full_answer:
                self._save_to_cache(user_message, full_answer)

        except requests.exceptions.ConnectionError:
            logger.error(f"Failed to connect to Ollama at {self.ollama_url}")
            yield "I'm currently offline because my AI engine (Ollama) is not reachable. Please ask the administrator to verify Ollama status."
        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out.")
            yield "I'm thinking too hard and my response timed out. Please try asking again in a moment."
        except Exception as e:
            logger.error(f"Error communicating with Ollama: {str(e)}")
            yield "I'm sorry, an internal error occurred while processing your request."

    def generate_chat_response(self, user_message: str, chat_history: Optional[list] = None, seen_answers: Optional[list] = None) -> str:
        chunks = list(self.generate_chat_stream(user_message, chat_history, seen_answers))
        return "".join(chunks)

    def generate_email_reply_draft(self, message_data: dict) -> str:
        name = message_data.get('sender_name', 'Student/Patron')
        subject = message_data.get('subject', 'General Inquiry')
        message = message_data.get('message_text', '')

        prompt = (
            f"You are a helpful and polite library staff assistant at Jose Rizal Memorial State University (JRMSU) Katipunan Campus. "
            f"Draft a courteous, concise, and professional email reply to this student/user inquiry.\n\n"
            f"Sender Name: {name}\n"
            f"Subject: {subject}\n"
            f"Inquiry: {message}\n\n"
            f"Guidelines:\n"
            f"- Be professional, warm, and helpful.\n"
            f"- Reference JRMSU Katipunan Campus Library.\n"
            f"- If inquiring about books or borrowing, remind them to bring their validated school ID/library card.\n"
            f"- If inquiring about facilities/rooms, confirm reservation procedures.\n"
            f"- Sign off as: 'JRMSU-Katipunan Campus Library Staff'.\n"
            f"- Do NOT output markdown headers, just the raw email body text starting with 'Dear {name},'."
        )

        try:
            payload = {
                "model": self.model_name,
                "messages": [
                    {"role": "system", "content": "You are a professional university library assistant."},
                    {"role": "user", "content": prompt}
                ],
                "stream": False,
                "keep_alive": -1,
                "options": {
                    "temperature": 0.4,
                    "num_predict": 300
                }
            }
            resp = self.session.post(self.ollama_url, json=payload, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                draft = data.get('message', {}).get('content', '').strip()
                if draft:
                    return draft
        except Exception as e:
            logger.warning(f"Ollama draft reply unavailable: {e}. Using fallback.")

        return f"Dear {name},\n\nThank you for reaching out to JRMSU Katipunan Campus Library regarding \"{subject}\". We have received your inquiry and our library staff will assist you shortly.\n\nWarm regards,\nJRMSU-Katipunan Campus Library Staff"
