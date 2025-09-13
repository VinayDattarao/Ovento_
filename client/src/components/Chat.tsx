import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Users,
  Settings,
  Search,
  X,
  Download,
  Image,
  FileText
} from "lucide-react";

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  messageType: 'text' | 'file' | 'image';
  fileUrl?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface ChatProps {
  roomId: string;
  eventId?: string;
  teamId?: string;
}

export default function Chat({ roomId, eventId, teamId }: ChatProps) {
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing messages
  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: eventId 
      ? ["/api/events", eventId, "chat"]
      : ["/api/teams", teamId, "chat"],
    enabled: !!(eventId || teamId),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; messageType?: string; fileUrl?: string }) => {
      const endpoint = eventId 
        ? `/api/events/${eventId}/chat`
        : `/api/teams/${teamId}/chat`;
      
      await apiRequest("POST", endpoint, messageData);
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ 
        queryKey: eventId 
          ? ["/api/events", eventId, "chat"]
          : ["/api/teams", teamId, "chat"]
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest("POST", "/api/upload", formData);
      return await response.json();
    },
    onSuccess: (data) => {
      sendMessageMutation.mutate({
        message: `Shared file: ${data.filename}`,
        messageType: data.mimetype.startsWith('image/') ? 'image' : 'file',
        fileUrl: data.url,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWebsocket(ws);
      
      // Join the room
      ws.send(JSON.stringify({
        type: 'join_event',
        eventId: eventId || `team_${teamId}`,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          // Invalidate queries to fetch new messages
          queryClient.invalidateQueries({ 
            queryKey: eventId 
              ? ["/api/events", eventId, "chat"]
              : ["/api/teams", teamId, "chat"]
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWebsocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [eventId, teamId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      message: message.trim(),
      messageType: 'text',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      uploadFileMutation.mutate(file);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredMessages = messages?.filter(msg => 
    !searchQuery || 
    msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="h-full flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {eventId ? 'Event Chat' : 'Team Chat'}
            <Badge variant="secondary" className="ml-2">
              <div className="w-2 h-2 bg-chart-4 rounded-full mr-1 animate-pulse" />
              Live
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              data-testid="button-search-chat"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showSearch && (
          <div className="flex items-center gap-2 mt-2">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-search-messages"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {/* Messages Area */}
        <div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery ? (
                <div>
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div>
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation</p>
                  <p className="text-sm">Send the first message to get things going!</p>
                </div>
              )}
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.userId === user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={msg.user?.profileImageUrl} />
                  <AvatarFallback className="text-xs">
                    {msg.user?.firstName?.[0]}{msg.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-xs ${msg.userId === user?.id ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {msg.userId === user?.id 
                        ? 'You' 
                        : `${msg.user?.firstName || ''} ${msg.user?.lastName || ''}`.trim() || 'Anonymous'
                      }
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    msg.userId === user?.id 
                      ? 'bg-primary text-primary-foreground ml-8' 
                      : 'bg-muted mr-8'
                  }`}>
                    {msg.messageType === 'text' ? (
                      <p className="text-sm break-words">{msg.message}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getFileIcon(msg.messageType)}
                        <span className="text-sm">{msg.message}</span>
                        {msg.fileUrl && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadFileMutation.isPending}
              data-testid="button-attach-file"
            >
              {uploadFileMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>

            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
              disabled={sendMessageMutation.isPending}
              data-testid="input-chat-message"
            />

            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-send-message"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {websocket?.readyState === WebSocket.OPEN && (
            <div className="flex items-center gap-1 mt-2 text-xs text-chart-4">
              <div className="w-2 h-2 bg-chart-4 rounded-full animate-pulse" />
              Connected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
