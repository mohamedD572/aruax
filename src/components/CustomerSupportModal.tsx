import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Headset, ShieldCheck, CheckCheck } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

interface SupportMessage {
  id: string;
  userId: string;
  sender: 'user' | 'support' | 'system';
  text: string;
  createdAt: string;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    // Listen to live support messages from Firestore
    const msgsRef = collection(db, 'support_messages');
    const q = query(
      msgsRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: SupportMessage[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SupportMessage, 'id'>),
      }));

      if (docs.length === 0) {
        // Welcome message
        setMessages([
          {
            id: 'welcome-msg',
            userId: user.id,
            sender: 'support',
            text: `Welcome ${user.firstName}! 👋 Aurex Customer Support is available 24/7. How can we assist you today?`,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages(docs);
      }
    });

    return () => unsubscribe();
  }, [isOpen, user?.id, user?.firstName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const msgText = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await addDoc(collection(db, 'support_messages'), {
        userId: user.id,
        sender: 'user',
        text: msgText,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error sending support message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#0D1117] rounded-2xl border border-[#7CFF4F]/30 shadow-2xl flex flex-col h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-[#21262D] bg-[#161B22]">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="p-2 rounded-xl bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/20">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#F0F6FC]">Customer Support | Aurex Helpdesk</h3>
                <ShieldCheck className="w-4 h-4 text-[#7CFF4F]" />
              </div>
              <p className="text-[11px] text-[#7CFF4F] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#7CFF4F] animate-pulse" />
                Telegram Official Support (@AurexOfficia)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0D1117]/90">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 font-mono uppercase">Official Telegram Support</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 font-mono font-bold">24/7 Live</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect directly with official Aurex customer support representatives on Telegram: <strong>@AurexOfficia</strong>
            </p>
            <button
              onClick={() => window.open('https://t.me/AurexOfficia', '_blank')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all font-mono"
            >
              <Send className="w-4 h-4" />
              <span>Contact @AurexOfficia on Telegram</span>
            </button>
          </div>
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                    isMe
                      ? 'bg-[#7CFF4F] text-[#0D1117] font-bold rounded-br-none shadow-[0_0_10px_rgba(124,255,79,0.2)]'
                      : 'bg-[#161B22] text-[#F0F6FC] border border-[#21262D] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                      isMe ? 'text-[#0D1117]/70 font-semibold' : 'text-[#8B949E]'
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-[#0D1117]" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Footer */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#21262D] bg-[#161B22] flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F6FC] outline-none font-medium placeholder:text-[#8B949E]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] disabled:opacity-40 text-[#0D1117] font-bold text-xs flex items-center justify-center transition-all shadow-[0_0_12px_rgba(124,255,79,0.2)]"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
