"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

const ConversationContext = createContext({
  conversations: [],
  isLoading: true,
});

export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/get_conversation_list")
      .then(r => r.json())
      .then(data => {
        setConversations(data);
        setIsLoading(false);
      })
      .catch(e => {
        console.error("conv list error", e);
        setIsLoading(false);
      });
  }, []); // Empty dependency array means this runs once on mount

  return (
    <ConversationContext.Provider value={{ conversations, isLoading }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationProvider');
  }
  return context;
} 