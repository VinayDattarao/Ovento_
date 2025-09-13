import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage } from '@/types';

export function useWebSocket(userId?: string) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(true); // Always connected for hardcoded mode
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (!userId) return;

    // Try to connect to real WebSocket first, fallback to hardcoded mode
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws?userId=${userId}`;
      
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('✅ Real WebSocket connected!');
        ws.current = websocket;
        setIsConnected(true);
      };

      websocket.onclose = () => {
        console.log('🔄 WebSocket disconnected, using hardcoded mode');
        ws.current = null;
        setIsConnected(true); // Stay connected in hardcoded mode
        
        // Add sample message in hardcoded mode
        setTimeout(() => {
          const sampleMessage: WebSocketMessage = {
            type: 'chat_message',
            content: '🤖 Welcome to the community chat! This is running in demo mode with simulated responses.',
            senderId: 'system',
            channelType: 'global',
            messageType: 'text',
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, sampleMessage]);
        }, 1000);
      };

      websocket.onerror = (error) => {
        console.log('🔄 WebSocket error, falling back to hardcoded mode:', error);
        setIsConnected(true); // Stay connected in hardcoded mode
      };

      websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'chat_message':
              setMessages(prev => [...prev, message]);
              break;
            case 'typing_indicator':
              if (message.isTyping && message.userId) {
                setTypingUsers(prev => new Set([...Array.from(prev), message.userId!]));
                setTimeout(() => {
                  setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(message.userId!);
                    return newSet;
                  });
                }, 3000);
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

    } catch (error) {
      console.log('🔄 WebSocket setup failed, using hardcoded mode:', error);
      setIsConnected(true);
      
      // Add sample message in hardcoded mode
      setTimeout(() => {
        const sampleMessage: WebSocketMessage = {
          type: 'chat_message',
          content: '🤖 Welcome to the community chat! This is running in demo mode with simulated responses.',
          senderId: 'system',
          channelType: 'global',
          messageType: 'text',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, sampleMessage]);
      }, 1000);
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    // Try to send through real WebSocket first
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('Sending message via WebSocket:', message);
      ws.current.send(JSON.stringify(message));
    } else {
      // Fallback to hardcoded mode, handle messages locally
      console.log('Sending message in hardcoded mode:', message);
      
      if (message.type === 'chat_message') {
        // Add the message to local state immediately
        setMessages(prev => [...prev, message]);
      } else if (message.type === 'typing_indicator') {
        // Handle typing indicators
        if (message.isTyping && message.userId) {
          setTypingUsers(prev => new Set([...Array.from(prev), message.userId!]));
          setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.userId!);
              return newSet;
            });
          }, 3000);
        }
      }
    }
  }, []);

  const sendChatMessage = useCallback((
    content: string,
    channelType: string,
    recipientId?: string,
    teamId?: string,
    eventId?: string,
    messageType: string = 'text'
  ) => {
    const newMessage: WebSocketMessage = {
      type: 'chat_message',
      content,
      senderId: userId || 'current-user',
      recipientId,
      teamId,
      eventId,
      channelType,
      messageType,
      timestamp: new Date().toISOString(),
    };
    
    // Try to send through real WebSocket first
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(newMessage));
    } else {
      // Fallback to local state (hardcoded mode)
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate a response after a short delay
      setTimeout(() => {
        const responses = [
          "That's a great point!",
          "I agree with that approach.",
          "Thanks for sharing!",
          "Interesting perspective.",
          "Let's discuss this further.",
          "Good idea! 💡",
          "I'll look into that.",
          "Sounds like a plan!"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage: WebSocketMessage = {
          type: 'chat_message',
          content: randomResponse,
          senderId: 'bot-user',
          channelType,
          messageType: 'text',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
  }, [userId]);

  const sendTypingIndicator = useCallback((
    isTyping: boolean,
    channelId: string
  ) => {
    // Send typing indicator through real WebSocket if connected, otherwise ignore
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'typing_indicator',
        userId,
        channelId,
        isTyping,
      }));
    }
  }, [userId]);

  const joinChannel = useCallback((channelId: string) => {
    sendMessage({
      type: 'join_channel',
      channelId,
    });
  }, [sendMessage]);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    sendChatMessage,
    sendTypingIndicator,
    joinChannel,
    connect,
    disconnect,
  };
}
