from Features.Data.Models import AIFaqCache
import difflib

class AIFaqRepository:
    """
    Repository for interacting with the AIFaqCache model.
    """
    
    def get_all(self):
        return AIFaqCache.objects.all()
        
    def find_by_question_exact(self, question_text: str):
        return AIFaqCache.objects.filter(question=question_text).first()
        
    def create(self, question: str, answers: list):
        return AIFaqCache.objects.create(question=question, answers=answers)
        
    def update_answers(self, faq_entry: AIFaqCache, answer: str):
        if answer not in faq_entry.answers:
            faq_entry.answers.append(answer)
            faq_entry.save(update_fields=['answers', 'last_accessed'])
            
    def update_last_accessed(self, faq_entry: AIFaqCache):
        faq_entry.save(update_fields=['last_accessed'])
