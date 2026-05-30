import { useState, useCallback } from 'react';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/shared/components/UnsavedChangesDialog';
import { useUser } from '../hooks/useUser';
import { usePatient } from '@/features/patients/hooks/usePatient';
import { useDoctor, useUpdateDoctor } from '@/features/doctors/hooks/useDoctors';
import { ProfilePhotoSection } from './sections/ProfilePhotoSection';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { PatientMedicalInfoSection } from './sections/PatientMedicalInfoSection';
import { PatientDocumentsSection } from './sections/PatientDocumentsSection';
import { DoctorProfessionalInfoSection } from './sections/DoctorProfessionalInfoSection';

type OpenSection = 'personal' | 'professional';

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-neutral-200 ${className ?? ''}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-7 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <div className="space-y-4">
          <SkeletonBlock className="h-28 w-full" />
          <SkeletonBlock className="h-48 w-full" />
          <SkeletonBlock className="h-20 w-full" />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const [openSection, setOpenSection] = useState<OpenSection>('professional');
  const [dirtyMap, setDirtyMap] = useState({ personal: false, professional: false, medical: false });
  const isAnyDirty = Object.values(dirtyMap).some(Boolean);
  const { blocker } = useUnsavedChanges(isAnyDirty);

  // Each callback is individually memoized so its reference is stable across renders.
  // Calling handleDirtyChange('key') inline in JSX would create a new function every
  // render, causing the child useEffect([isDirty, onDirtyChange]) to loop infinitely.
  const handlePersonalDirtyChange = useCallback(
    (isDirty: boolean) => setDirtyMap((prev) => ({ ...prev, personal: isDirty })),
    [],
  );
  const handleProfessionalDirtyChange = useCallback(
    (isDirty: boolean) => setDirtyMap((prev) => ({ ...prev, professional: isDirty })),
    [],
  );
  const handleMedicalDirtyChange = useCallback(
    (isDirty: boolean) => setDirtyMap((prev) => ({ ...prev, medical: isDirty })),
    [],
  );

  const { user: authUser } = useAuthContext();
  const { data: fullUser, isLoading: userLoading } = useUser(authUser?.id);

  const isDoctor = authUser?.roles.includes('doctor') ?? false;

  const { data: patient, isLoading: patientLoading } = usePatient(
    !isDoctor ? (fullUser?.patientId ?? null) : null
  );
  const { data: doctor, isLoading: doctorLoading } = useDoctor(
    isDoctor ? (fullUser?.doctorId ?? null) : null
  );
  const { mutate: updateDoctor, isPending: updatingDoctor } = useUpdateDoctor();

  const isLoading = userLoading || (!isDoctor && patientLoading) || (isDoctor && doctorLoading);

  if (isLoading) return <PageSkeleton />;

  if (!fullUser) {
    return (
      <div className="text-sm text-neutral-500 py-8 text-center">Could not load user data.</div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My Profile</h1>
        <p className="text-sm text-neutral-500">
          {isDoctor
            ? 'Manage your professional information and preferences'
            : 'Manage your personal and medical information'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left column — identity + doctor availability toggle */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <ProfilePhotoSection user={fullUser} />

          {isDoctor && doctor && (
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Accepting new patients</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Toggle off to pause new bookings</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={doctor.isAcceptingPatients}
                  onClick={() =>
                    updateDoctor({
                      id: doctor.id,
                      dto: { isAcceptingPatients: !doctor.isAcceptingPatients },
                    })
                  }
                  disabled={updatingDoctor}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    doctor.isAcceptingPatients ? 'bg-sky-400' : 'bg-neutral-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      doctor.isAcceptingPatients ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column — editable sections */}
        <div className="space-y-3">
          {isDoctor ? (
            <>
              <PersonalInfoSection
                user={fullUser}
                collapsible={{
                  isOpen: openSection === 'personal',
                  onToggle: () => setOpenSection('personal'),
                }}
                onDirtyChange={handlePersonalDirtyChange}
              />
              {doctor && (
                <DoctorProfessionalInfoSection
                  doctor={doctor}
                  collapsible={{
                    isOpen: openSection === 'professional',
                    onToggle: () => setOpenSection('professional'),
                  }}
                  onDirtyChange={handleProfessionalDirtyChange}
                />
              )}
            </>
          ) : (
            <>
              <PersonalInfoSection
                user={fullUser}
                onDirtyChange={handlePersonalDirtyChange}
              />
              {patient && (
                <PatientMedicalInfoSection
                  patient={patient}
                  onDirtyChange={handleMedicalDirtyChange}
                />
              )}
              {patient && <PatientDocumentsSection patientId={patient.id} />}
            </>
          )}
        </div>
      </div>
    </div>
    <UnsavedChangesDialog blocker={blocker} />
    </>
  );
}
