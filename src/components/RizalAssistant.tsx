import React, { useState } from 'react';

export const RizalAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoMode, setVideoMode] = useState<'waving' | 'reading'>('waving');
  const [showRoomOptions, setShowRoomOptions] = useState(false);

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

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] p-4 text-white relative">
            <h3 className="text-lg font-bold">RIZAL</h3>
            <p className="text-xs text-blue-200">Your Friendly Library Assistant</p>
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 right-3 text-white hover:text-white/70 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Introduction */}
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

          {/* Video Mode Toggle */}
          <div className="px-4 pb-2">
            <button
              onClick={() => setVideoMode(videoMode === 'waving' ? 'reading' : 'waving')}
              className="text-xs text-blue-600 cursor-pointer underline hover:text-blue-800 transition-colors"
            >
              Change Avatar
            </button>
          </div>

          {/* Option Buttons */}
          <div className="flex flex-col gap-2 p-4 pt-0">
            {/* Chat with Rizal */}
            <button
              onClick={() => alert('Rizal chatbot coming soon!')}
              className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl px-4 py-3 flex items-center gap-3 transition cursor-pointer"
            >
              <span className="material-symbols-outlined">chat</span>
              <span className="font-medium text-sm">Chat with Rizal</span>
            </button>

            {/* Send Email */}
            <button
              onClick={() => { window.location.href = 'mailto:katipunan.library@jrmsu.edu.ph'; }}
              className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl px-4 py-3 flex items-center gap-3 transition cursor-pointer"
            >
              <span className="material-symbols-outlined">mail</span>
              <span className="font-medium text-sm">Send Email</span>
            </button>

            {/* Reserve a Room */}
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

              {/* Room Options Sub-panel */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${showRoomOptions ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
              >
                <div className="flex flex-col gap-1 pl-2">
                  {rooms.map((room) => (
                    <button
                      key={room}
                      onClick={() => alert(`Room reservation for ${room} - Coming soon!`)}
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

      {/* Bubble */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-16 h-16 rounded-full overflow-hidden shadow-xl cursor-pointer border-2 border-blue-400 hover:ring-4 hover:ring-blue-400/40 hover:scale-110 transition-all duration-300"
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
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
          RIZAL
        </span>
      </div>
    </div>
  );
};
