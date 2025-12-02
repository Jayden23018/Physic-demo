import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Greetings. I am ready to discuss chaotic systems, Hamiltonian mechanics, or the limitations of AI in quantum state spaces." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const responseText = await sendMessageToGemini(history, userMsg.content);

    const aiMsg: ChatMessage = { role: 'model', content: responseText };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="w-80 h-full bg-sci-panel border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 bg-[#0f0f11]">
        <h3 className="font-mono text-sm font-bold text-sci-accent tracking-widest">AI RESEARCH ASSISTANT</h3>
        <div className="text-xs text-gray-500 mt-1">Model: Gemini 2.5 Flash</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] rounded-lg p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-sci-accent/20 text-blue-100 border border-sci-accent/30' 
                : 'bg-gray-800 text-gray-300 border border-gray-700'
            }`}>
              {msg.content}
            </div>
            <span className="text-[10px] text-gray-600 mt-1 font-mono uppercase">{msg.role}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center text-xs text-gray-500 font-mono animate-pulse">
            <span className="w-2 h-2 bg-sci-accent rounded-full mr-2"></span>
            COMPUTING RESPONSE...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-[#0f0f11]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about entropy or qubits..."
            className="w-full bg-black border border-gray-700 rounded p-3 pr-10 text-sm text-white focus:outline-none focus:border-sci-accent transition-colors font-mono"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;