import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

const Dashboard = ({ addNotification }) => {
  const { startChat } = useChat();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMatches, setLikedMatches] = useState({});
  const prevMatchesRef = React.useRef([]);

  // Move fetchMatches definition above useEffect
  const fetchMatches = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/matches`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      // Detect new matches
      const prevIds = new Set((prevMatchesRef.current || []).map(m => m._id));
      const newMatches = data.filter(m => !prevIds.has(m._id));
      if (newMatches.length > 0 && addNotification?.current?.addNotification) {
        newMatches.forEach(m => {
          const matchId = m._id || m.user?._id || Math.random().toString(36).slice(2);
          const matchName = m.name || m.user?.name || m.userName || 'Someone';
          addNotification.current.addNotification({
            id: `match-${matchId}`,
            type: 'match',
            text: `New match: ${matchName}`,
            link: '/dashboard',
            userName: matchName
          });
        });
      }
      prevMatchesRef.current = data;
      setMatches(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleStartChat = async (matchId) => {
    try {
      await startChat(matchId);
      navigate('/chat');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const AIAssistant = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const sendMessage = async () => {
      if (!input.trim()) return;
      const newMessages = [...messages, { role: 'user', content: input }];
      setMessages(newMessages);
      setInput('');
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages.map(m => m.content) })
        });
        if (!res.ok) throw new Error('AI backend error');
        const data = await res.json();
        setMessages([...newMessages, { role: 'ai', content: data.reply }]);
      } catch (err) {
        setError('AI assistant is currently unavailable. Please try again later.');
        setMessages([...newMessages, { role: 'ai', content: 'Sorry, AI is unavailable.' }]);
      }
      setLoading(false);
    };

    return (
      <>
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2M15 3h-6a2 2 0 00-2 2v3a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
        </button>
        {open && (
          <div className="fixed bottom-24 right-6 w-80 max-w-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-blue-200 dark:border-gray-700 z-50 flex flex-col animate-fadeIn">
            <div className="p-3 border-b font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-between">
              AI Assistant
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-red-500 text-xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 300 }}>
              {messages.length === 0 && <div className="text-gray-400 text-sm">Ask me anything about skills, coding, or learning!</div>}
              {messages.map((m, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 text-sm max-w-[90%] ${m.role === 'user' ? 'bg-blue-100 text-blue-900 self-end ml-auto' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 self-start mr-auto'}`}>{m.content}</div>
              ))}
              {loading && <div className="text-xs text-blue-400">AI is typing... <span className="animate-spin inline-block">⏳</span></div>}
              {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
            </div>
            <form
              className="flex border-t"
              onSubmit={e => { e.preventDefault(); sendMessage(); }}
            >
              <input
                className="flex-1 px-3 py-2 rounded-bl-lg focus:outline-none"
                placeholder="Type your question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-br-lg disabled:opacity-50"
                disabled={loading || !input.trim()}
              >Send</button>
            </form>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #f8fafc 100%)', minHeight: '100vh' }}>
      <AIAssistant />
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Matches</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match.user?.id || match._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400 border border-transparent"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={match.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name || 'User')}&background=random&size=96`}
                  alt={match.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {match.name}
                  </h3>
                  <p className="text-gray-600">{match.email}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Skills to Learn:</h4>
                <div className="flex flex-wrap gap-2">
                  {match.skillsToLearn.map((skill) => (
                    <span
                      key={skill}
                      className="relative group bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                    >
                      {skill}
                      <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-20 whitespace-nowrap shadow-lg">
                        Skill: {skill}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Skills to Teach:</h4>
                <div className="flex flex-wrap gap-2">
                  {match.skillsToTeach.map((skill) => (
                    <span
                      key={skill}
                      className="relative group bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                    >
                      {skill}
                      <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-20 whitespace-nowrap shadow-lg">
                        Skill: {skill}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                {/* Animated Match Score Ring */}
                <div className="flex items-center gap-2">
                  <svg width="44" height="44" viewBox="0 0 44 44" className="block">
                    <circle
                      cx="22" cy="22" r="18"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <circle
                      cx="22" cy="22" r="18"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - (match.matchScore || 0))}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="44" y2="44">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <text
                      x="50%" y="50%" textAnchor="middle" dy="0.35em"
                      className="fill-blue-600 dark:fill-blue-300 font-bold text-sm"
                    >
                      {Math.round((match.matchScore || 0) * 100)}%
                    </text>
                  </svg>
                  <span className="text-xs text-gray-500 hidden sm:inline">Match</span>
                </div>
                {/* Like Button */}
                <button
                  className={`relative ml-2 focus:outline-none group ${likedMatches[match._id] ? 'animate-likePop' : ''}`}
                  aria-label="Like"
                  onClick={() => setLikedMatches(l => ({ ...l, [match._id]: !l[match._id] }))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-7 w-7 transition-all duration-200 ${likedMatches[match._id] ? 'text-pink-500 scale-110' : 'text-gray-400 hover:text-pink-400'}`}
                    fill={likedMatches[match._id] ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStartChat(match.user?.id || match.user?._id)}
                  className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-md shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
                >
                  <span className="z-10 relative">Start Chat</span>
                  {/* Ripple effect */}
                  <span className="absolute inset-0 pointer-events-none" id="ripple"></span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No matches found. Update your profile to find potential skill exchange partners!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 