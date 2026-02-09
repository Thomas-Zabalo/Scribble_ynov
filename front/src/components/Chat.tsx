import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket';

interface ChatProps {
  username: string;
  isDrawer: boolean;
  isGuest: boolean;
}

interface Message {
  user: string;
  text: string;
  isSystem?: boolean;
}

const Chat: React.FC<ChatProps> = ({ username, isDrawer, isGuest }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('chat_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat_message');
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Envoi au serveur
    socket.emit('chat_message', { user: username, text: input });
    setInput('');
  };

  const isInputDisabled = isDrawer || isGuest;
  const placeholderText = isGuest 
    ? "Mode spectateur (lecture seule)" 
    : isDrawer 
      ? "Vous dessinez..." 
      : "Devinez le mot...";

  return (
    <div style={{ 
      border: '1px solid #333', 
      borderRadius: '8px',
      padding: '15px', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#1a1a1a',
      color: 'white',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>Chat</h3>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        marginBottom: '10px', 
        padding: '5px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            padding: '5px 10px', 
            margin: '5px 0', 
            backgroundColor: msg.isSystem ? '#1b5e20' : '#333',
            borderRadius: '5px',
            fontSize: '14px',
            color: 'white'
          }}>
            <strong>{msg.user}: </strong>{msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '5px' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          style={{ 
            flex: 1, 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #444',
            backgroundColor: '#000',
            color: 'white',
            outline: 'none'
          }}
          placeholder={placeholderText}
          disabled={isInputDisabled}
        />
        <button type="submit" disabled={isInputDisabled} style={{ 
          padding: '8px 15px', 
          backgroundColor: isInputDisabled ? '#555' : '#2196F3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: isInputDisabled ? 'not-allowed' : 'pointer'
        }}>
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default Chat;
