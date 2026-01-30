import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { lawyers } from '../data/lawyers';
import ChatInterface from '../components/chat/ChatInterface';

export default function ChatPage() {
  const { type, id } = useParams();
  
  let title = "Advokat yordamchisi";
  let subtitle = "Savollaringizga javob beraman";
  let initial = "Assalomu alaykum! Sizga qanday yuridik yordam kerak?";
  let chatType = 'ai';

  if (type === 'lawyer' && id) {
    const lawyer = lawyers.find(l => l.id === parseInt(id));
    if (lawyer) {
      title = lawyer.name;
      subtitle = lawyer.specialization;
      initial = `Assalomu alaykum! Men ${lawyer.name}, advokatman. Sizga qanday yordam bera olaman?`;
      chatType = 'lawyer';
    }
  } else if (type === 'document') {
    title = "Hujjatlar Generatori";
    subtitle = "AI yordamida hujjat yarating";
    initial = "Qanday hujjat tayyorlashimiz kerak? (Masalan: Ariza, Da'vo arizasi)";
    chatType = 'ai';
  }

  return (
    <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChatInterface 
          title={title} 
          subtitle={subtitle} 
          type={chatType} 
          initialMessage={initial} 
        />
      </div>
    </div>
  );
}
