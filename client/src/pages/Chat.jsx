import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chat.service';
import toast from 'react-hot-toast';
import { HiOutlinePaperAirplane } from 'react-icons/hi';

const suggestions = [
  'How many calories should I eat daily?',
  'Best exercises for muscle gain?',
  'How to improve my flexibility?',
  'Create a quick morning routine',
];

function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split into lines
  const lines = content.split('\n');
  const elements = [];
  
  let currentList = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = (key) => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-6 mb-3 space-y-1">
            {currentList}
          </ul>
        );
      } else if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-6 mb-3 space-y-1">
            {currentList}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  const renderInlineStyles = (txt) => {
    // Basic bold parser: **text** -> <strong>text</strong>
    const parts = txt.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-primary dark:text-primary-light">{part}</strong>;
      }
      // Parse simple inline code `code` -> <code>code</code>
      const codeParts = part.split('`');
      if (codeParts.length > 1) {
        return codeParts.map((cp, ci) => {
          if (ci % 2 === 1) {
            return <code key={`c-${ci}`} className="bg-dark-surface border border-dark-border px-1.5 py-0.5 rounded text-xs text-accent font-mono">{cp}</code>;
          }
          return cp;
        });
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for headers
    if (trimmed.startsWith('# ')) {
      flushList(idx);
      elements.push(
        <h1 key={idx} className="text-xl font-bold mt-4 mb-2 text-primary-light">
          {renderInlineStyles(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(idx);
      elements.push(
        <h2 key={idx} className="text-lg font-bold mt-3 mb-2 text-primary-light">
          {renderInlineStyles(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList(idx);
      elements.push(
        <h3 key={idx} className="text-base font-semibold mt-3 mb-1.5">
          {renderInlineStyles(trimmed.slice(4))}
        </h3>
      );
    }
    // Check for unordered list items starting with '* ' or '- '
    else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (listType !== 'ul') {
        flushList(idx);
        listType = 'ul';
      }
      currentList.push(
        <li key={idx} className="leading-relaxed">
          {renderInlineStyles(trimmed.slice(2))}
        </li>
      );
    }
    // Check for ordered list items starting with digit(s) followed by dot
    else if (/^\d+\.\s+/.test(trimmed)) {
      if (listType !== 'ol') {
        flushList(idx);
        listType = 'ol';
      }
      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
      currentList.push(
        <li key={idx} className="leading-relaxed">
          {renderInlineStyles(match[2])}
        </li>
      );
    }
    // Empty line
    else if (!trimmed) {
      flushList(idx);
    }
    // Regular text paragraph
    else {
      flushList(idx);
      elements.push(
        <p key={idx} className="mb-2 leading-relaxed">
          {renderInlineStyles(line)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <div className="markdown-content">{elements}</div>;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! 👋 I'm FlexOra, your AI fitness coach. Ask me anything about workouts, nutrition, or fitness goals!", timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    document.title = 'AI Coach Chat | FlexOra — AI Fitness Coach';
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.role !== 'system')
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));

      const { data } = await chatService.sendMessage(msg, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }]);
    } catch (err) {
      toast.error('Failed to get response');
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Please try again!", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-100px)] animate-fadeIn">
      <div className="mb-4">
        <h1 className="text-2xl font-bold gradient-text">AI Fitness Coach</h1>
        <p className="text-text-muted text-sm mt-1">Your personal fitness assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fadeIn`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
              msg.role === 'user' ? 'gradient-accent' : 'gradient-primary'
            }`}>
              {msg.role === 'user' ? user?.name?.charAt(0)?.toUpperCase() || 'U' : 'F'}
            </div>
            {/* Bubble */}
            <div className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-2xl rounded-br-md'
                : 'bg-dark-card border border-dark-border text-text-primary rounded-2xl rounded-bl-md'
            }`}>
              <MarkdownRenderer content={msg.content} />
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/50' : 'text-text-muted'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white shrink-0">F</div>
            <div className="bg-dark-card border border-dark-border rounded-2xl rounded-bl-md px-5 py-4 flex gap-1.5">
              <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Suggestions (show when only welcome message exists) */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 ml-11">
            {suggestions.map((s) => (
              <button key={s} onClick={() => sendMessage(s)} className="px-4 py-2 text-xs font-medium rounded-full bg-dark-surface border border-dark-border text-text-secondary hover:border-primary/50 hover:text-primary transition-all duration-200">
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass-card p-3 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask me anything about fitness..."
          className="input-field flex-1 border-0 bg-transparent focus:shadow-none"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
        </button>
      </div>
    </div>
  );
}
