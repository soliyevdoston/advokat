import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, MoreVertical, Phone, Video, Search, Image as ImageIcon, FileText, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function ChatInterface({ title, subtitle, type = 'ai', initialMessage }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, text: initialMessage, sender: 'bot', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const allContacts = [
    { id: 'ai', name: t('chat_interface.roles.ai'), status: 'online', type: 'ai' },
    { id: 1, name: 'Azizov Bahrom', status: 'online', type: 'lawyer' },
    { id: 2, name: 'Karimova Nargiza', status: 'offline', type: 'lawyer' },
    { id: 3, name: 'Toshmatov Dilshod', status: 'online', type: 'lawyer' },
  ];

  const contacts = allContacts.filter(contact => {
    if (type === 'ai') return contact.type === 'ai';
    if (type === 'expert' || type === 'lawyer') return contact.type === 'lawyer';
    return true;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text: inputValue, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      let responseText = "";
      if (type === 'ai') {
        responseText = t('chat_interface.ai_responses.doc');
      } else if (type === 'expert') {
        responseText = t('chat_interface.ai_responses.expert');
      } else {
        responseText = t('chat_interface.ai_responses.busy');
      }

      const botMsg = { 
        id: Date.now() + 1, 
        text: responseText,
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 flex h-[700px] md:h-[800px]">
      {/* Sidebar - Hidden on mobile for simple view, visible on larger screens */}
      <div className="hidden md:flex w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-700 flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('chat_interface.sidebar_title')}</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder={t('chat_interface.search_placeholder')} 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                (contact.type === type && contact.name === title) || (contact.type === 'ai' && type === 'ai' && contact.id === 'ai')
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  contact.type === 'ai' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {contact.type === 'ai' ? <Bot size={20} /> : <User size={20} />}
                </div>
                {contact.status === 'online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </div>
              <div>
                <h4 className={`font-semibold text-sm ${
                   (contact.type === type && contact.name === title) ? 'text-[var(--color-primary)] dark:text-blue-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {contact.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {contact.type === 'ai' ? t('chat_interface.roles.ai') : t('chat_interface.roles.lawyer')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/50">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${type === 'ai' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white'}`}>
              {type === 'ai' ? <Bot size={24} /> : <User size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400">
             <Button variant="ghost" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
               <Phone size={20} />
             </Button>
             <Button variant="ghost" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
               <Video size={20} />
             </Button>
             <Button variant="ghost" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
               <MoreVertical size={20} />
             </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                   msg.sender === 'user' ? 'bg-[var(--color-primary)] text-white' : (type === 'ai' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300')
                 }`}>
                   {msg.sender === 'user' ? <User size={14} /> : (type === 'ai' ? <Bot size={14} /> : <User size={14} />)}
                 </div>

                 <div className={`
                   rounded-2xl p-4 shadow-sm
                   ${msg.sender === 'user' 
                     ? 'bg-[var(--color-primary)] text-white rounded-br-none' 
                     : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'}
                 `}>
                   <p className="leading-relaxed text-[15px]">{msg.text}</p>
                   <span className={`text-[10px] mt-1.5 block font-medium opacity-70 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'}`}>
                     {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 flex items-end gap-2 shadow-inner">
            <Button variant="ghost" className="text-slate-400 hover:text-[var(--color-primary)] p-3 rounded-full hover:bg-white dark:hover:bg-slate-800 h-auto">
              <Paperclip size={20} />
            </Button>
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); 
                  handleSend();
                }
              }}
              placeholder={t('chat_interface.input_placeholder')}
              className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-800 dark:text-white placeholder:text-slate-400 resize-none py-3 max-h-32 min-h-[48px]"
              rows="1"
            />
            
            <div className="flex items-center gap-1">
               <Button variant="ghost" className="text-slate-400 hover:text-[var(--color-primary)] p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 h-auto hidden sm:flex">
                 <Smile size={20} />
               </Button>
               <Button 
                onClick={handleSend} 
                className={`p-3 rounded-full transition-all duration-300 h-auto ${
                  inputValue.trim() 
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
                disabled={!inputValue.trim()}
               >
                 <Send size={20} className={inputValue.trim() ? "translate-x-0.5" : ""} />
               </Button>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-slate-400">
              {t('chat_interface.ai_warning')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
