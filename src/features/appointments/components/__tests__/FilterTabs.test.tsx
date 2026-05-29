import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterTabs } from '../FilterTabs';

const TABS = ['All', 'Pending', 'Confirmed', 'Completed'] as const;

describe('FilterTabs', () => {
  it('renders a button for each tab', () => {
    render(<FilterTabs tabs={TABS} activeTab="All" onChange={vi.fn()} />);
    TABS.forEach((tab) => {
      expect(screen.getByRole('button', { name: tab })).toBeInTheDocument();
    });
  });

  it('applies active styles to the active tab button', () => {
    render(<FilterTabs tabs={TABS} activeTab="Pending" onChange={vi.fn()} />);
    const activeBtn = screen.getByRole('button', { name: 'Pending' });
    expect(activeBtn.className).toContain('border-sky-400');
    expect(activeBtn.className).toContain('text-sky-700');
  });

  it('does not apply active styles to non-active tabs', () => {
    render(<FilterTabs tabs={TABS} activeTab="All" onChange={vi.fn()} />);
    const nonActive = screen.getByRole('button', { name: 'Pending' });
    expect(nonActive.className).toContain('border-transparent');
  });

  it('calls onChange with the correct tab when clicked', async () => {
    const onChange = vi.fn();
    render(<FilterTabs tabs={TABS} activeTab="All" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirmed' }));
    expect(onChange).toHaveBeenCalledWith('Confirmed');
  });

  it('renders with an empty tabs array without crashing', () => {
    const { container } = render(
      <FilterTabs tabs={[] as unknown as readonly string[]} activeTab="" onChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
