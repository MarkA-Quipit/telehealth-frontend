import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from '../RegisterForm';

const mockRegister = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('renders all required patient fields', () => {
    renderForm();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('hides specialization field when role is patient (default)', () => {
    renderForm();
    expect(screen.queryByLabelText(/specialization/i)).not.toBeInTheDocument();
  });

  it('shows specialization field when doctor role is selected', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /doctor/i }));
    expect(screen.getByLabelText(/specialization/i)).toBeInTheDocument();
  });

  it('shows privacy error when form is submitted without accepting privacy policy', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/data privacy act/i);
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register() with correct DTO on valid patient submit', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    // Accept privacy checkbox
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'jane@test.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'patient',
        }),
      );
    });
  });

  it('shows server error message on rejection', async () => {
    mockRegister.mockRejectedValue(new Error('Email is already in use'));
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'existing@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email is already in use');
    });
  });

  it('disables submit button while pending', async () => {
    let resolve!: () => void;
    mockRegister.mockReturnValue(new Promise<void>((r) => { resolve = r; }));
    renderForm();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });

    resolve();
  });
});
