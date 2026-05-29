import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser, useUpdateUser, useChangePassword } from '../hooks/useUser';
import { usePatient, useUpdatePatient } from '@/features/patients/hooks/usePatient';
import { ProfileCard } from '../components/ProfileCard';
import { AvatarUpload } from '../components/AvatarUpload';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
  weightKg: string;
  heightCm: string;
  allergies: string;
  medicalHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
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
      <SkeletonBlock className="h-48 w-full rounded-xl" />
      <SkeletonBlock className="h-72 w-full rounded-xl" />
      <SkeletonBlock className="h-36 w-full rounded-xl" />
    </div>
  );
}

export function PatientProfilePage() {
  const { user: authUser } = useAuthContext();
  const { data: fullUser, isLoading: userLoading } = useUser(authUser?.id);
  const { data: patient, isLoading: patientLoading } = usePatient(fullUser?.patientId);

  const { mutateAsync: updateUser, isPending: updatingUser } = useUpdateUser();
  const { mutateAsync: updatePatient, isPending: updatingPatient } = useUpdatePatient();

  const isLoading = userLoading || patientLoading;
  const isSaving = updatingUser || updatingPatient;

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      bloodType: '',
      weightKg: '',
      heightCm: '',
      allergies: '',
      medicalHistory: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (fullUser && patient) {
      reset({
        firstName: fullUser.firstName ?? '',
        lastName: fullUser.lastName ?? '',
        phone: fullUser.phone ?? '',
        dateOfBirth: patient.dateOfBirth ?? '',
        bloodType: patient.bloodType ?? '',
        weightKg: patient.weightKg ?? '',
        heightCm: patient.heightCm ?? '',
        allergies: patient.allergies ?? '',
        medicalHistory: patient.medicalHistory ?? '',
        emergencyContactName: patient.emergencyContactName ?? '',
        emergencyContactPhone: patient.emergencyContactPhone ?? '',
      });
    }
  }, [fullUser, patient, reset]);

  async function onSubmit(values: FormValues) {
    if (!fullUser || !patient) return;

    try {
      const userDto: { firstName?: string; lastName?: string; phone?: string } = {};
      if (values.firstName !== (fullUser.firstName ?? '')) userDto.firstName = values.firstName;
      if (values.lastName !== (fullUser.lastName ?? '')) userDto.lastName = values.lastName;
      if (values.phone !== (fullUser.phone ?? '')) userDto.phone = values.phone;

      const patientDto = {
        dateOfBirth: values.dateOfBirth || undefined,
        bloodType: values.bloodType || undefined,
        weightKg: values.weightKg ? parseFloat(values.weightKg) : undefined,
        heightCm: values.heightCm ? parseFloat(values.heightCm) : undefined,
        allergies: values.allergies || undefined,
        medicalHistory: values.medicalHistory || undefined,
        emergencyContactName: values.emergencyContactName || undefined,
        emergencyContactPhone: values.emergencyContactPhone || undefined,
      };

      await Promise.all([
        Object.keys(userDto).length > 0 ? updateUser({ id: fullUser.id, dto: userDto }) : null,
        updatePatient({ id: patient.id, dto: patientDto }),
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
        <p className="text-sm text-neutral-500">Manage your personal and medical information</p>
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

        {/* Medical Information */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-neutral-900">Medical Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Date of Birth</label>
              <Input
                {...register('dateOfBirth')}
                type="date"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Blood Type</label>
              <select
                {...register('bloodType')}
                className="h-10"
              >
                <option value="">Select blood type</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Weight (kg)</label>
              <Input
                {...register('weightKg')}
                type="number"
                step="0.1"
                min="0"
                className="h-10"
                placeholder="e.g. 65"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Height (cm)</label>
              <Input
                {...register('heightCm')}
                type="number"
                step="0.1"
                min="0"
                className="h-10"
                placeholder="e.g. 170"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Allergies</label>
            <textarea
              {...register('allergies')}
              rows={3}
              className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
              placeholder="List any known allergies"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Medical History</label>
            <textarea
              {...register('medicalHistory')}
              rows={4}
              className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
              placeholder="Describe any previous conditions, surgeries, or ongoing treatments"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-neutral-900">Emergency Contact</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Contact Name</label>
              <Input
                {...register('emergencyContactName')}
                className="h-10"
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Contact Phone</label>
              <Input
                {...register('emergencyContactPhone')}
                type="tel"
                className="h-10"
                placeholder="Phone number"
              />
            </div>
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
    </div>
  );
}