import React, { useState } from 'react';
import ControlPanel from './ControlPanel';
import ChatInterface from './Chatinterface';
import { SimulationParams } from '../types';

interface RightPanelProps {
  params: SimulationParams;
  onChange: (next: SimulationParams) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ params, onChange }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'params'>('params');

  return (
    <aside className="w-96 h-full bg-sci-panel border-l border-gray-800 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-[#0f0f11]">
        <button
          className={`flex-1 px-4 py-3 text-xs font-mono tracking-widest transition-colors ${
            activeTab === 'chat'
              ? 'text-sci-accent border-b-2 border-sci-accent bg-white/5'
              : 'text-gray-500 hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          AI CHAT
        </button>
        <button
          className={`flex-1 px-4 py-3 text-xs font-mono tracking-widest transition-colors ${
            activeTab === 'params'
              ? 'text-sci-accent border-b-2 border-sci-accent bg-white/5'
              : 'text-gray-500 hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('params')}
        >
          SYSTEM PARAMETERS
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'chat' ? (
          // AI chat panel. The underlying `ChatInterface` already calls
          // `sendMessageToGemini` from `services/geminiService.ts`.
          // To hook up a different provider, swap that implementation
          // while keeping this panel unchanged.
          <ChatInterface />
        ) : (
          <ControlPanel params={params} onChange={onChange} />
        )}
      </div>
    </aside>
  );
};

export default RightPanel;
