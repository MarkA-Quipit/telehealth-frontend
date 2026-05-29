import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DoctorCard } from '../DoctorCard';
import type { DoctorWithUser } from '../../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const baseDoctor: DoctorWithUser = {
  id: 'doc-1',
  userId: 'user-doc-1',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@doc.com',
  specialization: 'Cardiology',
  consultationFee: 50000,
  isAcceptingPatients: true,
  isVerified: true,
  averageRating: 4.5,
  reviewCount: 10,
  completedConsultationsCount: 20,
  yearsOfExperience: 8,
};

function renderCard(props: Partial<DoctorWithUser> = {}, compact = false) {
  return render(
    <MemoryRouter>
      <DoctorCard doctor={{ ...baseDoctor, ...props }} compact={compact} />
    </MemoryRouter>,
  );
}

describe('DoctorCard (full mode)', () => {
  it('renders doctor name and specialization', () => {
    renderCard();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  it('renders the fee formatted with ₱', () => {
    renderCard();
    expect(screen.getByText(/₱500/)).toBeInTheDocument();
  });

  it('shows "Accepting" badge when isAcceptingPatients is true', () => {
    renderCard({ isAcceptingPatients: true });
    expect(screen.getByText('Accepting')).toBeInTheDocument();
  });

  it('shows "Not Accepting" badge when isAcceptingPatients is false', () => {
    renderCard({ isAcceptingPatients: false });
    expect(screen.getByText('Not Accepting')).toBeInTheDocument();
  });

  it('shows star rating when reviewCount > 0', () => {
    renderCard({ reviewCount: 5, averageRating: 4.0 });
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  it('hides star rating when reviewCount is 0', () => {
    renderCard({ reviewCount: 0 });
    expect(screen.queryByText(/\d+\.\d+/)).not.toBeInTheDocument();
  });

  it('renders years of experience when set', () => {
    renderCard({ yearsOfExperience: 8 });
    expect(screen.getByText(/8 yrs/i)).toBeInTheDocument();
  });

  it('navigates to the doctor profile on button click', async () => {
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: /view doctor profile/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/patient/doctors/doc-1');
  });
});

describe('DoctorCard (compact mode)', () => {
  it('renders name and specialization', () => {
    renderCard({}, true);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  it('does not render the fee', () => {
    renderCard({}, true);
    expect(screen.queryByText(/₱/)).not.toBeInTheDocument();
  });

  it('does not render the View Doctor Profile button', () => {
    renderCard({}, true);
    expect(screen.queryByRole('button', { name: /view doctor profile/i })).not.toBeInTheDocument();
  });

  it('does not render the star rating', () => {
    renderCard({ reviewCount: 5, averageRating: 4.0 }, true);
    expect(screen.queryByText('4.0')).not.toBeInTheDocument();
  });
});
