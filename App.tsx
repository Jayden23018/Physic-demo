import React from 'react';
import Sidebar from './Components/Sidebar';
import ChatInterface from './Components/Chatinterface';
import DoublePendulum from './Components/DoublePandulum';

const App: React.FC = () => {
  return (
    <div className="flex w-screen h-screen bg-black text-white overflow-hidden font-sans">
      {/* Navigation */}
      <Sidebar currentView="double" setView={() => {}} />

      {/* Main Content Area */}
      <main className="flex-1 relative h-full">
        <DoublePendulum />
      </main>

      {/* Chat Sidebar */}
      <ChatInterface />
    </div>
  );
};

export default App;