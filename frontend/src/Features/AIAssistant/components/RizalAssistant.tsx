import React, { useState, useRef, useEffect } from 'react';
import { Mail, Calendar, Star } from 'lucide-react';
import { contactApi } from '@/src/Endpoints/contactApi';
import { feedbackApi } from '@/src/Endpoints/feedbackApi';
import { aiApi } from '@/src/Endpoints/aiApi';
import { ensureCsrfToken } from '@/src/Libs/apiClient';

type ChatFlowState = 'suggestions' | 'email-form' | 'reservation-form' | 'rate-form' | 'credential-request-form';

interface ChatMessage {
  sender: 'user' | 'rizal';
  text: string;
}

const CACHE_KEY = 'rizal_chat_history';
const CACHE_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

export const RizalAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoMode, setVideoMode] = useState<'waving' | 'reading'>('waving');

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { messages, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
          return messages;
        } else {
          // Expired
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to parse chat cache', e);
    }
    return [{ sender: 'rizal', text: 'Hi! I am RIZAL. How can I help you today?' }];
  });
  const [chatFlowState, setChatFlowState] = useState<ChatFlowState>('suggestions');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save chat to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      messages: chatMessages,
      timestamp: Date.now()
    }));
  }, [chatMessages]);

  // Form state for inline forms
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formRating, setFormRating] = useState(0);
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState('');
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
    setFormFiles([]);
    setFormError('');
  };

  // Listen for custom event from ExternalIframeModal
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      const service = e.detail?.service || 'external libraries';
      setIsExpanded(true);
      setChatMessages(prev => [
        ...prev,
        { sender: 'user', text: `I need access to ${service}.` },
        { sender: 'rizal', text: `I see you need credentials for ${service}. Please provide your name and email below so the admin can send them to you.` }
      ]);
      setFormSubject(`Credential Request for ${service}`);
      setChatFlowState('credential-request-form');
    };

    window.addEventListener('open-rizal-chat', handleOpenChat);
    return () => window.removeEventListener('open-rizal-chat', handleOpenChat);
  }, []);

  const handleSuggestionClick = (type: 'email' | 'reservation' | 'rate' | 'check-replies') => {
    const userTexts: Record<string, string> = {
      email: 'I would like to send an email.',
      reservation: 'I would like to reserve a room or table.',
      rate: 'I would like to rate you.',
      'check-replies': 'I want to check replies from the admin.'
    };
    const rizalReplies: Record<string, string> = {
      email: 'Sure! Please fill in the form below to send your email:',
      reservation: 'Great! Please provide your reservation details below. (Admin will message you if the vacancy is not available)',
      rate: 'We appreciate your feedback! Please rate us below:',
      'check-replies': 'Please enter your email address below to check for replies:',
    };

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: userTexts[type] },
      { sender: 'rizal', text: rizalReplies[type] }
    ]);
    setChatFlowState(`${type}-form` as ChatFlowState);
    resetFormFields();
  };

  const handleChatTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput.trim();
    const currentHistory = chatMessages; // capture current state to send to backend

    // Add user msg + empty rizal msg placeholders
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: userMsg },
      { sender: 'rizal', text: '' }
    ]);

    setChatInput('');
    setIsTyping(true);
    setChatFlowState('suggestions'); // Ensure forms are closed when chatting

    try {
      // Send to backend which streams Ollama chunks
      await aiApi.chatStream(userMsg, currentHistory, (chunk) => {
        setChatMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.sender === 'rizal') {
            lastMsg.text += chunk;
          }
          return newMessages;
        });
      });
    } catch (err) {
      console.error(err);
      setChatMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.sender === 'rizal' && lastMsg.text === '') {
          lastMsg.text = 'Sorry, I am having trouble connecting to my AI brain right now.';
        }
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ensureCsrfToken();
      // const validation = await contactApi.validateEmail(formEmail);
      // TODO(Temporary): Commented out for testing fake emails per user request
      // if (validation.is_disposable || !validation.is_domain_valid) {
      //   throw new Error('Temporary or disposable email addresses are not accepted, or domain is invalid.');
      // }

      await contactApi.submitContactMessage({
        message_type: 'EMAIL',
        name: formName,
        email: formEmail,
        subject: formSubject,
        message: formMessage
      }, formFiles);
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
      await ensureCsrfToken();
      const validation = await contactApi.validateEmail(formEmail);
      // TODO(Temporary): Commented out for testing fake emails per user request
      // if (validation.is_disposable || !validation.is_domain_valid) {
      //   throw new Error('Temporary or disposable email addresses are not accepted, or domain is invalid.');
      // }

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
      await ensureCsrfToken();
      await feedbackApi.submitFeedback({
        name: formName || 'Anonymous',
        email: formEmail || 'anonymous@user.com',
        category: 'Library Service',
        message: formMessage || `Rated ${formRating} stars`,
        rating: formRating
      });
      localStorage.setItem('has_rated_today', new Date().toDateString());
      setChatMessages(prev => [...prev, {
        sender: 'rizal',
        text: `Thank you for rating us ${formRating} star${formRating > 1 ? 's' : ''}! We really appreciate your feedback. Is there anything else I can help you with?`
      }]);
      setChatFlowState('suggestions');
      resetFormFields();
    } catch (err: any) {
      console.error(err);
      const isRateLimit = err.message?.toLowerCase().includes('throttle') || err.message?.toLowerCase().includes('too many') || err.message?.toLowerCase().includes('already submitted');
      if (isRateLimit) {
        localStorage.setItem('has_rated_today', new Date().toDateString());
      }
      const errorMessage = isRateLimit ? 'You have already submitted a rating today! Please try again tomorrow.' : (err.message || 'Sorry, there was an error submitting your rating. Please try again.');
      setChatMessages(prev => [...prev, { sender: 'rizal', text: errorMessage }]);
      setChatFlowState('suggestions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCredentialRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contactApi.submitContactMessage({
        message_type: 'CREDENTIAL_REQUEST',
        name: formName,
        email: formEmail,
        subject: formSubject,
        message: 'I am requesting credentials to access this external library service.'
      });
      setChatMessages(prev => [...prev, {
        sender: 'rizal',
        text: 'Your request has been sent! The admin will review it and reply with the credentials to your email.'
      }]);
      setChatFlowState('suggestions');
      resetFormFields();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'Sorry, there was an error sending your request. Please try again.';
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

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216ZM136,120v40H96a8,8,0,0,0,0,16h40v40a8,8,0,0,0,16,0V176h40a8,8,0,0,0,0-16H152V120a8,8,0,0,0-16,0Z"></path>
                </svg>
                <span>Attach Files (Max 10MB)</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".png,.jpeg,.jpg,.gif,.docx,.xls,.xlsx,.pdf,.ppt,.pptx,.pub"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormError('');
                    const files: File[] = Array.from(e.target.files || []);
                    const allowedExts = ['png', 'jpeg', 'jpg', 'gif', 'docx', 'xls', 'xlsx', 'pdf', 'ppt', 'pptx', 'pub'];

                    const errors: string[] = [];
                    const validFiles = files.filter((f: File) => {
                      const ext = f.name.includes('.') ? (f.name.split('.').pop() || '').toLowerCase() : '';
                      if (!ext || !allowedExts.includes(ext)) {
                        errors.push(`Invalid type: ${f.name}`);
                        return false;
                      }
                      if (f.size > 10 * 1024 * 1024) {
                        errors.push(`File too large (>10MB): ${f.name}`);
                        return false;
                      }
                      return true;
                    });

                    // Check total size of all attached files
                    const totalSize = [...formFiles, ...validFiles].reduce((acc, curr) => acc + curr.size, 0);
                    if (totalSize > 10 * 1024 * 1024) {
                      errors.push(`Total attachment size cannot exceed 10MB.`);
                      // Don't add new files if they push us over the limit
                      validFiles.length = 0;
                    }

                    if (errors.length > 0) {
                      setFormError(errors.join(' | '));
                    }

                    if (validFiles.length > 0) {
                      setFormFiles(prev => [...prev, ...validFiles]);
                    }

                    // Reset input so same file can be selected again if removed
                    e.target.value = '';
                  }}
                />
              </label>
              {formError && (
                <div className="text-xs text-red-500 font-medium px-1 bg-red-50 p-2 rounded border border-red-100">
                  {formError}
                </div>
              )}
              {formFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {formFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs border border-blue-100">
                      <span className="truncate max-w-[120px]">{f.name}</span>
                      <button type="button" onClick={() => setFormFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-blue-400 hover:text-blue-700 cursor-pointer p-0.5 rounded-full hover:bg-blue-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

    if (chatFlowState === 'credential-request-form') {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <form onSubmit={handleCredentialRequestSubmit} className="space-y-2">
            <input required type="text" placeholder="Your Name" value={formName} onChange={e => setFormName(e.target.value)} className={inputClass} />
            <input required type="email" placeholder="Your Email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className={inputClass} />
            <div className="flex gap-2">
              <button type="button" onClick={handleCancelForm} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                {isSubmitting ? 'Sending...' : 'Request Credentials'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9999]">
      {/* Chat Panel — opens directly as chatbot, no options menu */}
      {isExpanded && (
        <>
          {isFullscreen && (
            <div
              className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm animate-modal-overlay"
              onClick={() => setIsFullscreen(false)}
            />
          )}
          <div className={`${isFullscreen
              ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[95vw] sm:w-[90vw] max-w-[800px] h-[90vh] sm:h-[85vh] max-h-[900px]'
              : 'absolute bottom-[115%] right-0 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-[360px] max-h-[80vh] sm:max-h-[520px]'
            } bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-modal-card flex flex-col transition-all duration-300`}>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-600 p-4 text-white relative flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold">RIZAL</h3>
                <p className="text-xs text-blue-200">Your Friendly Library Assistant</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 text-white hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title={isFullscreen ? "Minimize" : "Expand"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isFullscreen ? 'close_fullscreen' : 'open_in_full'}
                  </span>
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 text-white hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Chat messages scroll area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 bg-gray-50 relative" style={{ minHeight: '200px' }}>

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
              <div className="relative z-10 flex flex-col gap-3">
                {chatMessages.map((msg, idx) => {
                  // Don't render empty AI message placeholders
                  if (msg.sender === 'rizal' && msg.text === '') return null;

                  return (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-gold-light text-navy-dark rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'} whitespace-pre-wrap`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isTyping && chatMessages[chatMessages.length - 1]?.text === '' && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="max-w-[85%] p-3 rounded-2xl text-sm shadow-sm bg-white border border-gray-100 rounded-bl-none flex gap-1 items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}



                {/* Inline form (rendered in chat scroll area) */}
                {renderChatInlineForm()}
              </div>

              <div ref={chatEndRef} />
            </div>

            {/* AI Chat Input Box */}
            <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-3">
              {chatFlowState === 'suggestions' && !isTyping && (
                <div className="grid grid-cols-2 gap-2 animate-fade-in">
                  <button onClick={() => handleSuggestionClick('email')} className="flex items-center justify-center gap-2 bg-white text-navy-mid hover:bg-gold-light/20 border border-navy-mid/20 rounded-xl px-3 py-2 text-xs font-semibold transition-colors shadow-sm">
                    <Mail size={14} /> Send an Email
                  </button>
                  <button onClick={() => handleSuggestionClick('reservation')} className="flex items-center justify-center gap-2 bg-white text-navy-mid hover:bg-gold-light/20 border border-navy-mid/20 rounded-xl px-3 py-2 text-xs font-semibold transition-colors shadow-sm">
                    <Calendar size={14} /> Reserve a Room
                  </button>
                  {localStorage.getItem('has_rated_today') !== new Date().toDateString() && (
                    <button onClick={() => handleSuggestionClick('rate')} className="col-span-2 flex items-center justify-center gap-2 bg-white text-navy-mid hover:bg-gold-light/20 border border-navy-mid/20 rounded-xl px-3 py-2 text-xs font-semibold transition-colors shadow-sm">
                      <Star size={14} /> Rate Us
                    </button>
                  )}
                </div>
              )}
              <form onSubmit={handleChatTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-navy-mid/30 focus:ring-1 focus:ring-navy-mid/30 transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="w-9 h-9 rounded-full bg-navy-mid text-white flex items-center justify-center hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:hover:bg-navy-mid shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px] ml-1">send</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* AI Assistant Bubble */}
      <div className="relative float-bubble bubble-3d-container w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-blue-400 bg-white shadow-xl flex items-center justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bubble-3d-btn w-full h-full rounded-full overflow-hidden cursor-pointer flex items-center justify-center"
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
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none shadow-sm z-10 whitespace-nowrap">
          RIZAL
        </span>
      </div>
    </div>
  );
};
