import { useEffect, useMemo, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import { useChatHistory, useSendChatMessage } from '../hooks/useConsultations';
import type { ChatMessage } from '../api/consultations.api';

// Pusher client — module-level, one instance for consultations
const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_KEY as string, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
});

interface ChatPanelProps {
  appointmentId: string;
  currentUserId: string;
  otherPartyName: string;
}

export function ChatPanel({ appointmentId, currentUserId, otherPartyName }: ChatPanelProps) {
  // Live messages received via Pusher since the page loaded
  const [pusherMessages, setPusherMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: history = [] } = useChatHistory(appointmentId);
  const { mutate: send, isPending } = useSendChatMessage(appointmentId);

  // Combine persisted history + live Pusher messages, deduped by id
  const messages = useMemo(() => {
    const seenIds = new Set(history.map((m) => m.id));
    return [...history, ...pusherMessages.filter((m) => !seenIds.has(m.id))];
  }, [history, pusherMessages]);

  // Pusher subscription
  useEffect(() => {
    const channel = pusherClient.subscribe(`consultation-${appointmentId}`);
    channel.bind('new_message', (data: ChatMessage) => {
      setPusherMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });
    return () => {
      pusherClient.unsubscribe(`consultation-${appointmentId}`);
    };
  }, [appointmentId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;
    send(trimmed);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide px-1 pb-2 shrink-0">
        Chat
      </p>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {messages.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center pt-4">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <p className="text-xs text-neutral-400 mb-0.5">
                  {isOwn ? 'You' : otherPartyName}
                </p>
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-1.5 text-xs leading-relaxed ${
                    isOwn
                      ? 'bg-sky-100 text-sky-900'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}
                >
                  {msg.message}
                </div>
                <p className="text-[10px] text-neutral-300 mt-0.5">
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex gap-1.5 pt-2 border-t border-neutral-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 min-w-0 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs
                     focus:bg-white focus:border focus:border-sky-400 focus:ring-1 focus:ring-sky-100
                     outline-none transition"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isPending}
          className="shrink-0 rounded-lg bg-sky-100 text-sky-700 px-2.5 py-1.5 text-xs font-medium
                     hover:bg-sky-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
