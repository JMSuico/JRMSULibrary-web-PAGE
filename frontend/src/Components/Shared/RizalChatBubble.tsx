import React, { useState } from 'react';
import { contactApi } from '@/src/Endpoints/contactApi';
import { feedbackApi } from '@/src/Endpoints/feedbackApi';
import { StarRating } from './StarRating';
import { X, Send, MessageCircle } from 'lucide-react';

type ChatState = 'idle' | 'email' | 'reservation' | 'rating' | 'success';

export const RizalChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState(''); // for feedback/reservation
  const [rating, setRating] = useState(5);

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setCategory('');
    setRating(5);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setChatState('idle');
      resetForm();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (chatState === 'email') {
        await contactApi.submitContactMessage({
          message_type: 'EMAIL',
          name,
          email,
          subject,
          message
        });
      } else if (chatState === 'reservation') {
        await contactApi.submitContactMessage({
          message_type: 'RESERVATION',
          name,
          email,
          subject: `Reservation: ${category} - ${subject}`,
          message
        });
      } else if (chatState === 'rating') {
        await feedbackApi.submitFeedback({
          name,
          email,
          category,
          message,
          rating
        });
      }
      setChatState('success');
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-[#002B7F] shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 hover:shadow-xl transition-all duration-300"
        aria-label="Open Chat with Rizal"
      >
        <MessageCircle size={28} className="text-white" />
      </button>

      {/* Chat Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] pointer-events-none flex items-end justify-end p-6">
          {/* Chat Window */}
          <div 
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[380px] flex flex-col pointer-events-auto transform transition-all"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="bg-[#002B7F] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#002B7F] font-bold text-xl">
                  R
                </div>
                <div>
                  <h3 className="font-bold leading-tight">Rizal Assistant</h3>
                  <p className="text-xs text-blue-200">Online</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
              
              {/* Initial Greeting */}
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-[#002B7F] shrink-0 flex items-center justify-center text-white font-bold text-sm">
                  R
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 border border-gray-100">
                  <p>Hi! I'm Rizal, your virtual library assistant. How can I help you today?</p>
                </div>
              </div>

              {/* Suggestions (Idle state) */}
              {chatState === 'idle' && (
                <div className="flex flex-col gap-2 items-end ml-10 mt-2">
                  <button 
                    onClick={() => setChatState('email')}
                    className="bg-[#002B7F] text-white text-sm px-4 py-2 rounded-2xl rounded-tr-none hover:bg-[#001655] transition-colors"
                  >
                    Would you like to send an email?
                  </button>
                  <button 
                    onClick={() => setChatState('reservation')}
                    className="bg-[#002B7F] text-white text-sm px-4 py-2 rounded-2xl rounded-tr-none hover:bg-[#001655] transition-colors"
                  >
                    Would you like to reserve a room or table?
                  </button>
                  <button 
                    onClick={() => setChatState('rating')}
                    className="bg-[#002B7F] text-white text-sm px-4 py-2 rounded-2xl rounded-tr-none hover:bg-[#001655] transition-colors"
                  >
                    Would you like to rate us?
                  </button>
                  
                  {/* Option to go to Facebook page */}
                  <a 
                    href="https://www.facebook.com/JRMSUkatipunanlibrary"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#1877F2] text-white text-sm px-4 py-2 rounded-2xl rounded-tr-none hover:bg-[#166fe5] transition-colors flex items-center gap-2"
                  >
                    Visit our Facebook Page
                  </a>
                </div>
              )}

              {/* Form Renderers */}
              {(chatState === 'email' || chatState === 'reservation' || chatState === 'rating') && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#002B7F] shrink-0 flex items-center justify-center text-white font-bold text-sm">
                    R
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 border border-gray-100 flex-1">
                    <p className="mb-3 font-medium">
                      {chatState === 'email' && "Please fill out the form below to send us an email:"}
                      {chatState === 'reservation' && "Please provide details for your reservation. (Admin will contact you if the vacancy is not available):"}
                      {chatState === 'rating' && "We appreciate your feedback! Please rate us:"}
                    </p>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                      
                      {chatState === 'rating' && (
                        <div className="flex justify-center mb-2">
                          <StarRating value={rating} onChange={setRating} />
                        </div>
                      )}

                      {chatState === 'reservation' && (
                        <select 
                          required
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#002B7F] focus:ring-1 focus:ring-[#002B7F] outline-none"
                        >
                          <option value="" disabled>Select Room/Table</option>
                          <option value="Discussion Room 1">Discussion Room 1</option>
                          <option value="Discussion Room 2">Discussion Room 2</option>
                          <option value="Tutorium Room 1">Tutorium Room 1</option>
                          <option value="Tutorium Room 2">Tutorium Room 2</option>
                          <option value="Library Table">Library Table</option>
                        </select>
                      )}

                      {chatState === 'rating' && (
                        <select 
                          required
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#002B7F] outline-none"
                        >
                          <option value="" disabled>Category</option>
                          <option value="Service">Service</option>
                          <option value="Facility">Facility</option>
                          <option value="Resources">Resources</option>
                          <option value="Other">Other</option>
                        </select>
                      )}

                      <input 
                        type="text" required placeholder="Name"
                        value={name} onChange={e => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#002B7F] outline-none"
                      />
                      <input 
                        type="email" required placeholder="Email"
                        value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#002B7F] outline-none"
                      />
                      {(chatState === 'email' || chatState === 'reservation') && (
                        <input 
                          type="text" required placeholder="Subject"
                          value={subject} onChange={e => setSubject(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#002B7F] outline-none"
                        />
                      )}
                      <textarea 
                        required placeholder="Message" rows={3}
                        value={message} onChange={e => setMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#002B7F] outline-none resize-none"
                      />

                      <div className="flex gap-2 mt-2">
                        <button 
                          type="button" 
                          onClick={() => { setChatState('idle'); resetForm(); }}
                          className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={loading}
                          className="flex-1 py-2 rounded-lg bg-[#002B7F] text-white font-medium hover:bg-[#001655] transition-colors flex items-center justify-center gap-2"
                        >
                          {loading ? 'Sending...' : (
                            <>
                              Submit <Send size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Success State */}
              {chatState === 'success' && (
                 <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#002B7F] shrink-0 flex items-center justify-center text-white font-bold text-sm">
                    R
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 border border-gray-100">
                    <p className="font-medium text-green-600 mb-1">Message Sent Successfully!</p>
                    <p>Thank you for reaching out to us. We will get back to you shortly.</p>
                    <button 
                      onClick={() => setChatState('idle')}
                      className="mt-3 text-[#002B7F] font-medium hover:underline"
                    >
                      Return to menu
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};
