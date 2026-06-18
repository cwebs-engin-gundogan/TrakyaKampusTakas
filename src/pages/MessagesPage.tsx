import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Image, Mic, Paperclip, Phone, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState, LoadingState } from '../components/ui/StateBlocks';
import { useAppState } from '../AppState';
import { apiClient, WS_BASE_URL } from '../lib/api/client';
import type { Conversation, MessageResponse } from '../types';
import { cn } from '../lib/utils';

export function MessagesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conversationsQuery = useQuery({ queryKey: ['chat', 'conversations'], queryFn: () => apiClient.conversations().then((response) => response.data) });
  const selected = Number(id || conversationsQuery.data?.[0]?.id);

  if (conversationsQuery.isLoading) return <LoadingState />;
  const conversations = conversationsQuery.data ?? [];

  if (!conversations.length) {
    return <EmptyState icon={Send} title="Henüz mesaj yok" description="Bir satıcının profilini ziyaret ederek konuşma başlat." />;
  }

  return (
    <div className="desktop:grid desktop:min-h-[calc(100vh-160px)] desktop:grid-cols-[360px_1fr] desktop:overflow-hidden desktop:rounded-auth desktop:bg-surface desktop:shadow-card">
      <aside className={cn('space-y-2 desktop:border-r desktop:border-[color:var(--outline-variant)]/60 desktop:p-3', id ? 'hidden desktop:block' : '')}>
        <h1 className="mb-4 hidden px-2 text-2xl font-extrabold desktop:block">Mesajlar</h1>
        {conversations.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            active={selected === conversation.id}
            onClick={() => navigate(`/mesajlar/${conversation.id}`)}
          />
        ))}
      </aside>
      <section className={cn('min-h-screen desktop:min-h-0', !id ? 'hidden desktop:block' : '')}>
        <ChatDetail conversation={conversations.find((item) => item.id === selected) ?? conversations[0]} />
      </section>
    </div>
  );
}

function ConversationRow({ conversation, active, onClick }: { conversation: Conversation; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex w-full items-center gap-3 rounded-card p-3 text-left transition', active ? 'bg-[color:var(--primary-12)]' : 'bg-surface hover:bg-[color:var(--primary-07)]')}
    >
      <div className="relative">
        <Avatar name={conversation.participant_name} src={conversation.participant_image_url} size={52} />
        {conversation.is_online ? <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-success-online" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-bold">{conversation.participant_name}</div>
          <div className="ml-auto text-xs font-semibold text-muted">{conversation.last_message_timestamp}</div>
        </div>
        <div className="mt-1 truncate text-sm text-muted">{conversation.last_message}</div>
      </div>
      {conversation.unread_count ? <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-on-primary">{conversation.unread_count}</span> : null}
    </button>
  );
}

function ChatDetail({ conversation }: { conversation: Conversation }) {
  const { token, user } = useAppState();
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket | null>(null);
  const messagesQuery = useQuery({
    queryKey: ['chat', 'messages', conversation.id],
    queryFn: () => apiClient.messages(conversation.id).then((response) => response.data),
  });
  const [localMessages, setLocalMessages] = useState<MessageResponse[]>([]);
  const [text, setText] = useState('');
  const messages = useMemo(() => [...(messagesQuery.data ?? []), ...localMessages], [localMessages, messagesQuery.data]);
  const targetUserId = conversation.target_user_id ?? (conversation.user1_id === user?.id ? conversation.user2_id : conversation.user1_id);

  useEffect(() => {
    setLocalMessages([]);
  }, [conversation.id]);

  useEffect(() => {
    if (!token) return;
    const socket = new WebSocket(`${WS_BASE_URL}/chat/ws?token=${encodeURIComponent(token)}`);
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as MessageResponse;
      if (message.conversation_id === conversation.id) {
        setLocalMessages((prev) => prev.some((item) => item.id === message.id) ? prev : [...prev, message]);
      }
    };
    socket.onerror = () => toast.error('Sohbet bağlantısı kurulamadı.');
    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [conversation.id, token]);

  const send = async () => {
    if (!text.trim()) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Sohbet bağlantısı hazır değil.');
      return;
    }
    socketRef.current.send(JSON.stringify({
      target_user_id: targetUserId,
      conversation_id: conversation.id,
      text: text.trim(),
    }));
    setText('');
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-surface shadow-none desktop:h-full desktop:min-h-0 desktop:rounded-none">
      <header className="flex h-16 items-center gap-3 border-b border-[color:var(--outline-variant)]/60 px-4">
        <button type="button" className="desktop:hidden" onClick={() => navigate('/mesajlar')} aria-label="Mesajlara dön">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <Avatar name={conversation.participant_name} src={conversation.participant_image_url} size={40} />
        <div>
          <div className="font-bold">{conversation.participant_name}</div>
          <div className={cn('text-xs font-semibold', conversation.is_online ? 'text-success-online' : 'text-error')}>
            {conversation.is_online ? 'Çevrimiçi' : 'Çevrimdışı'}
          </div>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          aria-label="Ara"
          onClick={() => toast.info('Arama özelliği yakında eklenecek')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--primary-35)] bg-background text-primary transition hover:bg-[color:var(--primary-12)]"
        >
          <Phone className="h-6 w-6" />
        </button>
      </header>

      <div className="scrollbar-soft flex-1 space-y-3 overflow-y-auto bg-background/50 p-4">
        {messagesQuery.isLoading ? <LoadingState /> : messages.map((message) => (
          <MessageBubble key={message.id} message={message} mine={message.sender_id === user?.id} />
        ))}
      </div>

      <footer className="border-t border-[color:var(--outline-variant)]/60 bg-surface p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] desktop:pb-3">
        <div className="mb-2 flex gap-2 text-muted">
          <button type="button" aria-label="Dosya ekle" className="rounded-full p-2 hover:bg-[color:var(--primary-12)]"><Paperclip className="h-5 w-5" /></button>
          <button type="button" aria-label="Fotoğraf ekle" className="rounded-full p-2 hover:bg-[color:var(--primary-12)]"><Image className="h-5 w-5" /></button>
          <button type="button" aria-label="Ses kaydı" className="rounded-full p-2 hover:bg-[color:var(--primary-12)]"><Mic className="h-5 w-5" /></button>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={1}
            placeholder="Bir mesaj yaz..."
            className="min-h-14 flex-1 resize-none rounded-lg border border-[color:var(--primary-35)] bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <Button variant="primary" className="h-14 w-14 shrink-0 rounded-full px-0" onClick={send} aria-label="Gönder">
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

function MessageBubble({ message, mine }: { message: MessageResponse; mine: boolean }) {
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-[12px] px-4 py-2 text-sm shadow-card',
          mine ? 'rounded-br-sm bg-primary text-on-primary' : 'rounded-bl-sm bg-surface text-on-surface',
        )}
      >
        <div>{message.text}</div>
        <div className={cn('mt-1 text-[10px] font-semibold', mine ? 'text-on-primary/75' : 'text-muted')}>
          {new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.timestamp))}
        </div>
      </div>
    </div>
  );
}
