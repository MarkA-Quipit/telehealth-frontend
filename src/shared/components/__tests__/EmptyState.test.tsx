import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

const icon = <svg data-testid="test-icon" />;

describe('EmptyState', () => {
  it('renders the icon', () => {
    render(<EmptyState icon={icon} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    render(<EmptyState icon={icon} title="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('does not render title element when omitted', () => {
    render(<EmptyState icon={icon} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<EmptyState icon={icon} description="Try adjusting your filters." />);
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument();
  });

  it('renders the action when provided', () => {
    render(<EmptyState icon={icon} action={<button>Clear</button>} />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('does not render an action when omitted', () => {
    render(<EmptyState icon={icon} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies the lg padding class by default', () => {
    const { container } = render(<EmptyState icon={icon} />);
    expect(container.firstChild).toHaveClass('py-16');
  });

  it('applies the sm padding class when specified', () => {
    const { container } = render(<EmptyState icon={icon} padding="sm" />);
    expect(container.firstChild).toHaveClass('py-8');
  });

  it('applies the md padding class when specified', () => {
    const { container } = render(<EmptyState icon={icon} padding="md" />);
    expect(container.firstChild).toHaveClass('py-10');
  });
});
