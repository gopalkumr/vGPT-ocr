
import React, { useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import ChatHistory from '@/components/ChatHistory';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const Chat = () => {
  const { createNewChat, currentChatId } = useChat();
  const { isLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  // Create a new chat if none exists
  useEffect(() => {
    if (!isLoading && !currentChatId) {
      createNewChat();
    }
  }, [isLoading, currentChatId, createNewChat]);

  // Toggle sidebar visibility on mobile/desktop changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed md:relative inset-y-0 left-0 z-20 w-64 bg-card/70 backdrop-blur-md border-r border-border transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } md:w-72`}
        >
          <div className="h-full flex flex-col pt-16 pb-4">
            <div className="flex-1 px-4 py-6 overflow-y-auto">
              <ChatHistory />
            </div>
          </div>
        </div>
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          {/* Mobile toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="fixed z-30 top-20 left-4 md:hidden h-9 w-9 rounded-full bg-background/70 backdrop-blur-sm border border-border shadow-sm"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Chat;
