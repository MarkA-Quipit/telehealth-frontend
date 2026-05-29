import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { ChatPanel } from '../ChatPanel';

// Track bind callbacks so tests can simulate Pusher events
const bindCallbacks: Record<string, (data: unknown) => void> = {};
const mockChannel = {
  bind: vi.fn((event: string, cb: (data: unknown) => void) => {
    bindCallbacks[event] = cb;
  }),
  unbind: vi.fn(),
};

vi.mock('pusher-js', () => {
  class FakePusher {
    subscribe = vi.fn(() => mockChannel);
    unsubscribe = vi.fn();
  }
  return { default: FakePusher };
});

// Control chat history per test via this variable
let mockHistory: object[] = [];
const mockSend = vi.fn();

vi.mock('../../hooks/useConsultations', () => ({
  useChatHistory: () => ({ data: mockHistory }),
  useSendChatMessage: () => ({ mutate: mockSend, isPending: false }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

function renderPanel() {
  return render(
    <ChatPanel appointmentId="appt-1" currentUserId="user-1" otherPartyName="Dr. Smith" />,
    { wrapper: makeWrapper() },
  );
}

describe('ChatPanel', () => {
  beforeEach(() => {
    mockHistory = [];
    mockSend.mockReset();
    Object.keys(bindCallbacks).forEach((k) => delete bindCallbacks[k]);
  });

  it('renders "No messages yet" when history is empty', () => {
    renderPanel();
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('renders the send button disabled when input is empty', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('enables the send button when input has text', async () => {
    renderPanel();
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), 'Hello');
    expect(screen.getByRole('button', { name: /send/i })).not.toBeDisabled();
  });

  it('calls send mutation when Send button is clicked', async () => {
    renderPanel();
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), 'Hello doctor');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(mockSend).toHaveBeenCalledWith('Hello doctor');
  });

  it('calls send mutation when Enter is pressed', async () => {
    renderPanel();
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), 'Hello doctor');
    await userEvent.keyboard('{Enter}');
    expect(mockSend).toHaveBeenCalledWith('Hello doctor');
  });

  it('own messages appear right-aligned (items-end)', () => {
    const ownMsg = { id: 'msg-own', appointmentId: 'appt-1', senderId: 'user-1', message: 'My message', sentAt: new Date().toISOString() };
    mockHistory = [ownMsg];
    renderPanel();
    expect(screen.getByText('My message')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('other party messages appear left-aligned with their name', () => {
    const otherMsg = { id: 'msg-other', appointmentId: 'appt-1', senderId: 'user-2', message: 'Hi from doctor', sentAt: new Date().toISOString() };
    mockHistory = [otherMsg];
    renderPanel();
    expect(screen.getByText('Hi from doctor')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  it('appends a Pusher new_message event to the chat', async () => {
    renderPanel();
    bindCallbacks['new_message']?.({
      id: 'msg-pusher',
      appointmentId: 'appt-1',
      senderId: 'user-2',
      message: 'Live message from Dr. Smith',
      sentAt: new Date().toISOString(),
    });
    await waitFor(() => {
      expect(screen.getByText('Live message from Dr. Smith')).toBeInTheDocument();
    });
  });

  it('does not duplicate a message already in history when same ID arrives via Pusher', async () => {
    const existingMsg = { id: 'msg-1', appointmentId: 'appt-1', senderId: 'user-2', message: 'Hello', sentAt: new Date().toISOString() };
    mockHistory = [existingMsg];
    renderPanel();
    // Same ID arrives via Pusher
    bindCallbacks['new_message']?.({ ...existingMsg });
    await waitFor(() => {
      expect(screen.getAllByText('Hello')).toHaveLength(1);
    });
  });
});
