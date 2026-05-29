import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JitsiRoom } from '../JitsiRoom';

const mockJitsiMeeting = vi.fn(({ roomName, userInfo, onReadyToClose }: {
  roomName: string;
  userInfo: { displayName: string; email: string };
  onReadyToClose: () => void;
  domain: string;
}) => (
  <div
    data-testid="jitsi-meeting"
    data-room={roomName}
    data-name={userInfo.displayName}
    data-email={userInfo.email}
    onClick={onReadyToClose}
  />
));

vi.mock('@jitsi/react-sdk', () => ({
  JitsiMeeting: (props: Parameters<typeof mockJitsiMeeting>[0]) => mockJitsiMeeting(props),
}));

describe('JitsiRoom', () => {
  it('renders JitsiMeeting with roomName set to appointmentId', () => {
    render(
      <JitsiRoom
        appointmentId="appt-xyz"
        displayName="Jane Doe"
        onLeave={vi.fn()}
      />,
    );
    expect(screen.getByTestId('jitsi-meeting')).toHaveAttribute('data-room', 'appt-xyz');
  });

  it('passes displayName in userInfo', () => {
    render(
      <JitsiRoom
        appointmentId="appt-xyz"
        displayName="Jane Doe"
        onLeave={vi.fn()}
      />,
    );
    expect(screen.getByTestId('jitsi-meeting')).toHaveAttribute('data-name', 'Jane Doe');
  });

  it('passes email in userInfo', () => {
    render(
      <JitsiRoom
        appointmentId="appt-xyz"
        displayName="Jane Doe"
        email="jane@test.com"
        onLeave={vi.fn()}
      />,
    );
    expect(screen.getByTestId('jitsi-meeting')).toHaveAttribute('data-email', 'jane@test.com');
  });

  it('defaults email to empty string when not provided', () => {
    render(
      <JitsiRoom
        appointmentId="appt-xyz"
        displayName="Jane Doe"
        onLeave={vi.fn()}
      />,
    );
    expect(screen.getByTestId('jitsi-meeting')).toHaveAttribute('data-email', '');
  });

  it('calls onLeave when onReadyToClose fires', async () => {
    const onLeave = vi.fn();
    render(
      <JitsiRoom
        appointmentId="appt-xyz"
        displayName="Jane Doe"
        onLeave={onLeave}
      />,
    );
    screen.getByTestId('jitsi-meeting').click();
    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});
