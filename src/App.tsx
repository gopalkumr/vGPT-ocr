import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { OcrComponent } from './components/OcrComponent';
import { useState } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const [message, setMessage] = useState('');

  const handleMessageUpdate = (newMessage: string) => {
    setMessage(newMessage);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/history" element={<History />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <OcrComponent onMessageUpdate={handleMessageUpdate} />
          </ChatProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
