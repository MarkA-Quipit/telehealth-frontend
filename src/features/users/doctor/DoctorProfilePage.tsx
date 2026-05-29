import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser, useUpdateUser, useChangePassword } from '../hooks/useUser';
import { useLogoutAll } from '@/features/auth/hooks/useAuth';
import { useDoctor, useUpdateDoctor } from '@/features/doctors/hooks/useDoctors';
import { ProfileCard } from '../components/ProfileCard';
import { AvatarUpload } from '../components/AvatarUpload';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  specialization: string;
  bio: string;
  yearsOfExperience: string;
  consultationFee: string;
  licenseNumber: string;
  isAcceptingPatients: boolean;
}

function LogoutAllSection() {
  const [confirming, setConfirming] = useState(false);
  const { mutate: doLogoutAll, isPending } = useLogoutAll();

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
      <div>
        <h3 className="text-base font-semibold text-neutral-900">Session Management</h3>
        <p className="text-sm text-neutral-500 mt-0.5">
          Sign out of all active sessions on every device.
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            onClick={() => doLogoutAll()}
            disabled={isPending}
            className="disabled:cursor-not-allowed"
          >
            {isPending ? 'Signing out…' : 'Confirm — logout all devices'}
          </Button>
          <Button variant="secondary" onClick={() => setConfirming(false)} disabled={isPending}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="destructive" onClick={() => setConfirming(true)}>
          Logout from all devices
        </Button>
      )}
    </div>
  );
}

function ChangePasswordSection({ userId }: { userId: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const { mutateAsync: doChangePassword, isPending } = useChangePassword();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await doChangePassword({ id: userId, currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-neutral-900">Change Password</h3>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Current Password</label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-10"
          placeholder="Enter current password"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">New Password</label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-10"
          placeholder="Minimum 8 characters"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || !currentPassword || !newPassword}
        className="disabled:cursor-not-allowed"
      >
        {isPending ? 'Updating…' : 'Change Password'}
      </Button>
    </form>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-neutral-200 ${className ?? ''}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-24 w-full rounded-xl" />
      <SkeletonBlock className="h-28 w-full rounded-xl" />
      <SkeletonBlock className="h-40 w-full rounded-xl" />
      <SkeletonBlock className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function DoctorProfilePage() {
  const { user: authUser } = useAuthContext();
  const { data: fullUser, isLoading: userLoading } = useUser(authUser?.id);
  const { data: doctor, isLoading: doctorLoading } = useDoctor(fullUser?.doctorId);

  const { mutateAsync: updateUser, isPending: updatingUser } = useUpdateUser();
  const { mutateAsync: updateDoctor, isPending: updatingDoctor } = useUpdateDoctor();

  const isLoading = userLoading || doctorLoading;
  const isSaving = updatingUser || updatingDoctor;

  const { register, handleSubmit, reset, setValue, control } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      specialization: '',
      bio: '',
      yearsOfExperience: '',
      consultationFee: '',
      licenseNumber: '',
      isAcceptingPatients: true,
    },
  });

  const isAccepting = useWatch({ control, name: 'isAcceptingPatients' });

  useEffect(() => {
    if (fullUser && doctor) {
      reset({
        firstName: fullUser.firstName ?? '',
        lastName: fullUser.lastName ?? '',
        phone: fullUser.phone ?? '',
        specialization: doctor.specialization ?? '',
        bio: doctor.bio ?? '',
        yearsOfExperience: doctor.yearsOfExperience != null ? String(doctor.yearsOfExperience) : '',
        consultationFee: doctor.consultationFee != null ? String(doctor.consultationFee) : '',
        licenseNumber: doctor.licenseNumber ?? '',
        isAcceptingPatients: doctor.isAcceptingPatients,
      });
    }
  }, [fullUser, doctor, reset]);

  async function onSubmit(values: FormValues) {
    if (!fullUser || !doctor) return;

    try {
      const userDto: { firstName?: string; lastName?: string; phone?: string } = {};
      if (values.firstName !== (fullUser.firstName ?? '')) userDto.firstName = values.firstName;
      if (values.lastName !== (fullUser.lastName ?? '')) userDto.lastName = values.lastName;
      if (values.phone !== (fullUser.phone ?? '')) userDto.phone = values.phone;

      const doctorDto = {
        specialization: values.specialization || undefined,
        bio: values.bio || undefined,
        licenseNumber: values.licenseNumber || undefined,
        yearsOfExperience: values.yearsOfExperience ? parseInt(values.yearsOfExperience, 10) : undefined,
        consultationFee: values.consultationFee ? parseInt(values.consultationFee, 10) : undefined,
        isAcceptingPatients: values.isAcceptingPatients,
      };

      await Promise.all([
        Object.keys(userDto).length > 0 ? updateUser({ id: fullUser.id, dto: userDto }) : null,
        updateDoctor({ id: doctor.id, dto: doctorDto }),
      ]);

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    }
  }

  if (isLoading) return <PageSkeleton />;

  if (!fullUser) {
    return (
      <div className="text-sm text-neutral-500 py-8 text-center">
        Could not load user data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My Profile</h1>
        <p className="text-sm text-neutral-500">Manage your professional information and preferences</p>
      </div>

      {/* Profile Card */}
      <ProfileCard user={fullUser} />

      {/* Avatar Upload */}
      <AvatarUpload
        userId={fullUser.id}
        currentUrl={fullUser.profilePictureUrl}
        firstName={fullUser.firstName}
        lastName={fullUser.lastName}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-neutral-900">Personal Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">First Name</label>
              <Input
                {...register('firstName')}
                className="h-10"
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Last Name</label>
              <Input
                {...register('lastName')}
                className="h-10"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Phone Number</label>
            <Input
              {...register('phone')}
              type="tel"
              className="h-10"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-neutral-900">Professional Information</h3>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Specialization</label>
            <Input
              {...register('specialization')}
              className="h-10"
              placeholder="e.g. General Practitioner, Cardiologist"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Bio</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
              placeholder="Describe your background, expertise, and approach to patient care"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Years of Experience</label>
              <Input
                {...register('yearsOfExperience')}
                type="number"
                min="0"
                className="h-10"
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Consultation Fee{' '}
                <span className="text-xs font-normal text-neutral-400">(stored as centavos — enter 50000 for ₱500)</span>
              </label>
              <Input
                {...register('consultationFee')}
                type="number"
                min="0"
                className="h-10"
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">License Number</label>
            <Input
              {...register('licenseNumber')}
              className="h-10"
              placeholder="Professional license number"
            />
          </div>
        </div>

        {/* Accepting Patients Toggle */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900">Accepting new patients</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Toggle off to pause new appointment bookings
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAccepting}
              onClick={() => setValue('isAcceptingPatients', !isAccepting)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1 ${
                isAccepting ? 'bg-sky-400' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isAccepting ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-2.5 disabled:cursor-not-allowed"
        >
          {isSaving && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>

      {/* Change Password */}
      <ChangePasswordSection userId={fullUser.id} />

      {/* Logout all devices */}
      <LogoutAllSection />
    </div>
  );
}