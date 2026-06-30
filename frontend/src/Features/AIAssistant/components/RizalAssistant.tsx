import React, { useState, useRef, useEffect } from 'react';
import { contactApi } from '@/src/Endpoints/contactApi';
import { feedbackApi } from '@/src/Endpoints/feedbackApi';

type ChatFlowState = 'suggestions' | 'email-form' | 'reservation-form' | 'rate-form';

interface ChatMessage {
  sender: 'user' | 'rizal';
  text: string;
}

export const RizalAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoMode, setVideoMode] = useState<'waving' | 'reading'>('waving');

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'rizal', text: 'Hi! I am Rizal. How can I help you today?' }
  ]);
  const [chatFlowState, setChatFlowState] = useState<ChatFlowState>('suggestions');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form state for inline forms
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formRating, setFormRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoSrc = videoMode === 'waving'
    ? '/assets/rizal waiving 2.mp4'
    : '/assets/rizal reading.mp4';

  const rooms = [
    'Discussion Room 1',
    'Discussion Room 2',
    'Tutorium Room 1',
    'Tutorium Room 2',
    'Library Table',
  ];

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatFlowState]);

  const resetFormFields = () => {
    setFormName('');
    setFormEmail('');
    setFormSubject('');
    setFormMessage('');
    setFormRoom('');
    setFormRating(0);
  };

  const handleSuggestionClick = (type: 'email' | 'reservation' | 'rate') => {
    const userTexts: Record<string, string> = {
      email: 'I would like to send an email.',
      reservation: 'I would like to reserve a room or table.',
      rate: 'I would like to rate you.',
    };
    const rizalReplies: Record<string, string> = {
      email: 'Sure! Please fill in the form below to send your email:',
      reservation: 'Great! Please provide your reservation details below. (Admin will message you if the vacancy is not available)',
      rate: 'We appreciate your feedback! Please rate us below:',
    };

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: userTexts[type] },
      { sender: 'rizal', text: rizalReplies[type] }
    ]);
    setChatFlowState(`${type}-form` as ChatFlowState);
    resetFormFields();
  };

  const handleChatTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'rizal', text: 'Thank you for your message! Please choose one of the options below so I can assist you better.' }]);
      setChatFlowState('suggestions');
    }, 800);
  };

  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contactApi.submitContactMessage({
        message_type: 'EMAIL',
        name: formName,
        email: formEmail,
        subject: formSubject,
        message: formMessage
      });
      setChatMessages(prev => [...prev, {
        sender: 'rizal',
        text: 'Your email has been sent successfully to katipunan.library@jrmsu.edu.ph! Is there anything else I can help you with?'
      }]);
      setChatFlowState('suggestions');
      resetFormFields();
    } catch (err: any) {
      console.error(err);
      const isRateLimit = err.message?.toLowerCase().includes('throttle') || err.message?.toLowerCase().includes('too many');
      const errorMessage = isRateLimit ? 'You have sent multiple requests! Please try again later.' : (err.message || 'Sorry, there was an error sending your email. Please try again.');
      setChatMessages(prev => [...prev, { sender: 'rizal', text: errorMessage }]);
      setChatFlowState('suggestions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReservationFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contactApi.submitContactMessage({
        message_type: 'RESERVATION',
        name: formName,
        email: formEmail,
        subject: `Reservation: ${formRoom} - ${formSubject}`,
        message: formMessage
      });
      setChatMessages(prev => [...prev, {
        sender: 'rizal',
        text: 'Your reservation request has been submitted! The admin will contact you if the vacancy is not available. Is there anything else I can help you with?'
      }]);
      setChatFlowState('suggestions');
      resetFormFields();
    } catch (err: any) {
      console.error(err);
      const isRateLimit = err.message?.toLowerCase().includes('throttle') || err.message?.toLowerCase().includes('too many');
      const errorMessage = isRateLimit ? 'You have sent multiple requests! Please try again later.' : (err.message || 'Sorry, there was an error submitting your reservation. Please try again.');
      setChatMessages(prev => [...prev, { sender: 'rizal', text: errorMessage }]);
      setChatFlowState('suggestions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating === 0) {
      alert('Please select a star rating.');
      return;
    }
    setIsSubmitting(true);
    try {
      await feedbackApi.submitFeedback({
        name: formName || 'Anonymous',
        email: formEmail || 'anonymous@user.com',
        category: 'Library Service',
        message: formMessage || `Rated ${formRating} stars`,
        rating: formRating
      });
      setChatMessages(prev => [...prev, {
        sender: 'rizal',
        text: `Thank you for rating us ${formRating} star${formRating > 1 ? 's' : ''}! We really appreciate your feedback. Is there anything else I can help you with?`
      }]);
      setChatFlowState('suggestions');
      resetFormFields();
    } catch (err: any) {
      console.error(err);
      const isRateLimit = err.message?.toLowerCase().includes('throttle') || err.message?.toLowerCase().includes('too many');
      const errorMessage = isRateLimit ? 'You have sent multiple requests! Please try again later.' : (err.message || 'Sorry, there was an error submitting your rating. Please try again.');
      setChatMessages(prev => [...prev, { sender: 'rizal', text: errorMessage }]);
      setChatFlowState('suggestions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setChatMessages(prev => [...prev, { sender: 'rizal', text: 'No problem! Is there anything else I can help you with?' }]);
    setChatFlowState('suggestions');
    resetFormFields();
  };

  // Input style constant
  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  // Render inline form inside chat scroll area
  const renderChatInlineForm = () => {
    if (chatFlowState === 'email-form') {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <form onSubmit={handleEmailFormSubmit} className="space-y-2">
            <input required type="text" placeholder="Name" value={formName} onChange={e => setFormName(e.target.value)} className={inputClass} />
            <input required type="email" placeholder="Email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className={inputClass} />
            <input required type="text" placeholder="Subject" value={formSubject} onChange={e => setFormSubject(e.target.value)} className={inputClass} />
            <textarea required placeholder="Message" rows={3} value={formMessage} onChange={e => setFormMessage(e.target.value)} className={`${inputClass} resize-none`} />
            <div className="flex gap-2">
              <button type="button" onClick={handleCancelForm} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (chatFlowState === 'reservation-form') {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <form onSubmit={handleReservationFormSubmit} className="space-y-2">
            <select required value={formRoom} onChange={e => setFormRoom(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="" disabled>Select Room/Table</option>
              {rooms.map(room => <option key={room} value={room}>{room}</option>)}
            </select>
            <input required type="text" placeholder="Name" value={formName} onChange={e => setFormName(e.target.value)} className={inputClass} />
            <input required type="email" placeholder="Email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className={inputClass} />
            <input required type="text" placeholder="Subject" value={formSubject} onChange={e => setFormSubject(e.target.value)} className={inputClass} />
            <textarea required placeholder="Message" rows={3} value={formMessage} onChange={e => setFormMessage(e.target.value)} className={`${inputClass} resize-none`} />
            <div className="flex gap-2">
              <button type="button" onClick={handleCancelForm} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (chatFlowState === 'rate-form') {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <form onSubmit={handleRateFormSubmit} className="space-y-3">
            <style dangerouslySetInnerHTML={{__html: `
              .chat-rating { display: inline-flex; direction: rtl; gap: 2px; }
              .chat-rating input { display: none; }
              .chat-rating label { cursor: pointer; color: #ccc; transition: color 0.3s; font-size: 32px; line-height: 1; }
              .chat-rating label:before { content: '\\2605'; }
              .chat-rating input:checked ~ label,
              .chat-rating label:hover,
              .chat-rating label:hover ~ label { color: #C9A84C; }
            `}} />
            <div className="flex justify-center">
              <div className="chat-rating">
                {[5, 4, 3, 2, 1].map(star => (
                  <React.Fragment key={`chatstar-${star}`}>
                    <input checked={formRating === star} onChange={() => setFormRating(star)} name="chatRating" id={`chatstar${star}`} type="radio" />
                    <label htmlFor={`chatstar${star}`} />
                  </React.Fragment>
                ))}
              </div>
            </div>
            <textarea placeholder="Any comments? (optional)" rows={2} value={formMessage} onChange={e => setFormMessage(e.target.value)} className={`${inputClass} resize-none`} />
            <div className="flex gap-2">
              <button type="button" onClick={handleCancelForm} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[60]">
      {/* Chat Panel — opens directly as chatbot, no options menu */}
      {isExpanded && (
        <div className="absolute bottom-[115%] right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in flex flex-col max-h-[80vh] sm:max-h-[520px]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] p-4 text-white relative flex items-center shrink-0">
            <div>
              <h3 className="text-lg font-bold">RIZAL</h3>
              <p className="text-xs text-blue-200">Your Friendly Library Assistant</p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 right-3 text-white hover:text-white/70 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Chat messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 relative" style={{ minHeight: '200px' }}>
            
            {/* Watermark — RIZAL intro (visible only when no user messages yet) */}
            {chatMessages.length <= 1 && chatFlowState === 'suggestions' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 px-8">
                <div className="text-center text-gray-200 text-xs leading-relaxed font-medium">
                  <p className="text-sm font-bold text-gray-300 mb-1">Heads up, Ilustrados!</p>
                  <p>Please meet RIZAL, your friendly</p>
                  <p><strong>R</strong> - Reference and</p>
                  <p><strong>I</strong> - Information</p>
                  <p><strong>Z</strong> - Zealous</p>
                  <p><strong>A</strong> - Assistance</p>
                  <p><strong>L</strong> - Librarian.</p>
                  <p className="mt-1">Feel free to connect with him.</p>
                </div>
              </div>
            )}

            {/* Chat messages */}
            <div className="relative z-10">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Inline form (rendered in chat scroll area) */}
              {renderChatInlineForm()}
            </div>

            <div ref={chatEndRef} />
          </div>

          {/* Suggestion chips — pinned ABOVE the text input */}
          {chatFlowState === 'suggestions' && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex flex-col gap-1.5 shrink-0">
              <button onClick={() => handleSuggestionClick('email')} className="w-full text-left bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors cursor-pointer flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-base">mail</span>
                Would you like to send an email?
              </button>
              <button onClick={() => handleSuggestionClick('reservation')} className="w-full text-left bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors cursor-pointer flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-base">meeting_room</span>
                Would you like to reserve a room or table?
              </button>
              <button onClick={() => handleSuggestionClick('rate')} className="w-full text-left bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors cursor-pointer flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-base">star_rate</span>
                Would you like to rate us?
              </button>
            </div>
          )}

          {/* Chat text input — always pinned at bottom */}
          <form onSubmit={handleChatTextSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-700 transition cursor-pointer shrink-0">
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Bubble */}
      <div className="relative float-bubble">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-xl cursor-pointer border-2 border-blue-400 hover:ring-4 hover:ring-blue-400/40 hover:scale-110 transition-all duration-300"
          aria-label="Open RIZAL Assistant"
        >
          <video
            key={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </button>

        {/* Name Badge */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none shadow-sm">
          RIZAL
        </span>
      </div>
    </div>
  );
};
