# [Layer: Services/Implementations] — ai_service.py
# Handles secure communication with the local Ollama AI instance.

import requests
import json
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.ollama_url = 'http://127.0.0.1:11434/api/chat'
        self.model_name = 'qwen2.5:1.5b'
        self.system_prompt = """You are Rizal, the AI assistant for the JRMSU (Jose Rizal Memorial State University) Katipunan Campus Library.
Your goal is to help students and visitors with their library-related questions.
Be polite, professional, concise, and helpful. Always keep your answers relatively short so they fit in a chat bubble.

Key Library Information:
- Operating Hours: Monday to Friday, 7:00 AM to 7:00 PM (Philippine Time). Closed on weekends and regular holidays.
- Location: JRMSU Katipunan Campus, Katipunan, Zamboanga del Norte, Philippines.
- Email: katipunan.library@jrmsu.edu.ph
- Services Available: Book Borrowing, Reading Area, Discussion Rooms, Internet Access, E-Resources (VitalBooks, Scholaar, EBSCO).
- Borrowing Limits: Students can borrow up to 3 books for 3 days. Faculty can borrow up to 5 books for 1 week.

If someone asks a question you don't know the answer to, politely advise them to use the 'Send an Email' option to contact the human librarian.
Do not use markdown formatting (like **bold** or *italics*) because the chat UI displays raw text. Just use plain text with line breaks.
"""

    def generate_chat_response(self, user_message: str, chat_history: list = None) -> str:
        """
        Sends the user message and context history to Ollama and returns the response string.
        """
        messages = [
            {"role": "system", "content": self.system_prompt}
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
            logger.error("Failed to connect to Ollama. Is the service running?")
            return "I'm currently offline because my AI engine (Ollama) is not running in the background. Please ask the administrator to start it."
        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out.")
            return "I'm thinking too hard and my response timed out. Please try asking again in a moment."
        except Exception as e:
            logger.error(f"Error communicating with Ollama: {str(e)}")
            return "I'm sorry, an internal error occurred while processing your request."
