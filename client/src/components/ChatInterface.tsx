import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { WebSocketMessage } from '@/types';
import { Send, Paperclip, Smile, MoreHorizontal, Wifi, WifiOff } from 'lucide-react';

interface ChatInterfaceProps {
  title: string;
  channelType: string;
  channelId: string;
  messages: WebSocketMessage[];
  onSendMessage: (
    content: string,
    channelType: string,
    recipientId?: string,
    teamId?: string,
    eventId?: string,
    messageType?: string
  ) => void;
  isConnected: boolean;
  className?: string;
}

export function ChatInterface({
  title,
  channelType,
  channelId,
  messages,
  onSendMessage,
  isConnected,
  className = '',
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    onSendMessage(
      newMessage.trim(),
      channelType,
      channelType === 'direct' ? channelId : undefined,
      channelType === 'team' ? channelId : undefined,
      channelType === 'event' ? channelId : undefined,
      'text'
    );

    setNewMessage('');
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      // Send typing indicator
      // TODO: Implement typing indicator via WebSocket
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mock messages for demonstration
  const sampleMessages = [
    {
      id: '1',
      senderId: 'user1',
      senderName: 'Alex Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      content: 'Hey everyone! Excited to start working on this hackathon project 🚀',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'text',
    },
    {
      id: '2',
      senderId: 'user2',
      senderName: 'Sarah Kim',
      senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      content: 'Same here! I have some ideas for the UI design. Should we set up a quick call?',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      type: 'text',
    },
    {
      id: '3',
      senderId: 'user3',
      senderName: 'Mike Rodriguez',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      content: 'Perfect timing! I just pushed the initial backend setup to the repo.',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: 'text',
    },
    {
      id: '4',
      senderId: user?.id || 'current-user',
      senderName: `${user?.firstName} ${user?.lastName}`,
      senderAvatar: user?.profileImageUrl,
      content: 'Awesome work everyone! Let me know if you need help with the frontend integration.',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'text',
    },
  ];

  const displayMessages = messages.length > 0 ? messages : sampleMessages;

  return (
    <Card className={`glass-card flex flex-col h-96 ${className}`} data-testid="chat-interface">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              💬 {title}
              <div className="flex items-center gap-1 text-sm font-normal">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-chart-4" />
                    <span className="text-chart-4">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-destructive" />
                    <span className="text-destructive">Disconnected</span>
                  </>
                )}
              </div>
            </CardTitle>
            <CardDescription>Real-time messaging • {displayMessages.length} messages</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {channelType}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-chat-options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      {/* Messages Area */}
      <CardContent className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-4">
        {displayMessages.map((message, index) => {
          const isCurrentUser = message.senderId === user?.id;
          const showAvatar = index === 0 || displayMessages[index - 1]?.senderId !== message.senderId;

          return (
            <div
              key={message.id || index}
              className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              data-testid={`message-${index}`}
            >
              {showAvatar && !isCurrentUser && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                  <AvatarFallback className="text-xs">
                    {message.senderName?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {!showAvatar && !isCurrentUser && <div className="w-8" />}

              <div className={`flex-1 max-w-[80%] ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
                {showAvatar && (
                  <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-medium">{message.senderName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div
                  className={`rounded-lg p-3 max-w-full break-words ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-muted-foreground">Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      <Separator />

      {/* Message Input */}
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            data-testid="button-attach-file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              placeholder={
                isConnected 
                  ? "Type your message..." 
                  : "Connecting to chat..."
              }
              className="pr-12"
              disabled={!isConnected}
              data-testid="input-chat-message"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              data-testid="button-emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="flex-shrink-0"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>
            Press Enter to send • Shift+Enter for new line
          </span>
          <span className="flex items-center gap-1">
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                Online
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                Reconnecting...
              </>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}
