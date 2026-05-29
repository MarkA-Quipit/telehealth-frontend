import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createElement } from 'react';
import { SymptomChecker } from '../SymptomChecker';

vi.mock('../../hooks/useAIRecommendation', () => ({
  useAiHistory: () => ({ data: [] }),
}));

const mockStream = vi.fn();
vi.mock('../../api/ai.api', () => ({
  streamRecommendations: (...args: unknown[]) => mockStream(...args),
}));

vi.mock('@/features/doctors/components/DoctorCard', () => ({
  DoctorCard: ({ doctor }: { doctor: { firstName: string } }) => (
    <div data-testid="doctor-card">{doctor.firstName}</div>
  ),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children),
    );
}

describe('SymptomChecker', () => {
  beforeEach(() => {
    mockStream.mockReset();
  });

  it('renders the symptom textarea and its label text', () => {
    render(<SymptomChecker />, { wrapper: makeWrapper() });
    expect(screen.getAllByText(/describe your symptoms/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('disables the submit button when fewer than 10 characters are typed', async () => {
    render(<SymptomChecker />, { wrapper: makeWrapper() });
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'short');
    expect(screen.getByRole('button', { name: /find matching doctors/i })).toBeDisabled();
  });

  it('enables the submit button once textarea reaches 10 characters', async () => {
    render(<SymptomChecker />, { wrapper: makeWrapper() });
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'chest pain and shortness of breath');
    expect(screen.getByRole('button', { name: /find matching doctors/i })).not.toBeDisabled();
  });

  it('calls streamRecommendations on submit', async () => {
    mockStream.mockResolvedValue(undefined);
    render(<SymptomChecker />, { wrapper: makeWrapper() });

    await userEvent.type(
      screen.getByRole('textbox'),
      'chest pain and shortness of breath',
    );
    await userEvent.click(screen.getByRole('button', { name: /find matching doctors/i }));

    await waitFor(() => {
      expect(mockStream).toHaveBeenCalledWith(
        'chest pain and shortness of breath',
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  it('shows error message when streamRecommendations throws', async () => {
    mockStream.mockRejectedValue(new Error('Network error'));
    render(<SymptomChecker />, { wrapper: makeWrapper() });

    await userEvent.type(
      screen.getByRole('textbox'),
      'chest pain and shortness of breath',
    );
    await userEvent.click(screen.getByRole('button', { name: /find matching doctors/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/unable to process your symptoms/i),
      ).toBeInTheDocument();
    });
  });

  it('shows disclaimer after streaming completes with results', async () => {
    mockStream.mockImplementation(
      async (
        _symptoms: string,
        _onToken: (t: string) => void,
        onDone: (r: { recommendations: { specialization: string; reason: string; doctors: [] }[] }) => void,
      ) => {
        onDone({ recommendations: [{ specialization: 'Cardiology', reason: 'Heart symptoms', doctors: [] }] });
      },
    );
    render(<SymptomChecker />, { wrapper: makeWrapper() });

    await userEvent.type(
      screen.getByRole('textbox'),
      'chest pain and shortness of breath',
    );
    await userEvent.click(screen.getByRole('button', { name: /find matching doctors/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/this is a discovery tool only/i),
      ).toBeInTheDocument();
    });
  });

  it('submits via Ctrl+Enter keyboard shortcut', async () => {
    mockStream.mockResolvedValue(undefined);
    render(<SymptomChecker />, { wrapper: makeWrapper() });

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'chest pain and shortness of breath');
    await userEvent.keyboard('{Control>}{Enter}{/Control}');

    await waitFor(() => {
      expect(mockStream).toHaveBeenCalled();
    });
  });
});
