import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  game_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface GameChatProps {
  gameId: string;
  currentUserId: string;
  opponentName: string;
}

const GameChat: React.FC<GameChatProps> = ({ gameId, currentUserId, opponentName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as ChatMessage[]);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMsg]);
          
          if (newMsg.sender_id !== currentUserId && !isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, currentUserId, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear unread when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        game_id: gameId,
        sender_id: currentUserId,
        message: newMessage.trim(),
      });

    if (!error) {
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-80"
          >
            <Card className="shadow-xl border-border/50">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat with {opponentName}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64 px-4" ref={scrollRef}>
                  <div className="space-y-2 py-2">
                    {messages.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No messages yet. Say hello!
                      </p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-1.5 text-sm ${
                              msg.sender_id === currentUserId
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-sm"
                    />
                    <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameChat;
