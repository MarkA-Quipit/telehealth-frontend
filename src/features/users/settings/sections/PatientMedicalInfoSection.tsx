import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUpdatePatient } from '@/features/patients/hooks/usePatient';
import type { Patient } from '@/features/patients/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

interface MedicalFormValues {
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

interface PatientMedicalInfoSectionProps {
  patient: Patient;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function PatientMedicalInfoSection({ patient, onDirtyChange }: PatientMedicalInfoSectionProps) {
  const { mutateAsync: updatePatient, isPending } = useUpdatePatient();
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<MedicalFormValues>({
    defaultValues: {
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
    },
  });

  useEffect(() => {
    reset({
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
  }, [patient, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  async function onSubmit(values: MedicalFormValues) {
    try {
      await updatePatient({
        id: patient.id,
        dto: {
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
        },
      });
      reset(values);
      toast.success('Medical information updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Medical Information */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">Medical Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Date of Birth</label>
            <Input {...register('dateOfBirth')} type="date" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Blood Type</label>
            <select
              {...register('bloodType')}
              className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
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
            <Input {...register('weightKg')} type="number" step="0.1" min="0" className="h-10" placeholder="e.g. 65" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Height (cm)</label>
            <Input {...register('heightCm')} type="number" step="0.1" min="0" className="h-10" placeholder="e.g. 170" />
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
            <Input {...register('insuranceProvider')} className="h-10" placeholder="e.g. PhilHealth, Maxicare" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Policy Number</label>
            <Input {...register('insurancePolicyNumber')} className="h-10" placeholder="Policy ID or number" />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">Emergency Contact</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Contact Name</label>
            <Input {...register('emergencyContactName')} className="h-10" placeholder="Full name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Contact Phone</label>
            <Input {...register('emergencyContactPhone')} type="tel" className="h-10" placeholder="Phone number" />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="disabled:cursor-not-allowed">
        {isPending ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  );
}
