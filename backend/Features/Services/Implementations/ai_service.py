# [Layer: Services/Implementations] — ai_service.py
# Handles secure communication with the local Ollama AI instance.

import os
import requests
import json
import logging
import re
import random
import difflib
from django.core.cache import cache
from django.conf import settings
from pathlib import Path
from Features.Repositories.Implementations.personnel_repository import PersonnelRepository
from Features.Repositories.Implementations.cms_repository import ManagedLinkRepository
from Features.Repositories.Implementations.batch_repository import BatchRepository
from Features.Repositories.Implementations.ai_faq_repository import AIFaqRepository
from Features.Repositories.Implementations.gallery_repository import LibraryInteriorImageRepository

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Use OLLAMA_URL env var if available (useful for Docker to reach host), else fallback
        self.ollama_url = os.environ.get('OLLAMA_URL', 'http://127.0.0.1:11434/api/chat')
        self.model_name = 'qwen2.5:0.5b'
        self.personnel_repo = PersonnelRepository()
        self.link_repo = ManagedLinkRepository()
        self.batch_repo = BatchRepository()
        self.faq_repo = AIFaqRepository()
        self.gallery_repo = LibraryInteriorImageRepository()
    def _normalize_question(self, text: str) -> str:
        """Converts to lowercase and removes punctuation for consistent matching"""
        text = str(text).lower()
        return re.sub(r'[^a-z0-9\s]', '', text).strip()

    def _get_cached_answer(self, question: str, seen_answers: list = None):
        if seen_answers is None:
            seen_answers = []
            
        try:
            norm_q = self._normalize_question(question)
            
            # 1. Fuzzy Semantic Matching against DB
            # Fetch all questions to match semantically
            # Note: For massive scale, pg_trgm could be used via raw SQL, but here we keep difflib 
            # and limit it to the top N entries, or simply load them. 
            faq_entries = self.faq_repo.get_all()
            known_questions = {entry.question: entry for entry in faq_entries}
            
            matches = difflib.get_close_matches(norm_q, list(known_questions.keys()), n=1, cutoff=0.85)
            
            if not matches:
                return None, None
                
            matched_q = matches[0]
            entry = known_questions[matched_q]
            answers_list = entry.answers
            
            if not isinstance(answers_list, list) or not answers_list:
                return None, None
                
            # 2. STATELESS TRACKING
            # We rely on the frontend passing the specific answers it has already seen for this question.
            unseen_indices = [i for i in range(len(answers_list)) if answers_list[i] not in seen_answers]
            
            if not unseen_indices:
                # User has seen all variations! Return None to force AI to generate a new one.
                return None, None
                
            # 3. ROUND-ROBIN RANDOM SELECTION
            selected_idx = random.choice(unseen_indices)
            selected_answer = answers_list[selected_idx]
            
            # Update last accessed for LRU or analytics
            self.faq_repo.update_last_accessed(entry)
            
            return selected_answer, matched_q
        except Exception as e:
            logger.error(f"Error reading FAQ cache: {e}")
            return None, None

    def _save_to_cache(self, question: str, answer: str):
        # Don't cache very short or error-like responses
        if not answer or len(answer) < 10 or "I'm sorry" in answer or "I'm currently offline" in answer:
            return
            
        try:
            norm_q = self._normalize_question(question)
            
            faq_entries = self.faq_repo.get_all()
            known_questions = {entry.question: entry for entry in faq_entries}
            
            matches = difflib.get_close_matches(norm_q, list(known_questions.keys()), n=1, cutoff=0.85)
            
            if matches:
                entry = known_questions[matches[0]]
                self.faq_repo.update_answers(entry, answer.strip())
            else:
                self.faq_repo.create(question=norm_q, answers=[answer.strip()])
                
        except Exception as e:
            logger.error(f"Error saving to FAQ cache: {e}")
        
    def _build_dynamic_system_prompt(self):
        # Fetch dynamic live data from database
        try:
            personnel = self.personnel_repo.get_all()
            personnel_text = ", ".join([f"{p.first_name} {p.last_name} ({p.role})" for p in personnel]) or "None listed"
            
            links = self.link_repo.get_all_active()
            links_text = ", ".join([f"{l.name}" for l in links]) or "None listed"
            
            batches = self.batch_repo.get_all_batches()
            recent_books = []
            if batches:
                latest = batches[0]  # list — no .first(), just index 0
                for b in latest.books.all()[:10]: # Increased to top 10 recent books
                    acc = b.accession_number if b.accession_number else "N/A"
                    cat = b.category if b.category else "Uncategorized"
                    recent_books.append(f"'{b.title}' by {b.author} (Category: {cat}, Accession: {acc})")
            books_text = "; ".join(recent_books) if recent_books else "No recent books"
            
            gallery = self.gallery_repo.get_all_active()
            gallery_text = ", ".join([f"Area: '{img.title}' located at '{img.section_label}'" for img in gallery if img.title or img.section_label]) or "No physical sections mapped"
            
        except Exception as e:
            logger.error(f"Error fetching dynamic context: {e}")
            personnel_text = "Error fetching personnel"
            links_text = "Error fetching links"
            books_text = "Error fetching books"
            gallery_text = "Error fetching gallery"

        return f"""You are Rizal, the AI assistant for the JRMSU (Jose Rizal Memorial State University) Katipunan Campus Library.
Your goal is to help students and visitors with their library-related questions based strictly on the provided context below.

CRITICAL BEHAVIOR RULES:
1. Be polite, professional, concise, and helpful. 
2. Always keep your answers relatively short so they fit in a chat bubble.
3. VERY IMPORTANT: If a user casually greets you (e.g. "Good morning", "Hi", "Hello", "Hey"), DO NOT reply with the exact same repetitive phrase. Always vary your greetings naturally (e.g. "Hello there!", "Good morning, how can I help you?", "Hey! Welcome to the library.", "Greetings!").
4. Do not use markdown formatting (like **bold** or *italics*) because the chat UI displays raw text. Just use plain text with line breaks.
5. If asked a question you don't know the answer to based on the context, politely advise them to use the 'Send an Email' option to contact the human librarian. Do not hallucinate answers.

LIBRARY CONTEXT & LIVE INFORMATION:
- Operating Hours: Monday to Friday, 7:00 AM to 7:00 PM (Philippine Time). Closed on weekends and regular holidays.
- Location: JRMSU Katipunan Campus, Katipunan, Zamboanga del Norte, Philippines.
- Email: katipunan.library@jrmsu.edu.ph
- Services Available: Book Borrowing, Reading Area, Discussion Rooms, Internet Access, E-Resources (VitalBooks, Scholaar, EBSCO).
- Borrowing Limits: Students can borrow up to 3 books for 3 days. Faculty can borrow up to 5 books for 1 week.
- UOPAC Borrow/Return Guidance: To borrow or return books, students must use the Main Campus UOPAC system. The default login is usually their Student ID. They should search the OPAC catalog, filter for Katipunan Campus, and bring their ID to the circulation desk.

DYNAMIC DATABASE KNOWLEDGE:
- Library Personnel & Developers: {personnel_text}
- Recent E-Resource Links Added: {links_text}
- Recently Added Books: {books_text}
- Physical Setup & Library Sections Map: {gallery_text}
"""

    def generate_chat_response(self, user_message: str, chat_history: list = None, seen_answers: list = None) -> str:
        """
        Sends the user message and dynamic context history to Ollama and returns the response string.
        """
        # --- DYNAMIC AI CACHING FILTER ---
        cached_answer, matched_q = self._get_cached_answer(user_message, seen_answers)
        if cached_answer:
            return cached_answer
        # ---------------------------------
        
        messages = [
            {"role": "system", "content": self._build_dynamic_system_prompt()}
        ]
        
        # Append up to the last 6 messages for context
        if chat_history:
            for msg in chat_history[-6:]:
                role = "assistant" if msg.get('sender') == 'rizal' else "user"
                messages.append({"role": role, "content": msg.get('text', '')})
                
        # Append current message
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "stream": False
        }

        try:
            # Increased timeout to 120s because local AI models on CPU can take a long time to think and stream the response
            response = requests.post(self.ollama_url, json=payload, timeout=120)
            response.raise_for_status()
            data = response.json()
            
            if 'message' in data and 'content' in data['message']:
                answer = data['message']['content'].strip()
                # Save the new AI answer to the cache!
                self._save_to_cache(user_message, answer)
                return answer
            return "I'm sorry, I received an invalid response from my AI engine."
            
        except requests.exceptions.ConnectionError:
            logger.error(f"Failed to connect to Ollama at {self.ollama_url}")
            return "I'm currently offline because my AI engine (Ollama) is not reachable. Please ask the administrator to start it and set OLLAMA_HOST=0.0.0.0."
        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out.")
            return "I'm thinking too hard and my response timed out. Please try asking again in a moment."
        except Exception as e:
            logger.error(f"Error communicating with Ollama: {str(e)}")
            return "I'm sorry, an internal error occurred while processing your request."

    def generate_chat_stream(self, user_message: str, chat_history: list = None, seen_answers: list = None):
        """
        Sends the user message and dynamic context history to Ollama and yields the response as a stream.
        """
        # --- DYNAMIC AI CACHING FILTER ---
        cached_answer, matched_q = self._get_cached_answer(user_message, seen_answers)
        if cached_answer:
            # Yield word by word to simulate AI typing speed
            import time
            for word in cached_answer.split(' '):
                yield word + " "
                time.sleep(0.01)
            return
        # ---------------------------------
        
        messages = [{"role": "system", "content": self._build_dynamic_system_prompt()}]
        
        if chat_history:
            for msg in chat_history[-6:]:
                role = "assistant" if msg.get('sender') == 'rizal' else "user"
                messages.append({"role": role, "content": msg.get('text', '')})
                
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "stream": True
        }

        try:
            response = requests.post(self.ollama_url, json=payload, stream=True, timeout=120)
            response.raise_for_status()
            
            full_answer = ""
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    if 'message' in data and 'content' in data['message']:
                        chunk = data['message']['content']
                        full_answer += chunk
                        yield chunk
            
            # Save the full answer to cache after stream finishes
            if full_answer:
                self._save_to_cache(user_message, full_answer)
                        
        except requests.exceptions.ConnectionError:
            logger.error(f"Failed to connect to Ollama at {self.ollama_url}")
            yield "I'm currently offline because my AI engine (Ollama) is not reachable. Please ask the administrator to start it and set OLLAMA_HOST=0.0.0.0."
        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out.")
            yield "I'm thinking too hard and my response timed out. Please try asking again in a moment."
        except Exception as e:
            logger.error(f"Error communicating with Ollama: {str(e)}")
            yield "I'm sorry, an internal error occurred while processing your request."
