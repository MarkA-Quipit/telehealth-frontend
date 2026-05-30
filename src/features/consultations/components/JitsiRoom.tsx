import { JitsiMeeting } from '@jitsi/react-sdk';

interface Props {
  appointmentId: string;
  displayName: string;
  email?: string;
  onLeave: () => void;
}

export function JitsiRoom({ appointmentId, displayName, email = '', onLeave }: Props) {
  const domain = import.meta.env.VITE_JITSI_DOMAIN ?? 'meet.jit.si';

  return (
    <JitsiMeeting
      domain={domain}
      roomName={appointmentId}
      style={{ height: '100%', width: '100%' }}
      configOverwrite={{
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      }}
      userInfo={{ displayName, email }}
      onReadyToClose={onLeave}
      getIFrameRef={(node) => {
        if (node) {
          node.style.width = '100%';
          node.style.height = '100%';
        }
      }}
    />
  );
}
