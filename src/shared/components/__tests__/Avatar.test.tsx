import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, getInitials } from '../Avatar';

describe('getInitials', () => {
  it('returns initials from first and last name', () => {
    expect(getInitials('Jane', 'Doe')).toBe('JD');
  });

  it('returns single initial when last name is missing', () => {
    expect(getInitials('Jane', null)).toBe('J');
  });

  it('returns single initial when first name is missing', () => {
    expect(getInitials(null, 'Doe')).toBe('D');
  });

  it('returns ? when both names are undefined', () => {
    expect(getInitials(undefined, undefined)).toBe('?');
  });

  it('returns ? when both names are empty strings', () => {
    expect(getInitials('', '')).toBe('?');
  });

  it('uppercases initials', () => {
    expect(getInitials('jane', 'doe')).toBe('JD');
  });
});

describe('Avatar', () => {
  it('renders an img when profilePictureUrl is provided', () => {
    render(<Avatar firstName="Jane" lastName="Doe" profilePictureUrl="https://example.com/pic.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/pic.jpg');
    expect(img).toHaveAttribute('alt', 'Jane Doe');
  });

  it('renders initials when profilePictureUrl is null', () => {
    render(<Avatar firstName="Jane" lastName="Doe" profilePictureUrl={null} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies the xs size class', () => {
    render(<Avatar firstName="Jane" lastName="Doe" size="xs" />);
    const el = screen.getByText('JD');
    expect(el.className).toContain('w-8');
  });

  it('applies the sm size class (default)', () => {
    render(<Avatar firstName="Jane" lastName="Doe" />);
    const el = screen.getByText('JD');
    expect(el.className).toContain('w-10');
  });

  it('applies the lg size class', () => {
    render(<Avatar firstName="Jane" lastName="Doe" size="lg" />);
    const el = screen.getByText('JD');
    expect(el.className).toContain('w-16');
  });

  it('passes additional className to the img element', () => {
    render(
      <Avatar
        firstName="Jane"
        lastName="Doe"
        profilePictureUrl="https://example.com/pic.jpg"
        className="custom-class"
      />,
    );
    expect(screen.getByRole('img').className).toContain('custom-class');
  });
});
