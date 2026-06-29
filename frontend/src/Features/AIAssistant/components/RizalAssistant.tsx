import React, { useState, useRef, useEffect } from 'react';

export const RizalAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoMode, setVideoMode] = useState<'waving' | 'reading'>('waving');
  const [viewMode, setViewMode] = useState<'options' | 'chat' | 'email' | 'reservation'>('options');
  const [showRoomOptions, setShowRoomOptions] = useState(false);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<{sender: 'user' | 'rizal', text: string}[]>([
    { sender: 'rizal', text: 'Hi! I am Rizal. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    if (viewMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, viewMode]);

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

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: chatInput }]);
    setChatInput('');
    // Mock response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'rizal', text: 'Thank you for your message! As an AI assistant, I am currently learning to help you better.' }]);
    }, 1000);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Email sent successfully to katipunan.library@jrmsu.edu.ph!');
    setViewMode('options');
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Reservation request submitted successfully!');
    setViewMode('options');
  };

  // Render Header (Common for all views)
  const renderHeader = () => (
    <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] p-4 text-white relative flex items-center shrink-0">
      {viewMode !== 'options' && (
        <button
          onClick={() => setViewMode('options')}
          className="mr-3 text-white hover:text-white/70 transition-colors"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      )}
      <div>
        <h3 className="text-lg font-bold">RIZAL</h3>
        <p className="text-xs text-blue-200">Your Friendly Library Assistant</p>
      </div>
      <button
        onClick={() => { setIsExpanded(false); setViewMode('options'); }}
        className="absolute top-3 right-3 text-white hover:text-white/70 transition-colors cursor-pointer"
        aria-label="Close"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>
    </div>
  );

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[60]">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-[115%] right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in flex flex-col max-h-[80vh] sm:max-h-[500px]">
          {renderHeader()}

          {/* OPTIONS VIEW */}
          {viewMode === 'options' && (
            <div className="overflow-y-auto">
              <div className="p-4 text-sm text-gray-700 space-y-1">
                <p className="font-semibold">Heads up, Ilustrados!</p>
                <p>Please meet RIZAL, your friendly</p>
                <p className="pl-2">R- Reference and</p>
                <p className="pl-2">I - Information</p>
                <p className="pl-2">Z- Zealous</p>
                <p className="pl-2">A- Assistance</p>
                <p className="pl-2">L - Librarian.</p>
                <p>Feel free to connect with him.</p>
              </div>

              <div className="px-4 pb-2">
                <button
                  onClick={() => setVideoMode(videoMode === 'waving' ? 'reading' : 'waving')}
                  className="text-xs text-blue-600 cursor-pointer underline hover:text-blue-800 transition-colors"
                >
                  Change Avatar
                </button>
              </div>

              <div className="flex flex-col gap-2 p-4 pt-0">
                <button
                  onClick={() => setViewMode('chat')}
                  className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl px-4 py-3 flex items-center gap-3 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined">chat</span>
                  <span className="font-medium text-sm">Chat with Rizal</span>
                </button>

                <button
                  onClick={() => setViewMode('email')}
                  className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl px-4 py-3 flex items-center gap-3 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined">mail</span>
                  <span className="font-medium text-sm">Send Email</span>
                </button>

                <div>
                  <button
                    onClick={() => setShowRoomOptions(!showRoomOptions)}
                    className="w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl px-4 py-3 flex items-center gap-3 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined">meeting_room</span>
                    <span className="font-medium text-sm">Reserve a Room</span>
                    <span
                      className={`material-symbols-outlined ml-auto text-base transition-transform duration-300 ${showRoomOptions ? 'rotate-180' : ''}`}
                    >
                      expand_more
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${showRoomOptions ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="flex flex-col gap-1 pl-2">
                      {rooms.map((room) => (
                        <button
                          key={room}
                          onClick={() => setViewMode('reservation')}
                          className="text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg px-3 py-2 transition cursor-pointer flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base text-blue-400">door_open</span>
                          {room}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAT VIEW */}
          {viewMode === 'chat' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
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

          {/* EMAIL VIEW */}
          {viewMode === 'email' && (
            <div className="overflow-y-auto p-5">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <h4 className="font-bold text-gray-800 text-center mb-2">Message Librarians</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Library Clearance" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
                  <textarea required rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-blue-700 transition shadow-md">
                  Send Email
                </button>
              </form>
            </div>
          )}

          {/* RESERVATION VIEW */}
          {viewMode === 'reservation' && (
            <div className="overflow-y-auto p-5">
              <form onSubmit={handleReservationSubmit} className="space-y-4">
                <h4 className="font-bold text-gray-800 text-center mb-2">Reserve Facility</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Name / Group Name</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Juan Dela Cruz" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Room / Facility</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {rooms.map(room => <option key={room} value={room}>{room}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                    <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                    <input required type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-blue-700 transition shadow-md mt-2">
                  Submit Request
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* Bubble */}
      <div className="relative float-bubble">
        <button
          onClick={() => { setIsExpanded(!isExpanded); setViewMode('options'); }}
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
