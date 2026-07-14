# [Layer: Services/Implementations] — ai_service.py
# Handles secure communication with the local Ollama AI instance.

import os
import requests
import json
import logging
from Features.Repositories.Implementations.personnel_repository import PersonnelRepository
from Features.Repositories.Implementations.cms_repository import ManagedLinkRepository
from Features.Repositories.Implementations.batch_repository import BatchRepository

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Use OLLAMA_URL env var if available (useful for Docker to reach host), else fallback
        self.ollama_url = os.environ.get('OLLAMA_URL', 'http://127.0.0.1:11434/api/chat')
        self.model_name = 'qwen2.5:1.5b'
        self.personnel_repo = PersonnelRepository()
        self.link_repo = ManagedLinkRepository()
        self.batch_repo = BatchRepository()
        
    def _build_dynamic_system_prompt(self):
        # Fetch dynamic live data from database
        try:
            personnel = self.personnel_repo.get_all()
            personnel_text = ", ".join([f"{p.first_name} {p.last_name} ({p.role})" for p in personnel]) or "None listed"
            
            links = self.link_repo.get_all_active()
            links_text = ", ".join([f"{l.title}" for l in links]) or "None listed"
            
            batches = self.batch_repo.get_all_batches()
            recent_books = []
            if batches:
                latest = batches[0]  # list — no .first(), just index 0
                for b in latest.books.all()[:5]:
                    recent_books.append(f"{b.title} by {b.author}")
            books_text = "; ".join(recent_books) if recent_books else "No recent books"
            
        except Exception as e:
            logger.error(f"Error fetching dynamic context: {e}")
            personnel_text = "Error fetching personnel"
            links_text = "Error fetching links"
            books_text = "Error fetching books"

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

DYNAMIC DATABASE KNOWLEDGE:
- Library Personnel & Developers: {personnel_text}
- Recent E-Resource Links Added: {links_text}
- Recently Added Books: {books_text}
"""

    def generate_chat_response(self, user_message: str, chat_history: list = None) -> str:
        """
        Sends the user message and dynamic context history to Ollama and returns the response string.
        """
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
            response = requests.post(self.ollama_url, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if 'message' in data and 'content' in data['message']:
                return data['message']['content'].strip()
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
