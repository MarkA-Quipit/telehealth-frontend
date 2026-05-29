import type { User } from '../../types';
import { ProfileCard } from '../../components/ProfileCard';
import { AvatarUpload } from '../../components/AvatarUpload';

interface ProfilePhotoSectionProps {
  user: User;
}

export function ProfilePhotoSection({ user }: ProfilePhotoSectionProps) {
  return (
    <div className="space-y-4">
      <ProfileCard user={user} />
      <AvatarUpload
        userId={user.id}
        currentUrl={user.profilePictureUrl}
        firstName={user.firstName}
        lastName={user.lastName}
      />
    </div>
  );
}
