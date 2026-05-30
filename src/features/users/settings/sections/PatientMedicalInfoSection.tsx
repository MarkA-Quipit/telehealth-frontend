import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useUpdatePatient } from '@/features/patients/hooks/usePatient';
import type { Patient } from '@/features/patients/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

interface EmergencyFormValues {
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface MedicalFormValues {
  dateOfBirth: string;
  bloodType: string;
  weightKg: string;
  heightCm: string;
  allergies: string;
  medicalHistory: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
}

interface PatientMedicalInfoSectionProps {
  patient: Patient;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function PatientMedicalInfoSection({ patient, onDirtyChange }: PatientMedicalInfoSectionProps) {
  const { mutateAsync: updateEmergency, isPending: savingEmergency } = useUpdatePatient();
  const { mutateAsync: updateMedical, isPending: savingMedical } = useUpdatePatient();

  const emergencyForm = useForm<EmergencyFormValues>({
    defaultValues: {
      emergencyContactName: patient.emergencyContactName ?? '',
      emergencyContactPhone: patient.emergencyContactPhone ?? '',
    },
  });

  const medicalForm = useForm<MedicalFormValues>({
    defaultValues: {
      dateOfBirth: patient.dateOfBirth ?? '',
      bloodType: patient.bloodType ?? '',
      weightKg: patient.weightKg ?? '',
      heightCm: patient.heightCm ?? '',
      allergies: patient.allergies ?? '',
      medicalHistory: patient.medicalHistory ?? '',
      insuranceProvider: patient.insuranceProvider ?? '',
      insurancePolicyNumber: patient.insurancePolicyNumber ?? '',
    },
  });

  const isEmergencyDirty = emergencyForm.formState.isDirty;
  const isMedicalDirty = medicalForm.formState.isDirty;

  useEffect(() => {
    emergencyForm.reset({
      emergencyContactName: patient.emergencyContactName ?? '',
      emergencyContactPhone: patient.emergencyContactPhone ?? '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  useEffect(() => {
    medicalForm.reset({
      dateOfBirth: patient.dateOfBirth ?? '',
      bloodType: patient.bloodType ?? '',
      weightKg: patient.weightKg ?? '',
      heightCm: patient.heightCm ?? '',
      allergies: patient.allergies ?? '',
      medicalHistory: patient.medicalHistory ?? '',
      insuranceProvider: patient.insuranceProvider ?? '',
      insurancePolicyNumber: patient.insurancePolicyNumber ?? '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  useEffect(() => {
    onDirtyChange?.(isEmergencyDirty || isMedicalDirty);
  }, [isEmergencyDirty, isMedicalDirty, onDirtyChange]);

  async function onSubmitEmergency(values: EmergencyFormValues) {
    try {
      await updateEmergency({
        id: patient.id,
        dto: {
          emergencyContactName: values.emergencyContactName || undefined,
          emergencyContactPhone: values.emergencyContactPhone || undefined,
        },
      });
      emergencyForm.reset(values);
      toast.success('Emergency contact updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }

  async function onSubmitMedical(values: MedicalFormValues) {
    try {
      await updateMedical({
        id: patient.id,
        dto: {
          dateOfBirth: values.dateOfBirth || undefined,
          bloodType: values.bloodType || undefined,
          weightKg: values.weightKg ? parseFloat(values.weightKg) : undefined,
          heightCm: values.heightCm ? parseFloat(values.heightCm) : undefined,
          allergies: values.allergies || undefined,
          medicalHistory: values.medicalHistory || undefined,
          insuranceProvider: values.insuranceProvider || undefined,
          insurancePolicyNumber: values.insurancePolicyNumber || undefined,
        },
      });
      medicalForm.reset(values);
      toast.success('Medical information updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }

  return (
    <div className="space-y-4">
      {/* Emergency Contact */}
      <form onSubmit={emergencyForm.handleSubmit(onSubmitEmergency)} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">Emergency Contact</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Contact Name</label>
            <Input {...emergencyForm.register('emergencyContactName')} className="h-10" placeholder="Full name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Contact Phone</label>
            <Input {...emergencyForm.register('emergencyContactPhone')} type="tel" className="h-10" placeholder="Phone number" />
          </div>
        </div>

        {isEmergencyDirty && (
          <Button type="submit" disabled={savingEmergency} className="disabled:cursor-not-allowed">
            {savingEmergency ? 'Saving…' : 'Save Changes'}
          </Button>
        )}
      </form>

      {/* Medical Information */}
      <form onSubmit={medicalForm.handleSubmit(onSubmitMedical)} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">Medical Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Date of Birth</label>
            <Input {...medicalForm.register('dateOfBirth')} type="date" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Blood Type</label>
            <select
              {...medicalForm.register('bloodType')}
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
            <Input {...medicalForm.register('weightKg')} type="number" step="0.1" min="0" className="h-10" placeholder="e.g. 65" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Height (cm)</label>
            <Input {...medicalForm.register('heightCm')} type="number" step="0.1" min="0" className="h-10" placeholder="e.g. 170" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Allergies</label>
          <textarea
            {...medicalForm.register('allergies')}
            rows={3}
            className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
            placeholder="List any known allergies"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Medical History</label>
          <textarea
            {...medicalForm.register('medicalHistory')}
            rows={4}
            className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
            placeholder="Describe any previous conditions, surgeries, or ongoing treatments"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Insurance Provider</label>
            <Input {...medicalForm.register('insuranceProvider')} className="h-10" placeholder="e.g. PhilHealth, Maxicare" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Policy Number</label>
            <Input {...medicalForm.register('insurancePolicyNumber')} className="h-10" placeholder="Policy ID or number" />
          </div>
        </div>

        {isMedicalDirty && (
          <Button type="submit" disabled={savingMedical} className="disabled:cursor-not-allowed">
            {savingMedical ? 'Saving…' : 'Save Changes'}
          </Button>
        )}
      </form>
    </div>
  );
}
