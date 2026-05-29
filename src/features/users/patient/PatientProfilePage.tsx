import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser, useUpdateUser, useChangePassword } from '../hooks/useUser';
import { useLogoutAll } from '@/features/auth/hooks/useAuth';
import { usePatient, useUpdatePatient, useDocuments, useUploadDocument } from '@/features/patients/hooks/usePatient';
import { formatDateUTC } from '@/shared/lib/date';
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
  insuranceProvider: string;
  insurancePolicyNumber: string;
}

function DocumentsSection({ patientId }: { patientId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: documents = [], isLoading } = useDocuments(patientId);
  const { mutateAsync: doUpload, isPending: uploading } = useUploadDocument(patientId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await doUpload(file);
      toast.success('Document uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-900">Medical Documents</h3>
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading…' : '+ Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-neutral-500">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className="text-neutral-800 truncate">{doc.fileName}</p>
                <p className="text-xs text-neutral-400">{formatDateUTC(doc.uploadedAt.split('T')[0])}</p>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 ml-3 text-xs font-medium text-sky-700 hover:text-sky-600 transition"
              >
                View →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
      insuranceProvider: '',
      insurancePolicyNumber: '',
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
        insuranceProvider: patient.insuranceProvider ?? '',
        insurancePolicyNumber: patient.insurancePolicyNumber ?? '',
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
        insuranceProvider: values.insuranceProvider || undefined,
        insurancePolicyNumber: values.insurancePolicyNumber || undefined,
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Insurance Provider</label>
              <Input
                {...register('insuranceProvider')}
                className="h-10"
                placeholder="e.g. PhilHealth, Maxicare"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Policy Number</label>
              <Input
                {...register('insurancePolicyNumber')}
                className="h-10"
                placeholder="Policy ID or number"
              />
            </div>
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

      {/* Medical Documents */}
      {patient && <DocumentsSection patientId={patient.id} />}

      {/* Change Password */}
      <ChangePasswordSection userId={fullUser.id} />

      {/* Logout all devices */}
      <LogoutAllSection />
    </div>
  );
}